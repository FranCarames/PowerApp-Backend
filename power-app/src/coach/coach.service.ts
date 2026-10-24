import { Injectable } from '@nestjs/common';
import { instanceToPlain } from 'class-transformer';
import { Response } from 'express';

import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Coach } from '../entities/coach.entity';
import { PromoteCoachDto } from '../dtos/coach/promote_coach.dto';
// import { ExercisedMuscle } from '../entities/exercised_muscle.entity';
// import { MusclesService } from '../muscles/muscles.service';
import { UsersService } from '../users/users.service';
import { User, UserRole } from '../entities/user.entity';
import { isDatabaseError } from '../common/database_error';

// Los textos de promote_user (CU-A-17). Los dos 409 salen por dos caminos: la consulta previa y el
// unico de la base (uk_coach_email y uk_coach_cuil), por si dos altas chocan en el medio
const PROMOTE_ADMIN_ERROR = 'No se puede convertir en entrenador a un administrador.';
const DUPLICATE_COACH_EMAIL_ERROR = 'Ya existe un entrenador con ese email profesional';
const DUPLICATE_COACH_CUIL_ERROR = 'Ya existe un entrenador con ese CUIL';

@Injectable()
export class CoachService {
    constructor(
        @InjectRepository(Coach)
        private coachRepository: Repository<Coach>,
        private userService: UsersService,
        @InjectDataSource()
        private dataSource: DataSource,
    ) {
    }

    async getAllCoaches(
        res: Response
    ) {
        try {
            const coaches = await this.coachRepository.find();
            res.status(200).send(instanceToPlain(coaches));
        } catch (error) {
            console.error(error);
            res.status(500).send({ error: 'Error al obtener los entrenadores' });
        }
    }

    async getCoachById(idCoach: string): Promise<Coach | null> {
        return this.coachRepository.findOne({ where: { id: idCoach } });
    }

    async getCoachId(
        idCoach: string,
        res: Response
    ) {
        try {
            const coach = await this.coachRepository.findOne({ where: { id: idCoach } });

            if (!coach) {
                return res.status(404).send({ error: 'Entrenador no encontrado' });
            }
            res.status(200).send(instanceToPlain(coach));
        } catch (error) {
            console.error(error);
            res.status(404).send({ error: 'Error al obtener el entrenador' });
        }
    }

    // CU-A-17 y, por decision del 16/10, tambien CU-A-18: sobre un entrenador que ya existe (dado de
    // baja o activo) el mismo endpoint reactiva y edita sus datos profesionales. El rol y el Coach se
    // escriben juntos o ninguno de los dos (savePromotion). Un admin no se convierte en entrenador:
    // perderia su acceso (decision del 24/10)
    async promoteUserToCoach(
        promoteCoachDto: PromoteCoachDto,
        res: Response
    ) {
        try {
            const user = await this.userService._getUserById(promoteCoachDto.user_id);

            if (!user) {
                return res.status(404).send({ error: 'Usuario no encontrado' });
            }

            if (user.role === UserRole.admin) {
                return res.status(400).send({ error: PROMOTE_ADMIN_ERROR });
            }

            // Si ya hay un Coach con este id (un entrenador dado de baja que vuelve, o uno activo que
            // se edita), se reutiliza: su propio email y su propio CUIL no cuentan como repetidos
            const existingCoach = await this.coachRepository.findOne({ where: { id: promoteCoachDto.user_id } });

            // Se comparan contra TODOS los entrenadores, tambien los dados de baja: los unicos de la
            // base no distinguen. Se informa un solo repetido por vez
            const emailOwner = await this.coachRepository.findOne({ where: { coach_email: promoteCoachDto.coach_email } });

            if (emailOwner && emailOwner.id.toLowerCase() !== user.id.toLowerCase()) {
                return res.status(409).send({ error: DUPLICATE_COACH_EMAIL_ERROR });
            }

            const cuilOwner = await this.coachRepository.findOne({ where: { cuil: promoteCoachDto.cuil } });

            if (cuilOwner && cuilOwner.id.toLowerCase() !== user.id.toLowerCase()) {
                return res.status(409).send({ error: DUPLICATE_COACH_CUIL_ERROR });
            }

            const { coachUser, coachRegister } = await this.savePromotion(user, existingCoach, promoteCoachDto);

            return this.handleCoachPromotionResponse(res, coachUser, coachRegister);
        } catch (error) {
            // Dos altas simultaneas pasan las dos la consulta previa y la segunda choca con el unico:
            // es el mismo 409. Se mira el nombre del unico para no disfrazar otro error
            if (isDatabaseError(error, '23505', 'uk_coach_email')) {
                return res.status(409).send({ error: DUPLICATE_COACH_EMAIL_ERROR });
            }

            if (isDatabaseError(error, '23505', 'uk_coach_cuil')) {
                return res.status(409).send({ error: DUPLICATE_COACH_CUIL_ERROR });
            }

            console.error(error);
            return res.status(500).send({ error: 'Error al promover al entrenador' });
        }
    }

    // El rol del User y el registro Coach, en una transaccion: antes el rol se cambiaba primero y, si
    // el Coach no se podia guardar (un email repetido), el usuario quedaba con role = coach y sin su
    // Coach. updated_at se setea a mano: el onUpdate de las entidades es sintaxis de MySQL
    private async savePromotion(
        user: User,
        existingCoach: Coach | null,
        promoteCoachDto: PromoteCoachDto
    ): Promise<{ coachUser: User; coachRegister: Coach }> {
        const queryRunner = this.dataSource.createQueryRunner();

        try {
            // Dentro del try: si falla la conexion o el inicio de la transaccion, el finally libera
            // igual el query runner (release sobre uno sin conectar no hace nada)
            await queryRunner.connect();
            await queryRunner.startTransaction();

            const now = new Date();

            user.role = UserRole.coach;
            user.updated_at = now;
            const coachUser = await queryRunner.manager.save(User, user);

            const coach = existingCoach ?? this.coachRepository.create({ id: promoteCoachDto.user_id });
            coach.coach_email = promoteCoachDto.coach_email;
            coach.cuil = promoteCoachDto.cuil;
            coach.active = true;
            coach.updated_at = now;
            const coachRegister = await queryRunner.manager.save(Coach, coach);

            await queryRunner.commitTransaction();

            return { coachUser, coachRegister };
        } catch (error) {
            if (queryRunner.isTransactionActive) {
                await queryRunner.rollbackTransaction();
            }

            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    private handleCoachPromotionResponse(res: Response, coachUser?: (User | null), coachRegister?: (Coach | null)) {
        if (coachUser && coachRegister) {
            coachUser.coach = coachRegister;
            return res.status(200).send(instanceToPlain(coachUser));
        } else {
            return res.status(500).send({ error: 'Error al promover al entrenador' });
        }
    }

    async deleteCoach(
        idCoach: string,
        res: Response
    ) {
        try {
            const userCoach = await this.userService._getUserById(idCoach);

            if (!userCoach) {
                return res.status(404).send({ error: 'Usuario no encontrado' });
            }

            const coach = await this.coachRepository.findOne({ where: { id: idCoach } });

            if (coach) {
                coach.active = false;

                const coachUser = await this.userService.updateUserRole(idCoach, UserRole.user);
                const coachRegister = await this.coachRepository.save(coach);

                this.handleCoachPromotionResponse(res, coachUser, coachRegister);
            } else {
                return res.status(404).send({ error: 'Coach no encontrado' });
            }
        } catch (error) {
            console.error(error);
            return res.status(500).send({ error: 'Error al eliminar al entrenador' });
        }
    }
}

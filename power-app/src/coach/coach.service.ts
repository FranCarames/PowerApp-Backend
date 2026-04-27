import { Injectable } from '@nestjs/common';
import e, { Response } from 'express';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Coach } from '../entities/coach.entity';
import { PromoteCoachDto } from '../dtos/coach/promote_coach.dto';
// import { ExercisedMuscle } from '../entities/exercised_muscle.entity';
// import { MusclesService } from '../muscles/muscles.service';
import { UsersService } from '../users/users.service';
import { AuthService } from '../authentication/auth.service';
import { User, UserRole } from '../entities/user.entity';

@Injectable()
export class CoachService {
    constructor(
        @InjectRepository(Coach)
        private coachRepository: Repository<Coach>,
        private userService: UsersService,
        private authService: AuthService
    ) {
    }

    async getAllCoaches(
        res: Response
    ) {
        try {
            const coaches = await this.coachRepository.find();
            res.status(200).send(coaches);
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
            res.status(200).send(coach);
        } catch (error) {
            console.error(error);
            res.status(404).send({ error: 'Error al obtener el entrenador' });
        }
    }

    async promoteUserToCoach(
        accessToken: string,
        promoteCoachDto: PromoteCoachDto,
        res: Response
    ) {
        try {
            const adminId = await this.authService.verifyAdminJwtToken(accessToken);

            if (adminId) {
                const user = await this.userService.getUserById(promoteCoachDto.user_id);

                if (!user) {
                    return res.status(404).send({ error: 'Usuario no encontrado' });
                }

                // Primero, antes de crear el nuevo registro tengo que revisar si ya exite un registro de coach con el mismo id de usuario, si existe, tengo que activar el registro anterior
                const existingCoach = await this.coachRepository.findOne({ where: { id: promoteCoachDto.user_id } });

                if (existingCoach) {
                    existingCoach.coach_email = promoteCoachDto.coach_email;
                    existingCoach.cuil = promoteCoachDto.cuil;
                    existingCoach.active = true;

                    const coachUser = await this.userService.updateUserRole(promoteCoachDto.user_id, UserRole.coach);
                    
                    const coachRegister = await this.coachRepository.save(existingCoach);

                    this.handleCoachPromotionResponse(res, coachUser, coachRegister);
                } else {
                    const newCoach = this.coachRepository.create({
                        id: promoteCoachDto.user_id,
                        coach_email: promoteCoachDto.coach_email,
                        cuil: promoteCoachDto.cuil,
                    });

                    const coachUser = await this.userService.updateUserRole(promoteCoachDto.user_id, UserRole.coach);

                    const coachRegister = await this.coachRepository.save(newCoach);

                    this.handleCoachPromotionResponse(res, coachUser, coachRegister);
                }
            } else {
                return res.status(403).send({ error: 'Acceso denegado. Se requieren privilegios de administrador.' });
            }
        } catch (error) {
            console.error(error);
            return res.status(500).send({ error: 'Error al promover al entrenador' });
        }
    }

    private handleCoachPromotionResponse(res: Response, coachUser?: (User | null), coachRegister?: (Coach | null)) {
        if (coachUser && coachRegister) {
            coachUser.coach = coachRegister;
            return res.status(200).send(coachUser);
        } else {
            return res.status(500).send({ error: 'Error al promover al entrenador' });
        }
    }

    async deleteCoach(
        accessToken: string,
        idCoach: string,
        res: Response
    ) {
        try {
            const adminId = await this.authService.verifyAdminJwtToken(accessToken);

            if (adminId) {
                const userCoach = await this.userService.getUserById(idCoach);

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
            } else {
                return res.status(403).send({ error: 'Acceso denegado. Se requieren privilegios de administrador.' });
            }
        } catch (error) {
            console.error(error);
            return res.status(500).send({ error: 'Error al eliminar al entrenador' });
        }
    }
}
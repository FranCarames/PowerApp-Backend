import { Injectable } from '@nestjs/common';
import { Response } from 'express';

import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager, In, QueryRunner, SelectQueryBuilder } from 'typeorm';
import { Planification } from '../entities/planification.entity';
import { Routine } from '../entities/routine.entity';
import { RoutineAsignation } from '../entities/routine_asignation.entity';
import { GetPlanificationsQueryDto } from '../dtos/planification/get_planifications_query.dto';
import { CreatePlanificationDto } from '../dtos/planification/create_planification.dto';
import { CreatePlanificationWeekDto } from '../dtos/planification/create_planification_week.dto';
import { EditPlanificationDto } from '../dtos/planification/edit_planification.dto';
import { RepeatPlanificationWeekDto } from '../dtos/planification/repeat_planification_week.dto';
import { ReorderPlanificationWeekDto } from '../dtos/planification/reorder_planification_week.dto';
import { SetPlanificationActiveDto } from '../dtos/planification/set_planification_active.dto';
import { AssignRoutineToPlanificationDto } from '../dtos/planification/assign_routine_to_planification.dto';
import { AssignRoutinesToPlanificationDto } from '../dtos/planification/assign_routines_to_planification.dto';
import { SetRoutineAsignationActiveDto } from '../dtos/planification/set_routine_asignation_active.dto';
import { SetRoutineAsignationsActiveDto } from '../dtos/planification/set_routine_asignations_active.dto';
import { AssignPlanificationToUserDto } from '../dtos/planification/assign_planification_to_user.dto';
import { SetUserPlanificationActiveDto } from '../dtos/planification/set_user_planification_active.dto';
import { GetUserPlanificationsQueryDto } from '../dtos/planification/get_user_planifications_query.dto';
import { UserPlanification } from '../entities/user_planification.entity';
import { User, UserRole } from '../entities/user.entity';
import { Coach } from '../entities/coach.entity';
import { AuthUser } from '../authentication/auth-user.interface';
import { defaultPlanEndDate } from './plan_weeks';

// Los textos que comparten las operaciones que arman el contenido de un plan: el alta con semanas, el
// lote, repetir una semana y reordenarla. Para el mismo problema tienen que decir exactamente lo mismo
// (plan BE-42, 3.5.1), asi que se definen una vez
const PLANIFICATION_NOT_FOUND_ERROR = 'Planificación no encontrada';
const PLANIFICATION_INACTIVE_ERROR = 'La planificación está dada de baja. Reactivala antes de asignarle rutinas.';
const ROUTINES_NOT_FOUND_ERROR = 'Algunas rutinas no fueron encontradas';
const WEEK_REPEATED_ERROR = 'Una semana aparece más de una vez.';
const weekWithoutRoutinesError = (week: number) => `La semana ${week} no tiene rutinas para repetir.`;
const weekListMismatchError = (week: number) =>
    `La lista no coincide con las rutinas vigentes de la semana ${week}. Recargá la planificación.`;
const inactiveRoutinesError = (routines: Routine[]) => {
    const nombres = routines.map(routine => `'${routine.name}'`).join(', ');
    return `Estas rutinas están dadas de baja y no pueden asignarse: ${nombres}.`;
};

// Un rechazo ya resuelto: el handler lo manda tal cual despues de deshacer la transaccion
interface Rejection {
    status: number;
    error: string;
}

@Injectable()
export class PlanificationService {
    constructor(
        @InjectRepository(Planification)
        private planificationRepository: Repository<Planification>,
        @InjectRepository(Routine)
        private routineRepository: Repository<Routine>,
        @InjectRepository(RoutineAsignation)
        private routineAsignationRepository: Repository<RoutineAsignation>,
        @InjectDataSource()
        private dataSource: DataSource,
        @InjectRepository(UserPlanification)
        private userPlanificationRepository: Repository<UserPlanification>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(Coach)
        private coachRepository: Repository<Coach>,
    ) {
    }

    // ===================== PLANIFICACIONES SISTEMICAS (CU-E-08 a CU-E-11) =====================

    async getAllPlanifications(
        query: GetPlanificationsQueryDto,
        res: Response
    ) {
        try {
            // Los vinculos dados de baja no cuentan: routine_count es de rutinas vigentes.
            // El true va literal y no como parametro para no pisar el :active que
            // buildPlanificationsQuery usa para filtrar las planificaciones de baja
            const planifications = await this.buildPlanificationsQuery(query)
                .loadRelationCountAndMap(
                    'planification.routine_count',
                    'planification.routineAsignations',
                    'routineAsignation',
                    queryBuilder => queryBuilder.andWhere('routineAsignation.active = true'),
                )
                .getMany();

            res.status(200).send(planifications);
        } catch (error) {
            console.error(error);
            res.status(500).send({ error: 'Error al obtener las planificaciones.' });
        }
    }

    async getAllPlanificationsPlus(
        query: GetPlanificationsQueryDto,
        res: Response
    ) {
        try {
            // Con las rutinas ya cargadas, el conteo sale del array
            const planifications = await this.buildPlanificationsQuery(query)
                .leftJoinAndSelect('planification.routineAsignations', 'routineAsignation', 'routineAsignation.active = true')
                .leftJoinAndSelect('routineAsignation.routine', 'routine')
                .addOrderBy('routineAsignation.week', 'ASC')
                .addOrderBy('routineAsignation.order', 'ASC')
                // Desempate: el order puede estar duplicado, asi que sin esto el
                // orden no es deterministico y la pantalla se reordena sola
                .addOrderBy('routineAsignation.created_at', 'ASC')
                .getMany();

            // Cada fila tiene la misma forma que el detalle, asi que reusa su builder
            const response = planifications.map(
                planification => this.buildPlanificationDetailResponse(planification)
            );

            res.status(200).send(response);
        } catch (error) {
            console.error(error);
            res.status(500).send({ error: 'Error al obtener las planificaciones.' });
        }
    }

    // Responde tambien para planificaciones inactivas, espejo del detalle de rutina
    async getPlanificationById(
        idPlanification: string,
        res: Response
    ) {
        try {
            const planification = await this.findPlanificationDetail(idPlanification);

            if (!planification) {
                return res.status(404).send({ error: 'Planificación no encontrada' });
            }

            res.status(200).send(this.buildPlanificationDetailResponse(planification));
        } catch (error) {
            console.error(error);
            res.status(500).send({ error: 'Error al obtener la planificación.' });
        }
    }

    // La cabecera y las rutinas de cada semana (weeks) se guardan en UNA transaccion: todo o nada
    // (CU-E-09, regla 3). Sin weeks inserta solo la cabecera, como siempre. El orden de las
    // validaciones es parte del contrato (plan BE-42, 3.5.1): semana repetida, primera semana fuera de
    // la duracion, rutinas inexistentes y rutinas de baja
    async createPlanification(
        createPlanificationDto: CreatePlanificationDto,
        res: Response
    ) {
        const weeks = createPlanificationDto.weeks ?? [];

        // Las dos primeras no dependen de la base: se rechazan antes de abrir la transaccion
        const weeksError = this.validateCreateWeeks(weeks, createPlanificationDto.duration);
        if (weeksError) {
            return res.status(400).send({ error: weeksError });
        }

        const queryRunner = this.dataSource.createQueryRunner();

        try {
            await queryRunner.connect();
            await queryRunner.startTransaction();

            // Las rutinas de TODAS las semanas se validan juntas, con una sola consulta
            const rejection = await this.checkRoutinesAssignable(
                queryRunner.manager,
                weeks.flatMap(week => week.routine_ids),
            );
            if (rejection) {
                return this.rejectAndRollback(queryRunner, res, rejection);
            }

            const planification = await queryRunner.manager.save(
                queryRunner.manager.create(Planification, {
                    name: createPlanificationDto.name,
                    number_of_routines: createPlanificationDto.number_of_routines,
                    description: createPlanificationDto.description ?? null,
                    type: createPlanificationDto.type ?? null,
                    duration: createPlanificationDto.duration,
                })
            );

            // La planificacion es nueva: cada semana empieza en 1
            for (const week of weeks) {
                await this.insertWeekRoutines(queryRunner.manager, planification.id, week.week, week.routine_ids, 1);
            }

            await queryRunner.commitTransaction();

            // Se recarga para devolver el mismo formato que GET /:id
            const created = await this.findPlanificationDetail(planification.id);
            return res.status(201).send(this.buildPlanificationDetailResponse(created!));
        } catch (error) {
            if (queryRunner.isTransactionActive) {
                await queryRunner.rollbackTransaction();
            }
            console.error(error);
            res.status(500).send({ error: 'Error al crear la planificación.' });
        } finally {
            await queryRunner.release();
        }
    }

    async editPlanification(
        idPlanification: string,
        editPlanificationDto: EditPlanificationDto,
        res: Response
    ) {
        try {
            const planification = await this.planificationRepository.findOne({
                where: { id: idPlanification },
            });

            if (!planification) {
                return res.status(404).send({ error: 'Planificación no encontrada' });
            }

            // Precondicion del CU. Espejo del 400 de editRoutine y editCircuit:
            // para editar una planificacion de baja hay que reactivarla primero
            if (!planification.active) {
                return res.status(400).send({
                    error: 'La planificación está dada de baja y no puede editarse. Reactivala primero.'
                });
            }

            // Achicar la duracion por debajo de una semana en uso dejaria rutinas fuera del plan.
            // Solo cuentan las VIGENTES: una dada de baja puede quedar en una semana que ya no
            // existe, y reincorporarla se rechaza ahi (set-active). Con 0 no hay tope
            if (editPlanificationDto.duration > 0) {
                const maxWeek = await this.maxActiveWeek(planification.id);
                if (maxWeek > editPlanificationDto.duration) {
                    return res.status(400).send({
                        error: `La planificación tiene rutinas en la semana ${maxWeek}: la duración no puede ser menor.`
                    });
                }
            }

            // El body es el estado completo de la cabecera: lo que no viene se BORRA.
            // Por eso los dos opcionales van a null explicito y no a undefined, que
            // TypeORM ignoraria dejando el valor viejo. La duracion es obligatoria
            planification.name = editPlanificationDto.name;
            planification.number_of_routines = editPlanificationDto.number_of_routines;
            planification.description = editPlanificationDto.description ?? null;
            planification.type = editPlanificationDto.type ?? null;
            planification.duration = editPlanificationDto.duration;

            await this.planificationRepository.save(planification);

            const updated = await this.findPlanificationDetail(planification.id);
            return res.status(200).send(this.buildPlanificationDetailResponse(updated!));
        } catch (error) {
            console.error(error);
            res.status(500).send({ error: 'Error al editar la planificación.' });
        }
    }

    // El mismo endpoint da de baja y reactiva, igual que setRoutineActive
    async setPlanificationActive(
        idPlanification: string,
        setPlanificationActiveDto: SetPlanificationActiveDto,
        res: Response
    ) {
        try {
            const planification = await this.planificationRepository.findOne({
                where: { id: idPlanification },
            });

            if (!planification) {
                return res.status(404).send({ error: 'Planificación no encontrada' });
            }

            // La baja no cascadea nada: ni las Routine_Asignation ni las User_Planification
            // se tocan. El plan sale de circulacion como plantilla para asignaciones NUEVAS,
            // lo ya asignado mantiene su integridad y el alumno lo sigue viendo
            planification.active = setPlanificationActiveDto.active;
            await this.planificationRepository.save(planification);

            res.status(200).send(planification);
        } catch (error) {
            console.error(error);
            res.status(500).send({ error: 'Error al actualizar el estado de la planificación.' });
        }
    }

    // ===================== ASIGNACION DE RUTINAS (CU-E-12) =====================

    async assignRoutineToPlanification(
        assignRoutineDto: AssignRoutineToPlanificationDto,
        res: Response
    ) {
        try {
            const planification = await this.planificationRepository.findOne({
                where: { id: assignRoutineDto.planification_id },
            });

            if (!planification) {
                return res.status(404).send({ error: PLANIFICATION_NOT_FOUND_ERROR });
            }

            if (!planification.active) {
                return res.status(400).send({ error: PLANIFICATION_INACTIVE_ERROR });
            }

            const weekError = this.weekOutOfDuration(assignRoutineDto.week, planification.duration);
            if (weekError) {
                return res.status(400).send({ error: weekError });
            }

            const routine = await this.routineRepository.findOne({
                where: { id: assignRoutineDto.routine_id },
            });

            if (!routine) {
                return res.status(404).send({ error: 'Rutina no encontrada' });
            }

            // Con el nombre en el mensaje: un 404 seria mentira y mandaria al front a
            // buscar un bug de ids inexistente. Mismo criterio que E-16 con los circuitos
            if (!routine.active) {
                return res.status(400).send({
                    error: `La rutina '${routine.name}' está dada de baja y no puede asignarse.`
                });
            }

            // Sin order explicito va al final DE ESA SEMANA. Con order se persiste TAL CUAL,
            // aunque la posicion ya este ocupada: no se desplaza ni se renumera nada, y el order
            // puede quedar duplicado. Es la decision del 4/9
            const order = assignRoutineDto.order
                ?? await this.nextOrder(assignRoutineDto.planification_id, assignRoutineDto.week);

            await this.routineAsignationRepository.save(
                this.routineAsignationRepository.create({
                    routine_id: assignRoutineDto.routine_id,
                    planification_id: assignRoutineDto.planification_id,
                    week: assignRoutineDto.week,
                    order,
                })
            );

            const actualizada = await this.findPlanificationDetail(assignRoutineDto.planification_id);
            return res.status(201).send(this.buildPlanificationDetailResponse(actualizada!));
        } catch (error) {
            console.error(error);
            res.status(500).send({ error: 'Error al asignar la rutina a la planificación.' });
        }
    }

    async assignRoutinesToPlanification(
        assignRoutinesDto: AssignRoutinesToPlanificationDto,
        res: Response
    ) {
        const queryRunner = this.dataSource.createQueryRunner();

        try {
            // Dentro del try: si falla la conexion o el inicio de la transaccion, el finally
            // libera igual el query runner (release sobre uno sin conectar no hace nada)
            await queryRunner.connect();
            await queryRunner.startTransaction();

            const planification = await queryRunner.manager.findOne(Planification, {
                where: { id: assignRoutinesDto.planification_id },
            });

            if (!planification) {
                return this.rejectAndRollback(queryRunner, res, { status: 404, error: PLANIFICATION_NOT_FOUND_ERROR });
            }

            if (!planification.active) {
                return this.rejectAndRollback(queryRunner, res, { status: 400, error: PLANIFICATION_INACTIVE_ERROR });
            }

            const weekError = this.weekOutOfDuration(assignRoutinesDto.week, planification.duration);
            if (weekError) {
                return this.rejectAndRollback(queryRunner, res, { status: 400, error: weekError });
            }

            // Lo comparte con el alta con semanas y con repetir una semana: existen y estan vigentes
            const rejection = await this.checkRoutinesAssignable(queryRunner.manager, assignRoutinesDto.routine_ids);
            if (rejection) {
                return this.rejectAndRollback(queryRunner, res, rejection);
            }

            // Consecutivas desde el final de la semana, en el orden del array
            const firstOrder = await this.nextOrder(
                assignRoutinesDto.planification_id,
                assignRoutinesDto.week,
                queryRunner.manager,
            );

            await this.insertWeekRoutines(
                queryRunner.manager,
                assignRoutinesDto.planification_id,
                assignRoutinesDto.week,
                assignRoutinesDto.routine_ids,
                firstOrder,
            );

            await queryRunner.commitTransaction();

            const actualizada = await this.findPlanificationDetail(assignRoutinesDto.planification_id);
            return res.status(201).send(this.buildPlanificationDetailResponse(actualizada!));
        } catch (error) {
            if (queryRunner.isTransactionActive) {
                await queryRunner.rollbackTransaction();
            }
            console.error(error);
            res.status(500).send({ error: 'Error al asignar las rutinas a la planificación.' });
        } finally {
            await queryRunner.release();
        }
    }

    async setRoutineAsignationActive(
        idRoutineAsignation: string,
        setActiveDto: SetRoutineAsignationActiveDto,
        res: Response
    ) {
        // week y order solo tienen sentido al reactivar. Aceptarlos en silencio con
        // active = false esconderia un bug del cliente
        if (!setActiveDto.active && (setActiveDto.week !== undefined || setActiveDto.order !== undefined)) {
            return res.status(400).send({
                error: 'Los campos week y order sólo aplican al reactivar una asignación.'
            });
        }

        try {
            const asignacion = await this.routineAsignationRepository.findOne({
                where: { id: idRoutineAsignation },
            });

            if (!asignacion) {
                return res.status(404).send({ error: 'Asignación no encontrada' });
            }

            if (setActiveDto.active) {
                // Sin week ni order vuelve a su lugar: la baja se los conservo (D10). Con week
                // y sin order va al final de esa semana; con order se guarda tal cual
                const week = setActiveDto.week ?? asignacion.week;

                // La duracion pudo achicarse mientras estaba de baja: editPlanification solo
                // mira las vigentes. El plan siempre existe (FK NOT NULL con CASCADE)
                const planification = await this.planificationRepository.findOne({
                    where: { id: asignacion.planification_id },
                });
                const weekError = this.weekOutOfDuration(week, planification!.duration);
                if (weekError) {
                    return res.status(400).send({ error: `${weekError} Indicá una semana válida.` });
                }

                if (setActiveDto.order !== undefined) {
                    asignacion.order = setActiveDto.order;
                } else if (setActiveDto.week !== undefined) {
                    asignacion.order = await this.nextOrder(asignacion.planification_id, week);
                }
                asignacion.week = week;
            }
            // La baja (active = false) solo apaga el flag: el resto del plan no se renumera y la
            // rutina conserva su semana y su orden

            asignacion.active = setActiveDto.active;
            await this.routineAsignationRepository.save(asignacion);

            res.status(200).send(asignacion);
        } catch (error) {
            console.error(error);
            res.status(500).send({ error: 'Error al actualizar el estado de la asignación.' });
        }
    }

    async setRoutineAsignationsActive(
        setActiveDto: SetRoutineAsignationsActiveDto,
        res: Response
    ) {
        const ids = setActiveDto.routine_asignation_ids;

        if (new Set(ids).size !== ids.length) {
            return res.status(400).send({
                error: 'La lista de asignaciones tiene ids repetidos.'
            });
        }

        const queryRunner = this.dataSource.createQueryRunner();

        try {
            // Dentro del try: si falla la conexion o el inicio de la transaccion, el finally
            // libera igual el query runner (release sobre uno sin conectar no hace nada)
            await queryRunner.connect();
            await queryRunner.startTransaction();

            const asignaciones = await queryRunner.manager.find(RoutineAsignation, {
                where: { id: In(ids) },
            });

            if (asignaciones.length !== ids.length) {
                await queryRunner.rollbackTransaction();
                return res.status(404).send({ error: 'Algunas asignaciones no fueron encontradas' });
            }

            // Reincorporar: cada una vuelve a su lugar, pero la duracion pudo achicarse mientras
            // estaba de baja. Se valida TODO antes de guardar nada (es todo o nada). Los ids
            // pueden ser de planificaciones distintas, asi que se mira la de cada una
            if (setActiveDto.active) {
                const planificationIds = [...new Set(asignaciones.map(asignacion => asignacion.planification_id))];
                const planifications = await queryRunner.manager.find(Planification, {
                    where: { id: In(planificationIds) },
                });
                const durationByPlanification = new Map(planifications.map(p => [p.id, p.duration]));

                for (const asignacion of asignaciones) {
                    const weekError = this.weekOutOfDuration(
                        asignacion.week,
                        durationByPlanification.get(asignacion.planification_id)!,
                    );
                    if (weekError) {
                        await queryRunner.rollbackTransaction();
                        return res.status(400).send({
                            error: `La asignación ${asignacion.id} no se puede reincorporar: ${weekError}`
                        });
                    }
                }
            }

            // Quitar y reincorporar solo cambian el flag: la rutina conserva su semana y su orden
            for (const asignacion of asignaciones) {
                asignacion.active = setActiveDto.active;
                await queryRunner.manager.save(asignacion);
            }

            await queryRunner.commitTransaction();

            res.status(200).send(asignaciones);
        } catch (error) {
            if (queryRunner.isTransactionActive) {
                await queryRunner.rollbackTransaction();
            }
            console.error(error);
            res.status(500).send({ error: 'Error al actualizar el estado de las asignaciones.' });
        } finally {
            await queryRunner.release();
        }
    }

    // CU-E-12f. Copia las rutinas VIGENTES de una semana, en su orden, al final de cada semana destino
    // (consecutivas, aunque ya tenga rutinas). Todo o nada: una sola transaccion para todas las semanas
    // destino. El orden de las validaciones es parte del contrato (plan BE-42, 3.5.1)
    async repeatWeek(
        repeatWeekDto: RepeatPlanificationWeekDto,
        res: Response
    ) {
        const queryRunner = this.dataSource.createQueryRunner();

        try {
            await queryRunner.connect();
            await queryRunner.startTransaction();

            const planification = await queryRunner.manager.findOne(Planification, {
                where: { id: repeatWeekDto.planification_id },
            });

            if (!planification) {
                return this.rejectAndRollback(queryRunner, res, { status: 404, error: PLANIFICATION_NOT_FOUND_ERROR });
            }

            if (!planification.active) {
                return this.rejectAndRollback(queryRunner, res, { status: 400, error: PLANIFICATION_INACTIVE_ERROR });
            }

            // Primero la semana de origen y despues las destino, en el orden recibido
            for (const week of [repeatWeekDto.from_week, ...repeatWeekDto.to_weeks]) {
                const weekError = this.weekOutOfDuration(week, planification.duration);
                if (weekError) {
                    return this.rejectAndRollback(queryRunner, res, { status: 400, error: weekError });
                }
            }

            // Solo las vigentes, en el orden en que el detalle las muestra (el order admite duplicados:
            // desempata created_at). Las quitadas no se copian
            const sourceAsignations = await queryRunner.manager.find(RoutineAsignation, {
                where: { planification_id: planification.id, week: repeatWeekDto.from_week, active: true },
                order: { order: 'ASC', created_at: 'ASC' },
            });

            if (sourceAsignations.length === 0) {
                return this.rejectAndRollback(queryRunner, res, {
                    status: 400,
                    error: weekWithoutRoutinesError(repeatWeekDto.from_week),
                });
            }

            // La rutina en si pudo darse de baja despues de asignarla: se copian solo rutinas vigentes
            const routineIds = sourceAsignations.map(asignation => asignation.routine_id);
            const rejection = await this.checkRoutinesAssignable(queryRunner.manager, routineIds);
            if (rejection) {
                return this.rejectAndRollback(queryRunner, res, rejection);
            }

            // Las copias son vinculos nuevos: no heredan nada de los originales. En cada destino van al
            // final de sus vigentes (las quitadas no ocupan lugar), o desde 1 si no tiene ninguna
            for (const week of repeatWeekDto.to_weeks) {
                const firstOrder = await this.nextOrder(planification.id, week, queryRunner.manager);
                await this.insertWeekRoutines(queryRunner.manager, planification.id, week, routineIds, firstOrder);
            }

            await queryRunner.commitTransaction();

            const actualizada = await this.findPlanificationDetail(planification.id);
            return res.status(201).send(this.buildPlanificationDetailResponse(actualizada!));
        } catch (error) {
            if (queryRunner.isTransactionActive) {
                await queryRunner.rollbackTransaction();
            }
            console.error(error);
            res.status(500).send({ error: 'Error al repetir la semana de la planificación.' });
        } finally {
            await queryRunner.release();
        }
    }

    // CU-E-12e. La lista tiene que ser EXACTAMENTE las rutinas vigentes de la semana, en el orden nuevo:
    // se renumeran 1..n en una transaccion. Las quitadas y las otras semanas no se tocan
    async reorderWeek(
        reorderWeekDto: ReorderPlanificationWeekDto,
        res: Response
    ) {
        const queryRunner = this.dataSource.createQueryRunner();

        try {
            await queryRunner.connect();
            await queryRunner.startTransaction();

            const planification = await queryRunner.manager.findOne(Planification, {
                where: { id: reorderWeekDto.planification_id },
            });

            if (!planification) {
                return this.rejectAndRollback(queryRunner, res, { status: 404, error: PLANIFICATION_NOT_FOUND_ERROR });
            }

            if (!planification.active) {
                return this.rejectAndRollback(queryRunner, res, { status: 400, error: PLANIFICATION_INACTIVE_ERROR });
            }

            const asignations = await queryRunner.manager.find(RoutineAsignation, {
                where: { planification_id: planification.id, week: reorderWeekDto.week, active: true },
            });

            // Sin faltantes, extras ni repetidos. Se compara en minuscula: el iOS manda los UUID en
            // mayuscula y la base los devuelve en minuscula
            const requestedIds = reorderWeekDto.routine_asignation_ids.map(id => id.toLowerCase());
            const asignationById = new Map(asignations.map(asignation => [asignation.id.toLowerCase(), asignation]));

            const sameList = requestedIds.length === asignations.length
                && new Set(requestedIds).size === requestedIds.length
                && requestedIds.every(id => asignationById.has(id));

            if (!sameList) {
                return this.rejectAndRollback(queryRunner, res, {
                    status: 400,
                    error: weekListMismatchError(reorderWeekDto.week),
                });
            }

            requestedIds.forEach((id, index) => {
                asignationById.get(id)!.order = index + 1;
            });
            await queryRunner.manager.save(asignations);

            await queryRunner.commitTransaction();

            const actualizada = await this.findPlanificationDetail(planification.id);
            return res.status(200).send(this.buildPlanificationDetailResponse(actualizada!));
        } catch (error) {
            if (queryRunner.isTransactionActive) {
                await queryRunner.rollbackTransaction();
            }
            console.error(error);
            res.status(500).send({ error: 'Error al reordenar las rutinas de la semana.' });
        } finally {
            await queryRunner.release();
        }
    }

    // ===================== ASIGNACIONES A ALUMNOS (CU-E-13, CU-E-14 y el listado) =====================

    // Solo el coach asigna (D20): coach_id sale del token. El orden de las validaciones es parte
    // del contrato (spec del bloque B, §5.1). Es una sola escritura, asi que no hay transaccion: dos
    // altas simultaneas del mismo alumno pueden saltearse el aviso de solapamiento y quedar
    // conviviendo, que D21 ya admite
    async assignPlanificationToUser(
        assignPlanificationToUserDto: AssignPlanificationToUserDto,
        currentUser: AuthUser,
        res: Response
    ) {
        const startDate = assignPlanificationToUserDto.start_date;

        // Solo un string cuenta como "vino el fin": null o ausente es calcularlo de la plantilla. El
        // DTO ya garantizo que los dos son dias YYYY-MM-DD, que se comparan bien como texto
        const sentEndDate = typeof assignPlanificationToUserDto.end_date === 'string'
            ? assignPlanificationToUserDto.end_date
            : undefined;

        // Antes de leer nada: no depende de la base
        if (sentEndDate !== undefined && sentEndDate < startDate) {
            return res.status(400).send({ error: 'La fecha de fin no puede ser anterior a la de inicio.' });
        }

        try {
            // Rol coach sin su fila en Coach, o con la fila dada de baja: la inconsistencia que arregla
            // BE-27. Sin fila, la FK de coach_id daria un 500; con la fila de baja, la asignacion
            // quedaria a nombre de un coach dado de baja (decision del 21/10). No es el texto de la
            // cuenta deshabilitada: ese es el unico que hace cerrar la sesion en el web
            const coach = await this.coachRepository.findOne({
                where: { id: currentUser.id },
                select: { id: true, active: true },
            });

            if (!coach || !coach.active) {
                return res.status(403).send({ error: 'Tu usuario no está registrado como entrenador.' });
            }

            const planification = await this.planificationRepository.findOne({
                where: { id: assignPlanificationToUserDto.planification_id },
                select: { id: true, name: true, duration: true, active: true },
            });

            if (!planification) {
                return res.status(404).send({ error: 'Planificación no encontrada' });
            }

            // Una plantilla de baja no se asigna de nuevo. Lo ya asignado sigue: E-11 no cascadea
            if (!planification.active) {
                return res.status(400).send({
                    error: 'La planificación está dada de baja y no puede asignarse a un alumno.'
                });
            }

            // Precondicion del CU. Vigente = el vinculo activo, el mismo criterio que routine_count:
            // una rutina dada de baja (E-18) dentro del plan se sigue viendo y ejecutando
            const hasRoutines = await this.routineAsignationRepository.exists({
                where: { planification_id: planification.id, active: true },
            });

            if (!hasRoutines) {
                return res.status(400).send({
                    error: 'La planificación no tiene rutinas vigentes: asignale rutinas antes de asignarla a un alumno.'
                });
            }

            // Sin fin en el body, sale de la plantilla: el domingo de la semana duration (D17, spec
            // §4). Con duracion 0 no hay de donde sacarlo, y no existe un plan sin fin (NOT NULL)
            let endDate = sentEndDate;

            if (endDate === undefined) {
                if (planification.duration === 0) {
                    return res.status(400).send({
                        error: 'La planificación no tiene duración fija: indicá la fecha de fin.'
                    });
                }

                const defaultEndDate = defaultPlanEndDate(startDate, planification.duration);

                // Tope tecnico (decision del 21/10): con una duracion absurda no hay dia YYYY-MM-DD
                if (defaultEndDate === null) {
                    return res.status(400).send({
                        error: 'La fecha de fin calculada queda fuera del calendario: indicá la fecha de fin.'
                    });
                }

                endDate = defaultEndDate;
            }

            const user = await this.userRepository.findOne({
                where: { id: assignPlanificationToUserDto.user_id },
                select: { id: true, role: true, active: true },
            });

            if (!user) {
                return res.status(404).send({ error: 'Usuario no encontrado' });
            }

            // Mismo criterio que E-19
            if (user.role !== UserRole.user) {
                return res.status(400).send({ error: 'La planificación sólo puede asignarse a un alumno.' });
            }

            if (!user.active) {
                return res.status(400).send({
                    error: 'La cuenta del alumno está cerrada: no se le puede asignar una planificación.'
                });
            }

            // D21: si se pisa con otra activa, se avisa con las que se pisan. Reenviando
            // confirm_overlap: true se crea igual y conviven, asi que con la confirmacion ni se consulta
            if (assignPlanificationToUserDto.confirm_overlap !== true) {
                const overlapping = await this.findOverlappingAssignments(user.id, startDate, endDate);

                if (overlapping.length > 0) {
                    return res.status(409).send({
                        error: 'El alumno ya tiene una planificación en esas fechas. Reenviá con confirm_overlap: true para asignarla igual.',
                        overlapping: overlapping.map(
                            userPlanification => this.buildUserPlanificationResponse(userPlanification, userPlanification.planification)
                        ),
                    });
                }
            }

            // Los ids salen de las filas leidas y no del body: el iOS manda los UUID en mayuscula, y la
            // respuesta tiene que devolverlos como estan en la base. La cabecera no se copia (D18)
            const userPlanification = await this.userPlanificationRepository.save(
                this.userPlanificationRepository.create({
                    user_id: user.id,
                    coach_id: coach.id,
                    planification_id: planification.id,
                    start_date: startDate,
                    end_date: endDate,
                    coach_note: assignPlanificationToUserDto.coach_note,
                })
            );

            return res.status(201).send(this.buildUserPlanificationResponse(userPlanification, planification));
        } catch (error) {
            console.error(error);
            res.status(500).send({ error: 'Error al asignar la planificación.' });
        }
    }

    // Quitar y reincorporar (CU-E-14, D23): el mismo endpoint en los dos sentidos, como el resto de
    // las bajas logicas. Quitar solo apaga el flag, porque no hay nada que cascadear (D11): el plan
    // sale del home y lo que el alumno hizo sigue en el historial. Reincorporar no vuelve a chequear
    // el solapamiento (D23) ni la plantilla o la cuenta del alumno (decision del 21/10): deshace la
    // baja y deja la asignacion como estaba
    async setUserPlanificationActive(
        idUserPlanification: string,
        setUserPlanificationActiveDto: SetUserPlanificationActiveDto,
        res: Response
    ) {
        const active = setUserPlanificationActiveDto.active;

        try {
            // Sin filtrar por estado: para reincorporarla hay que encontrar la quitada
            const userPlanification = await this.userPlanificationQuery()
                .where('userPlanification.id = :idUserPlanification', { idUserPlanification })
                .getOne();

            if (!userPlanification) {
                return res.status(404).send({ error: 'Asignación no encontrada' });
            }

            // Pedir el estado que ya tiene es 400: es el "informa que no hay nada que quitar" del CU
            if (userPlanification.active === active) {
                return res.status(400).send({
                    error: active
                        ? 'La planificación del alumno ya está activa.'
                        : 'La planificación del alumno ya está dada de baja.'
                });
            }

            // Un solo UPDATE de las dos columnas, por el id de la fila (el del path puede venir en
            // mayuscula). updated_at va en el update(): repository.update() no refresca la entidad y la
            // respuesta devuelve updated_at (ver markExerciseFinished)
            const updatedAt = new Date();

            await this.userPlanificationRepository.update(
                { id: userPlanification.id },
                { active, updated_at: updatedAt },
            );

            userPlanification.active = active;
            userPlanification.updated_at = updatedAt;

            res.status(200).send(
                this.buildUserPlanificationResponse(userPlanification, userPlanification.planification)
            );
        } catch (error) {
            console.error(error);
            res.status(500).send({ error: 'Error al actualizar el estado de la planificación del alumno.' });
        }
    }

    // Los planes de un alumno (spec §5.3): el paso 1 de CU-E-14, y el alumno ve los suyos. Por
    // defecto solo los activos; con include_inactive, tambien los quitados
    async getUserPlanifications(
        userId: string,
        query: GetUserPlanificationsQueryDto,
        res: Response
    ) {
        try {
            const user = await this.userRepository.findOne({
                where: { id: userId },
                select: { id: true },
            });

            if (!user) {
                return res.status(404).send({ error: 'Usuario no encontrado' });
            }

            // El id de la fila y no el del path: el iOS manda los UUID en mayuscula
            const userPlanificationsQuery = this.userPlanificationsOfUserQuery(user.id);

            if (!query.include_inactive) {
                userPlanificationsQuery.andWhere('userPlanification.active = true');
            }

            const userPlanifications = await userPlanificationsQuery.getMany();

            res.status(200).send(userPlanifications.map(
                userPlanification => this.buildUserPlanificationResponse(userPlanification, userPlanification.planification)
            ));
        } catch (error) {
            console.error(error);
            res.status(500).send({ error: 'Error al obtener las planificaciones del alumno.' });
        }
    }

    // ===================== HELPERS =====================

    // La semana cabe si el plan no tiene duracion fija (0) o si no la supera. El minimo
    // (week >= 1) lo valida el DTO. Devuelve el mensaje de error, o null si la semana es valida
    private weekOutOfDuration(week: number, duration: number): string | null {
        if (duration === 0 || week <= duration) {
            return null;
        }
        return `La semana ${week} supera la duración de la planificación (${duration} semanas).`;
    }

    // Las semanas del alta (weeks): primero la repetida, despues la PRIMERA, en el orden recibido, que
    // supera la duracion. Devuelve el mensaje de error, o null si estan bien
    private validateCreateWeeks(weeks: CreatePlanificationWeekDto[], duration: number): string | null {
        const weekNumbers = weeks.map(week => week.week);

        if (new Set(weekNumbers).size !== weekNumbers.length) {
            return WEEK_REPEATED_ERROR;
        }

        for (const week of weekNumbers) {
            const weekError = this.weekOutOfDuration(week, duration);
            if (weekError) {
                return weekError;
            }
        }

        return null;
    }

    // Que las rutinas existan y esten vigentes para asignarlas a un plan. Lo comparten el lote, el alta
    // con semanas y repetir una semana, para que no puedan decir cosas distintas del mismo problema.
    // Se validan los ids UNICOS: el array puede traer repetidos a proposito, y cada repeticion crea su
    // propia asignacion. Devuelve el rechazo ya resuelto, o null si estan todas bien
    private async checkRoutinesAssignable(
        manager: EntityManager,
        routineIds: string[]
    ): Promise<Rejection | null> {
        if (routineIds.length === 0) {
            return null;
        }

        const idsUnicos = [...new Set(routineIds)];
        const routines = await manager.find(Routine, {
            where: { id: In(idsUnicos) },
        });

        if (routines.length !== idsUnicos.length) {
            return { status: 404, error: ROUTINES_NOT_FOUND_ERROR };
        }

        const inactivas = routines.filter(routine => !routine.active);
        if (inactivas.length > 0) {
            return { status: 400, error: inactiveRoutinesError(inactivas) };
        }

        return null;
    }

    // Una asignacion por id, consecutivas desde firstOrder y en el orden del array (un repetido crea una
    // por cada vez). Escribe con el manager del llamador, dentro de su transaccion
    private async insertWeekRoutines(
        manager: EntityManager,
        idPlanification: string,
        week: number,
        routineIds: string[],
        firstOrder: number
    ): Promise<void> {
        await manager.save(
            manager.create(
                RoutineAsignation,
                routineIds.map((routineId, index) => ({
                    routine_id: routineId,
                    planification_id: idPlanification,
                    week,
                    order: firstOrder + index,
                })),
            )
        );
    }

    // Deshace la transaccion y responde el rechazo. Lo comparten las operaciones del contenido del plan,
    // que validan todo antes de escribir
    private async rejectAndRollback(queryRunner: QueryRunner, res: Response, rejection: Rejection) {
        await queryRunner.rollbackTransaction();
        return res.status(rejection.status).send({ error: rejection.error });
    }

    // max(order) + 1 sobre las asignaciones ACTIVAS de esa semana del plan, o 1 si no hay
    // ninguna. Las inactivas conservan su order (D10) pero no cuentan: la rutina de baja no
    // ocupa lugar. Recibe el manager para poder correr dentro de la transaccion de los lotes
    private async nextOrder(
        idPlanification: string,
        week: number,
        manager?: EntityManager
    ): Promise<number> {
        const repository = manager
            ? manager.getRepository(RoutineAsignation)
            : this.routineAsignationRepository;

        const resultado = await repository
            .createQueryBuilder('routineAsignation')
            .select('MAX(routineAsignation.order)', 'max')
            .where('routineAsignation.planification_id = :idPlanification', { idPlanification })
            .andWhere('routineAsignation.week = :week', { week })
            .andWhere('routineAsignation.active = true')
            .getRawOne<{ max: number | null }>();

        return (resultado?.max ?? 0) + 1;
    }

    // Semana mas alta usada por una asignacion ACTIVA del plan, o 0 si no tiene ninguna
    private async maxActiveWeek(idPlanification: string): Promise<number> {
        const resultado = await this.routineAsignationRepository
            .createQueryBuilder('routineAsignation')
            .select('MAX(routineAsignation.week)', 'max')
            .where('routineAsignation.planification_id = :idPlanification', { idPlanification })
            .andWhere('routineAsignation.active = true')
            .getRawOne<{ max: number | null }>();

        return resultado?.max ?? 0;
    }

    // Filtros compartidos por /all y /all-plus
    private buildPlanificationsQuery(query: GetPlanificationsQueryDto): SelectQueryBuilder<Planification> {
        // NULLS LAST porque name es nullable: sin esto los planes sin nombre encabezan
        const queryBuilder = this.planificationRepository
            .createQueryBuilder('planification')
            .orderBy('planification.name', 'ASC', 'NULLS LAST');

        if (!query.include_inactive) {
            queryBuilder.andWhere('planification.active = :active', { active: true });
        }

        if (query.keyword) {
            queryBuilder.andWhere(
                '(planification.name ILIKE :keyword OR planification.description ILIKE :keyword)',
                { keyword: `%${query.keyword}%` }
            );
        }

        if (query.type) {
            queryBuilder.andWhere('planification.type ILIKE :type', { type: query.type });
        }

        return queryBuilder;
    }

    private async findPlanificationDetail(idPlanification: string): Promise<Planification | null> {
        return this.planificationRepository.findOne({
            where: { id: idPlanification },
            relations: [
                'routineAsignations',
                'routineAsignations.routine',
            ],
            order: {
                routineAsignations: {
                    week: 'ASC',
                    order: 'ASC',
                    // Mismo desempate que /all-plus: el order admite duplicados
                    created_at: 'ASC',
                },
            },
        });
    }

    // Compartido por el detalle, el alta, la edicion y cada fila de /all-plus, para que
    // el formato no se duplique
    private buildPlanificationDetailResponse(planification: Planification) {
        // Los vinculos dados de baja no se muestran ni cuentan: una rutina que el entrenador
        // saco del plan no reaparece. findPlanificationDetail carga con relations, que no
        // admite condicion, asi que el filtro va aca — mismo patron que
        // buildRoutineDetailResponse. En /all-plus el join ya filtro y esto es redundante
        // a proposito: el builder es el unico lugar que decide que se ve
        const asignaciones = planification.routineAsignations.filter(
            routineAsignation => routineAsignation.active
        );

        return {
            id: planification.id,
            name: planification.name,
            description: planification.description,
            number_of_routines: planification.number_of_routines,
            type: planification.type,
            duration: planification.duration,
            active: planification.active,
            routine_count: asignaciones.length,
            created_at: planification.created_at,
            updated_at: planification.updated_at,
            routines: asignaciones.map(routineAsignation => ({
                id: routineAsignation.id,
                week: routineAsignation.week,
                order: routineAsignation.order,
                routine: {
                    id: routineAsignation.routine.id,
                    name: routineAsignation.routine.name,
                    coach_note: routineAsignation.routine.coach_note,
                    active: routineAsignation.routine.active,
                },
            })),
        };
    }

    // La base de las lecturas de asignaciones: cada una con la cabecera de su plantilla, solo lo que
    // lleva la forma de una asignacion (spec §5). Inner join: planification_id es NOT NULL con
    // RESTRICT (D19), asi que la plantilla siempre esta
    private userPlanificationQuery(): SelectQueryBuilder<UserPlanification> {
        return this.userPlanificationRepository
            .createQueryBuilder('userPlanification')
            .innerJoin('userPlanification.planification', 'planification')
            .addSelect(['planification.id', 'planification.name', 'planification.duration', 'planification.active']);
    }

    // Las asignaciones de un alumno, de la mas nueva a la mas vieja: inicio y despues alta,
    // descendentes (spec §5.3). La comparten el listado y el overlapping del 409 de E-13, para que
    // el web no vea dos ordenes distintos
    private userPlanificationsOfUserQuery(userId: string): SelectQueryBuilder<UserPlanification> {
        return this.userPlanificationQuery()
            .where('userPlanification.user_id = :userId', { userId })
            .orderBy('userPlanification.start_date', 'DESC')
            .addOrderBy('userPlanification.created_at', 'DESC');
    }

    // Las asignaciones ACTIVAS del alumno cuyo rango se pisa con [startDate, endDate], con los dos
    // extremos inclusivos: empiezan antes o el mismo dia en que termina la nueva, y terminan despues
    // o el mismo dia en que empieza. Las quitadas (E-14) no cuentan
    private findOverlappingAssignments(
        userId: string,
        startDate: string,
        endDate: string
    ): Promise<UserPlanification[]> {
        return this.userPlanificationsOfUserQuery(userId)
            .andWhere('userPlanification.active = true')
            .andWhere('userPlanification.start_date <= :endDate', { endDate })
            .andWhere('userPlanification.end_date >= :startDate', { startDate })
            .getMany();
    }

    // La forma de una asignacion (spec del bloque B, §5): la usan E-13 (la creada y las que se
    // pisan), E-14 y el listado del alumno. La cabecera del plan se lee de la plantilla (D18)
    private buildUserPlanificationResponse(userPlanification: UserPlanification, planification: Planification) {
        return {
            id: userPlanification.id,
            user_id: userPlanification.user_id,
            coach_id: userPlanification.coach_id,
            planification_id: userPlanification.planification_id,
            start_date: userPlanification.start_date,
            end_date: userPlanification.end_date,
            coach_note: userPlanification.coach_note ?? null,
            active: userPlanification.active,
            created_at: userPlanification.created_at,
            updated_at: userPlanification.updated_at,
            planification: {
                id: planification.id,
                name: planification.name ?? null,
                duration: planification.duration,
                active: planification.active,
            },
        };
    }

}

import { Injectable } from '@nestjs/common';
import { Response } from 'express';

import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager, In, SelectQueryBuilder } from 'typeorm';
import { Planification } from '../entities/planification.entity';
import { Routine } from '../entities/routine.entity';
import { RoutineAsignation } from '../entities/routine_asignation.entity';
import { GetPlanificationsQueryDto } from '../dtos/planification/get_planifications_query.dto';
import { CreatePlanificationDto } from '../dtos/planification/create_planification.dto';
import { EditPlanificationDto } from '../dtos/planification/edit_planification.dto';
import { SetPlanificationActiveDto } from '../dtos/planification/set_planification_active.dto';
import { AssignRoutineToPlanificationDto } from '../dtos/planification/assign_routine_to_planification.dto';
import { AssignRoutinesToPlanificationDto } from '../dtos/planification/assign_routines_to_planification.dto';
import { SetRoutineAsignationActiveDto } from '../dtos/planification/set_routine_asignation_active.dto';
import { SetRoutineAsignationsActiveDto } from '../dtos/planification/set_routine_asignations_active.dto';

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

    // Sin transaccion, a diferencia de createRoutine: se inserta UNA fila. Enganchar
    // rutinas al plan es CU-E-12 y tiene su propio endpoint
    async createPlanification(
        createPlanificationDto: CreatePlanificationDto,
        res: Response
    ) {
        try {
            const planification = await this.planificationRepository.save(
                this.planificationRepository.create({
                    name: createPlanificationDto.name,
                    number_of_routines: createPlanificationDto.number_of_routines,
                    description: createPlanificationDto.description ?? null,
                    type: createPlanificationDto.type ?? null,
                    duration: createPlanificationDto.duration ?? null,
                })
            );

            // Se recarga para devolver el mismo formato que GET /:id (con routines: [])
            const created = await this.findPlanificationDetail(planification.id);
            return res.status(201).send(this.buildPlanificationDetailResponse(created!));
        } catch (error) {
            console.error(error);
            res.status(500).send({ error: 'Error al crear la planificación.' });
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

            // El body es el estado completo de la cabecera: lo que no viene se BORRA.
            // Por eso los tres opcionales van a null explicito y no a undefined, que
            // TypeORM ignoraria dejando el valor viejo
            planification.name = editPlanificationDto.name;
            planification.number_of_routines = editPlanificationDto.number_of_routines;
            planification.description = editPlanificationDto.description ?? null;
            planification.type = editPlanificationDto.type ?? null;
            planification.duration = editPlanificationDto.duration ?? null;

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
                return res.status(404).send({ error: 'Planificación no encontrada' });
            }

            if (!planification.active) {
                return res.status(400).send({
                    error: 'La planificación está dada de baja. Reactivala antes de asignarle rutinas.'
                });
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

            // Sin order explicito va al final. Con order se persiste TAL CUAL, aunque la
            // posicion ya este ocupada: no se desplaza ni se renumera nada, y el order
            // puede quedar duplicado. Es la decision del 4/9
            const order = assignRoutineDto.order
                ?? await this.nextOrder(assignRoutineDto.planification_id);

            await this.routineAsignationRepository.save(
                this.routineAsignationRepository.create({
                    routine_id: assignRoutineDto.routine_id,
                    planification_id: assignRoutineDto.planification_id,
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
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const planification = await queryRunner.manager.findOne(Planification, {
                where: { id: assignRoutinesDto.planification_id },
            });

            if (!planification) {
                await queryRunner.rollbackTransaction();
                return res.status(404).send({ error: 'Planificación no encontrada' });
            }

            if (!planification.active) {
                await queryRunner.rollbackTransaction();
                return res.status(400).send({
                    error: 'La planificación está dada de baja. Reactivala antes de asignarle rutinas.'
                });
            }

            // Se validan los ids UNICOS: el array puede traer repetidos a proposito,
            // y cada repeticion crea su propia asignacion
            const idsUnicos = [...new Set(assignRoutinesDto.routine_ids)];
            const routines = await queryRunner.manager.find(Routine, {
                where: { id: In(idsUnicos) },
            });

            if (routines.length !== idsUnicos.length) {
                await queryRunner.rollbackTransaction();
                return res.status(404).send({ error: 'Algunas rutinas no fueron encontradas' });
            }

            const inactivas = routines.filter(routine => !routine.active);
            if (inactivas.length > 0) {
                await queryRunner.rollbackTransaction();
                const nombres = inactivas.map(routine => `'${routine.name}'`).join(', ');
                return res.status(400).send({
                    error: `Estas rutinas están dadas de baja y no pueden asignarse: ${nombres}.`
                });
            }

            // Consecutivas desde el final, en el orden del array
            let order = await this.nextOrder(assignRoutinesDto.planification_id, queryRunner.manager);

            for (const routineId of assignRoutinesDto.routine_ids) {
                await queryRunner.manager.save(
                    queryRunner.manager.create(RoutineAsignation, {
                        routine_id: routineId,
                        planification_id: assignRoutinesDto.planification_id,
                        order: order++,
                    })
                );
            }

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
        // El order solo tiene sentido al reactivar. Aceptarlo en silencio con
        // active = false esconderia un bug del cliente
        if (!setActiveDto.active && setActiveDto.order !== undefined) {
            return res.status(400).send({
                error: 'El campo order sólo aplica al reactivar una asignación.'
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
                // La baja le borro la posicion, asi que reactivar tiene que darle una:
                // la del body si vino, y si no al final
                asignacion.order = setActiveDto.order
                    ?? await this.nextOrder(asignacion.planification_id);
            } else {
                // Pierde la posicion y el resto NO se renumera: la secuencia queda con
                // un hueco, a proposito. Es la decision del 4/9
                asignacion.order = null;
            }

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
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const asignaciones = await queryRunner.manager.find(RoutineAsignation, {
                where: { id: In(ids) },
            });

            if (asignaciones.length !== ids.length) {
                await queryRunner.rollbackTransaction();
                return res.status(404).send({ error: 'Algunas asignaciones no fueron encontradas' });
            }

            // Los ids pueden ser de planificaciones distintas, asi que el order de la
            // reactivacion se calcula por plan, dentro del loop
            for (const asignacion of asignaciones) {
                if (setActiveDto.active) {
                    asignacion.order = await this.nextOrder(asignacion.planification_id, queryRunner.manager);
                } else {
                    asignacion.order = null;
                }

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

    // ===================== HELPERS =====================

    // max(order) + 1 sobre las asignaciones ACTIVAS del plan, o 1 si no hay ninguna.
    // Las inactivas tienen order null, asi que no participan del maximo.
    // Recibe el manager para poder correr dentro de la transaccion de los lotes
    private async nextOrder(
        idPlanification: string,
        manager?: EntityManager
    ): Promise<number> {
        const repository = manager
            ? manager.getRepository(RoutineAsignation)
            : this.routineAsignationRepository;

        const resultado = await repository
            .createQueryBuilder('routineAsignation')
            .select('MAX(routineAsignation.order)', 'max')
            .where('routineAsignation.planification_id = :idPlanification', { idPlanification })
            .andWhere('routineAsignation.active = true')
            .getRawOne<{ max: number | null }>();

        return (resultado?.max ?? 0) + 1;
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

}

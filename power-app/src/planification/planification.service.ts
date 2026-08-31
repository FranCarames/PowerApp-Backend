import { Injectable } from '@nestjs/common';
import { Response } from 'express';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Planification } from '../entities/planification.entity';
import { GetPlanificationsQueryDto } from '../dtos/planification/get_planifications_query.dto';
import { CreatePlanificationDto } from '../dtos/planification/create_planification.dto';
import { EditPlanificationDto } from '../dtos/planification/edit_planification.dto';
import { SetPlanificationActiveDto } from '../dtos/planification/set_planification_active.dto';

@Injectable()
export class PlanificationService {
    constructor(
        @InjectRepository(Planification)
        private planificationRepository: Repository<Planification>,
    ) {
    }

    // ===================== PLANIFICACIONES SISTEMICAS (CU-E-08 a CU-E-11) =====================

    async getAllPlanifications(
        query: GetPlanificationsQueryDto,
        res: Response
    ) {
        try {
            // Routine_Asignation no tiene baja logica, asi que el conteo no filtra nada
            // (a diferencia de circuit_count en rutinas, que descarta los vinculos apagados)
            const planifications = await this.buildPlanificationsQuery(query)
                .loadRelationCountAndMap(
                    'planification.routine_count',
                    'planification.routineAsignations',
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
                .leftJoinAndSelect('planification.routineAsignations', 'routineAsignation')
                .leftJoinAndSelect('routineAsignation.routine', 'routine')
                .addOrderBy('routineAsignation.order', 'ASC')
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

    // ===================== HELPERS =====================

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
                },
            },
        });
    }

    // Compartido por el detalle, el alta, la edicion y cada fila de /all-plus, para que
    // el formato no se duplique
    private buildPlanificationDetailResponse(planification: Planification) {
        return {
            id: planification.id,
            name: planification.name,
            description: planification.description,
            number_of_routines: planification.number_of_routines,
            type: planification.type,
            duration: planification.duration,
            active: planification.active,
            routine_count: planification.routineAsignations.length,
            created_at: planification.created_at,
            updated_at: planification.updated_at,
            routines: planification.routineAsignations.map(routineAsignation => ({
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

import { Injectable } from '@nestjs/common';
import { Response } from 'express';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Circuit } from '../entities/circuit.entity';
import { GetCircuitsQueryDto } from '../dtos/circuit/get_circuits_query.dto';
import { SetCircuitActiveDto } from '../dtos/circuit/set_circuit_active.dto';

@Injectable()
export class RoutineService {
    constructor(
        @InjectRepository(Circuit)
        private circuitRepository: Repository<Circuit>,
    ) {
    }

    // ===================== CIRCUITOS =====================

    async getAllCircuits(
        query: GetCircuitsQueryDto,
        res: Response
    ) {
        try {
            const queryBuilder = this.circuitRepository
                .createQueryBuilder('circuit')
                .loadRelationCountAndMap('circuit.exercise_count', 'circuit.routineExercises')
                .orderBy('circuit.name', 'ASC');

            if (!query.include_inactive) {
                queryBuilder.andWhere('circuit.active = :active', { active: true });
            }

            if (query.type) {
                queryBuilder.andWhere('LOWER(circuit.type) = LOWER(:type)', { type: query.type });
            }

            if (query.keyword) {
                queryBuilder.andWhere(
                    '(circuit.name ILIKE :keyword OR circuit.description ILIKE :keyword)',
                    { keyword: `%${query.keyword}%` }
                );
            }

            const circuits = await queryBuilder.getMany();

            res.status(200).send(circuits);
        } catch (error) {
            console.error(error);
            res.status(500).send({ error: 'Error al obtener los circuitos.' });
        }
    }

    async getCircuitById(
        idCircuit: string,
        res: Response
    ) {
        try {
            const circuit = await this.circuitRepository.findOne({
                where: { id: idCircuit },
                relations: ['routineExercises', 'routineExercises.exercise', 'routineExercises.exerciseSets'],
                order: {
                    routineExercises: {
                        exercise_order: 'ASC',
                        exerciseSets: {
                            set_order: 'ASC',
                        },
                    },
                },
            });

            if (!circuit) {
                return res.status(404).send({ error: 'Circuito no encontrado' });
            }

            res.status(200).send({
                id: circuit.id,
                name: circuit.name,
                description: circuit.description,
                type: circuit.type,
                active: circuit.active,
                created_at: circuit.created_at,
                updated_at: circuit.updated_at,
                exercises: circuit.routineExercises.map(routineExercise => ({
                    id: routineExercise.id,
                    exercise_order: routineExercise.exercise_order,
                    coach_note: routineExercise.coach_note,
                    exercise: {
                        id: routineExercise.exercise.id,
                        name: routineExercise.exercise.name,
                        description: routineExercise.exercise.description,
                        safety_tips: routineExercise.exercise.safety_tips,
                        activation_tips: routineExercise.exercise.activation_tips,
                        video_url: routineExercise.exercise.video_url,
                        preview_image: routineExercise.exercise.preview_image,
                        bg_image: routineExercise.exercise.bg_image,
                    },
                    sets: routineExercise.exerciseSets.map(exerciseSet => ({
                        id: exerciseSet.id,
                        set_order: exerciseSet.set_order,
                        set_count: exerciseSet.set_count,
                        rep_count: exerciseSet.rep_count,
                        weight: exerciseSet.weight,
                        rpe: exerciseSet.rpe,
                        rir: exerciseSet.rir,
                        rm_perc: exerciseSet.rm_perc,
                        amrap: exerciseSet.amrap,
                        amrap_time: exerciseSet.amrap_time,
                        rm: exerciseSet.rm,
                    })),
                })),
            });
        } catch (error) {
            console.error(error);
            res.status(500).send({ error: 'Error al obtener el circuito.' });
        }
    }

    async setCircuitActive(
        idCircuit: string,
        setCircuitActiveDto: SetCircuitActiveDto,
        res: Response
    ) {
        try {
            const circuit = await this.circuitRepository.findOne({ where: { id: idCircuit } });

            if (!circuit) {
                return res.status(404).send({ error: 'Circuito no encontrado' });
            }

            circuit.active = setCircuitActiveDto.active;
            await this.circuitRepository.save(circuit);

            res.status(200).send(circuit);
        } catch (error) {
            console.error(error);
            res.status(500).send({ error: 'Error al actualizar el estado del circuito.' });
        }
    }
}

import { Injectable } from '@nestjs/common';
import { Response } from 'express';

import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource, In, SelectQueryBuilder } from 'typeorm';
import { Circuit } from '../entities/circuit.entity';
import { Exercise } from '../entities/exercise.entity';
import { Routine } from '../entities/routine.entity';
import { RoutineCircuit } from '../entities/routine_circuit.entity';
import { RoutineExercise } from '../entities/routine_exercise.entity';
import { ExerciseSet } from '../entities/exercise_set.entity';
import { GetCircuitsQueryDto } from '../dtos/circuit/get_circuits_query.dto';
import { SetCircuitActiveDto } from '../dtos/circuit/set_circuit_active.dto';
import { CreateCircuitDto } from '../dtos/circuit/create_circuit.dto';
import { GetRoutinesQueryDto } from '../dtos/routine/get_routines_query.dto';
import { CreateRoutineDto } from '../dtos/routine/create_routine.dto';

@Injectable()
export class RoutineService {
    constructor(
        @InjectRepository(Circuit)
        private circuitRepository: Repository<Circuit>,
        @InjectRepository(Routine)
        private routineRepository: Repository<Routine>,
        @InjectDataSource()
        private dataSource: DataSource,
    ) {
    }

    // ===================== RUTINAS =====================

    async createRoutine(
        createRoutineDto: CreateRoutineDto,
        res: Response
    ) {
        // Validaciones que no dependen de la base, antes de abrir la transaccion.
        // A diferencia de los circuitos, el mismo circuit_id PUEDE repetirse en una rutina
        // (Routine_Circuit no tiene unique sobre el par); lo que no puede repetirse es el order
        const orders = createRoutineDto.circuits.map(circuit => circuit.order);

        if (new Set(orders).size !== orders.length) {
            return res.status(400).send({
                error: 'Dos circuitos no pueden ocupar la misma posición: el campo order tiene valores repetidos.'
            });
        }

        // El order es una instruccion de ordenamiento, no el valor que se guarda: se ordena
        // por el y se persiste la posicion resultante, asi la base queda siempre 1..N
        const circuitsInOrder = [...createRoutineDto.circuits].sort((a, b) => a.order - b.order);
        const circuitIds = circuitsInOrder.map(circuit => circuit.circuit_id);

        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // Se buscan por el set de ids unicos: un circuito repetido es una sola fila de Circuit
            const uniqueCircuitIds = [...new Set(circuitIds)];

            const circuits = await queryRunner.manager.find(Circuit, {
                where: { id: In(uniqueCircuitIds) },
                select: { id: true, name: true, active: true },
            });

            if (circuits.length !== uniqueCircuitIds.length) {
                await queryRunner.rollbackTransaction();
                return res.status(404).send({ error: 'Algunos circuitos no fueron encontrados' });
            }

            // Un circuito dado de baja no puede ensamblarse en una rutina nueva (precondicion de
            // CU-E-16 y postcondicion de CU-E-24). Va el nombre en el mensaje: el id existe, asi
            // que un 404 mandaria al front a buscar un bug de ids que no esta
            const inactiveCircuit = circuits.find(circuit => !circuit.active);

            if (inactiveCircuit) {
                await queryRunner.rollbackTransaction();
                return res.status(400).send({
                    error: `El circuito '${inactiveCircuit.name}' está dado de baja y no puede usarse en una rutina nueva.`
                });
            }

            const routine = await queryRunner.manager.save(
                queryRunner.manager.create(Routine, {
                    name: createRoutineDto.name,
                    coach_note: createRoutineDto.coach_note,
                    active: true,
                })
            );

            // El order persistido sale de la posicion tras ordenar, no del valor recibido
            for (const [index, circuit] of circuitsInOrder.entries()) {
                await queryRunner.manager.save(
                    queryRunner.manager.create(RoutineCircuit, {
                        routine_id: routine.id,
                        circuit_id: circuit.circuit_id,
                        order: index + 1,
                    })
                );
            }

            await queryRunner.commitTransaction();

            // Se recarga con las relaciones para devolver el mismo formato que el detalle
            const created = await this.findRoutineDetail(routine.id);
            return res.status(201).send(this.buildRoutineDetailResponse(created!));
        } catch (error) {
            // La recarga del detalle pasa despues del commit: si falla ahi, la transaccion ya
            // esta cerrada y un rollback incondicional tiraria un error nuevo dentro del catch
            if (queryRunner.isTransactionActive) {
                await queryRunner.rollbackTransaction();
            }
            console.error(error);
            res.status(500).send({ error: 'Error al crear la rutina.' });
        } finally {
            await queryRunner.release();
        }
    }

    async getAllRoutines(
        query: GetRoutinesQueryDto,
        res: Response
    ) {
        try {
            const routines = await this.buildRoutinesQuery(query)
                .loadRelationCountAndMap('routine.circuit_count', 'routine.routineCircuits')
                .getMany();

            res.status(200).send(routines);
        } catch (error) {
            console.error(error);
            res.status(500).send({ error: 'Error al obtener las rutinas.' });
        }
    }

    async getAllRoutinesPlus(
        query: GetRoutinesQueryDto,
        res: Response
    ) {
        try {
            // Con los circuitos ya cargados, el conteo sale del array
            const routines = await this.buildRoutinesQuery(query)
                .leftJoinAndSelect('routine.routineCircuits', 'routineCircuit')
                .leftJoinAndSelect('routineCircuit.circuit', 'circuit')
                .addOrderBy('routineCircuit.order', 'ASC')
                .getMany();

            const response = routines.map(routine => ({
                id: routine.id,
                name: routine.name,
                coach_note: routine.coach_note,
                active: routine.active,
                circuit_count: routine.routineCircuits.length,
                created_at: routine.created_at,
                updated_at: routine.updated_at,
                circuits: routine.routineCircuits.map(routineCircuit => ({
                    id: routineCircuit.id,
                    order: routineCircuit.order,
                    circuit: {
                        id: routineCircuit.circuit.id,
                        name: routineCircuit.circuit.name,
                        type: routineCircuit.circuit.type,
                        active: routineCircuit.circuit.active,
                    },
                })),
            }));

            res.status(200).send(response);
        } catch (error) {
            console.error(error);
            res.status(500).send({ error: 'Error al obtener las rutinas.' });
        }
    }

    async getRoutineById(
        idRoutine: string,
        res: Response
    ) {
        try {
            const routine = await this.findRoutineDetail(idRoutine);

            if (!routine) {
                return res.status(404).send({ error: 'Rutina no encontrada' });
            }

            res.status(200).send(this.buildRoutineDetailResponse(routine));
        } catch (error) {
            console.error(error);
            res.status(500).send({ error: 'Error al obtener la rutina.' });
        }
    }

    // ===================== CIRCUITOS =====================

    async createCircuit(
        createCircuitDto: CreateCircuitDto,
        res: Response
    ) {
        // Validaciones que no dependen de la base, antes de abrir la transacción
        const exerciseIds = createCircuitDto.exercises.map(exercise => exercise.exercise_id);

        if (new Set(exerciseIds).size !== exerciseIds.length) {
            return res.status(400).send({
                error: 'El circuito no puede repetir el mismo ejercicio. Si necesitás el mismo movimiento dos veces, usá una variación del catálogo.'
            });
        }

        const reglaIncumplida = this.validateCircuitSetRules(createCircuitDto);
        if (reglaIncumplida) {
            return res.status(400).send({ error: reglaIncumplida });
        }

        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // Todos los ejercicios tienen que existir en el catálogo
            const exercises = await queryRunner.manager.find(Exercise, {
                where: { id: In(exerciseIds) },
                select: { id: true },
            });

            if (exercises.length !== exerciseIds.length) {
                await queryRunner.rollbackTransaction();
                return res.status(404).send({ error: 'Algunos ejercicios no fueron encontrados' });
            }

            const circuit = await queryRunner.manager.save(
                queryRunner.manager.create(Circuit, {
                    name: createCircuitDto.name,
                    description: createCircuitDto.description,
                    type: createCircuitDto.type,
                    active: true,
                })
            );

            // exercise_order y set_order salen de la posición en el array
            for (const [exerciseIndex, exercise] of createCircuitDto.exercises.entries()) {
                const routineExercise = await queryRunner.manager.save(
                    queryRunner.manager.create(RoutineExercise, {
                        circuit_id: circuit.id,
                        exercise_id: exercise.exercise_id,
                        exercise_order: exerciseIndex + 1,
                        coach_note: exercise.coach_note,
                    })
                );

                for (const [setIndex, set] of exercise.sets.entries()) {
                    await queryRunner.manager.save(
                        queryRunner.manager.create(ExerciseSet, {
                            routine_exercise_id: routineExercise.id,
                            set_order: setIndex + 1,
                            set_count: set.set_count,
                            rep_count: set.rep_count,
                            weight: set.weight,
                            rpe: set.rpe,
                            rir: set.rir,
                            rm_perc: set.rm_perc,
                            amrap: set.amrap ?? false,
                            amrap_time: set.amrap_time,
                            rm: set.rm ?? false,
                        })
                    );
                }
            }

            await queryRunner.commitTransaction();

            // Se recarga con las relaciones para devolver el mismo formato que el detalle
            const created = await this.findCircuitDetail(circuit.id);
            return res.status(201).send(this.buildCircuitDetailResponse(created!));
        } catch (error) {
            await queryRunner.rollbackTransaction();
            console.error(error);
            res.status(500).send({ error: 'Error al crear el circuito.' });
        } finally {
            await queryRunner.release();
        }
    }

    async getAllCircuits(
        query: GetCircuitsQueryDto,
        res: Response
    ) {
        try {
            const circuits = await this.buildCircuitsQuery(query)
                .loadRelationCountAndMap('circuit.exercise_count', 'circuit.routineExercises')
                .getMany();

            res.status(200).send(circuits);
        } catch (error) {
            console.error(error);
            res.status(500).send({ error: 'Error al obtener los circuitos.' });
        }
    }

    async getAllCircuitsPlus(
        query: GetCircuitsQueryDto,
        res: Response
    ) {
        try {
            // Con los ejercicios ya cargados, el conteo sale del array: no hace falta
            // la query extra del loadRelationCountAndMap
            const circuits = await this.buildCircuitsQuery(query)
                .leftJoinAndSelect('circuit.routineExercises', 'routineExercise')
                .leftJoinAndSelect('routineExercise.exercise', 'exercise')
                .addOrderBy('routineExercise.exercise_order', 'ASC')
                .getMany();

            const response = circuits.map(circuit => ({
                id: circuit.id,
                name: circuit.name,
                description: circuit.description,
                type: circuit.type,
                active: circuit.active,
                exercise_count: circuit.routineExercises.length,
                created_at: circuit.created_at,
                updated_at: circuit.updated_at,
                exercises: circuit.routineExercises.map(routineExercise => ({
                    id: routineExercise.id,
                    exercise_order: routineExercise.exercise_order,
                    exercise: {
                        id: routineExercise.exercise.id,
                        name: routineExercise.exercise.name,
                    },
                })),
            }));

            res.status(200).send(response);
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
            const circuit = await this.findCircuitDetail(idCircuit);

            if (!circuit) {
                return res.status(404).send({ error: 'Circuito no encontrado' });
            }

            res.status(200).send(this.buildCircuitDetailResponse(circuit));
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

    // ===================== HELPERS DE RUTINA =====================

    // Filtros compartidos por el listado y el listado con circuitos
    private buildRoutinesQuery(query: GetRoutinesQueryDto): SelectQueryBuilder<Routine> {
        const queryBuilder = this.routineRepository
            .createQueryBuilder('routine')
            .orderBy('routine.name', 'ASC');

        if (!query.include_inactive) {
            queryBuilder.andWhere('routine.active = :active', { active: true });
        }

        if (query.keyword) {
            queryBuilder.andWhere(
                '(routine.name ILIKE :keyword OR routine.coach_note ILIKE :keyword)',
                { keyword: `%${query.keyword}%` }
            );
        }

        return queryBuilder;
    }

    private async findRoutineDetail(idRoutine: string): Promise<Routine | null> {
        return this.routineRepository.findOne({
            where: { id: idRoutine },
            relations: [
                'routineCircuits',
                'routineCircuits.circuit',
                'routineCircuits.circuit.routineExercises',
                'routineCircuits.circuit.routineExercises.exercise',
                'routineCircuits.circuit.routineExercises.exerciseSets',
            ],
            order: {
                routineCircuits: {
                    order: 'ASC',
                    circuit: {
                        routineExercises: {
                            exercise_order: 'ASC',
                            exerciseSets: {
                                set_order: 'ASC',
                            },
                        },
                    },
                },
            },
        });
    }

    // Compartido por el detalle y por la respuesta del alta, para que el formato no se duplique
    private buildRoutineDetailResponse(routine: Routine) {
        return {
            id: routine.id,
            name: routine.name,
            coach_note: routine.coach_note,
            active: routine.active,
            created_at: routine.created_at,
            updated_at: routine.updated_at,
            circuits: routine.routineCircuits.map(routineCircuit => ({
                id: routineCircuit.id,
                order: routineCircuit.order,
                // Mismo formato que GET /routine/circuit/:id
                circuit: this.buildCircuitDetailResponse(routineCircuit.circuit),
            })),
        };
    }

    // ===================== HELPERS DE CIRCUITO =====================

    // Filtros compartidos por el listado y el listado con ejercicios: si mañana cambia
    // alguno (por ejemplo, cuando type deje de ser string libre), se toca en un solo lugar
    private buildCircuitsQuery(query: GetCircuitsQueryDto): SelectQueryBuilder<Circuit> {
        const queryBuilder = this.circuitRepository
            .createQueryBuilder('circuit')
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

        return queryBuilder;
    }

    private validateCircuitSetRules(createCircuitDto: CreateCircuitDto): string | null {
        for (const [exerciseIndex, exercise] of createCircuitDto.exercises.entries()) {
            for (const [setIndex, set] of exercise.sets.entries()) {
                const donde = `ejercicio ${exerciseIndex + 1}, serie ${setIndex + 1}`;

                if (set.amrap_time !== undefined && set.amrap !== true) {
                    return `En ${donde}: amrap_time sólo puede enviarse con amrap = true.`;
                }

                if (set.rpe !== undefined && set.rir !== undefined) {
                    return `En ${donde}: rpe y rir son mutuamente excluyentes, son la misma escala invertida.`;
                }

                if (set.rm === true && set.set_count !== 1) {
                    return `En ${donde}: una serie marcada como rm debe tener set_count = 1. Para dos intentos, enviá dos series iguales.`;
                }
            }
        }

        return null;
    }

    private async findCircuitDetail(idCircuit: string): Promise<Circuit | null> {
        return this.circuitRepository.findOne({
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
    }

    private buildCircuitDetailResponse(circuit: Circuit) {
        return {
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
        };
    }
}

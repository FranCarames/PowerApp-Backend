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
import { RoutineExerciseFinished } from '../entities/routine_exercise_finished.entity';
import { GetCircuitsQueryDto } from '../dtos/circuit/get_circuits_query.dto';
import { SetCircuitActiveDto } from '../dtos/circuit/set_circuit_active.dto';
import { CreateCircuitDto } from '../dtos/circuit/create_circuit.dto';
import { EditCircuitDto } from '../dtos/circuit/edit_circuit.dto';
import { GetRoutinesQueryDto } from '../dtos/routine/get_routines_query.dto';
import { CreateRoutineDto } from '../dtos/routine/create_routine.dto';
import { EditRoutineDto } from '../dtos/routine/edit_routine.dto';
import { SetRoutineActiveDto } from '../dtos/routine/set_routine_active.dto';

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

    async editRoutine(
        idRoutine: string,
        editRoutineDto: EditRoutineDto,
        res: Response
    ) {
        // Validaciones que no dependen de la base, antes de abrir la transaccion
        const orders = editRoutineDto.circuits.map(circuit => circuit.order);

        if (new Set(orders).size !== orders.length) {
            return res.status(400).send({
                error: 'Dos circuitos no pueden ocupar la misma posición: el campo order tiene valores repetidos.'
            });
        }

        // El id identifica al VINCULO, no al circuito: mandarlo dos veces seria pedir que la
        // misma fila ocupe dos posiciones. El circuit_id repetido, en cambio, es valido
        const sentIds = editRoutineDto.circuits
            .map(circuit => circuit.id)
            .filter((id): id is string => !!id);

        if (new Set(sentIds).size !== sentIds.length) {
            return res.status(400).send({
                error: 'Un mismo circuito de la rutina no puede venir dos veces en la lista.'
            });
        }

        // El order es una instruccion de ordenamiento, no el valor que se guarda: se ordena
        // por el y se persiste la posicion resultante, asi la base queda siempre 1..N
        const circuitsInOrder = [...editRoutineDto.circuits].sort((a, b) => a.order - b.order);

        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // Se cargan TODOS los Routine_Circuit, activos e inactivos: un id que apunte a un
            // vinculo apagado se reactiva en vez de fallar. No deberia llegar nunca —las
            // lecturas no los devuelven—, pero asi la operacion queda idempotente
            const routine = await queryRunner.manager.findOne(Routine, {
                where: { id: idRoutine },
                relations: ['routineCircuits'],
            });

            if (!routine) {
                await queryRunner.rollbackTransaction();
                return res.status(404).send({ error: 'Rutina no encontrada' });
            }

            // Precondicion del CU: la rutina tiene que estar activa. Va 400 y no 404
            // porque el id existe: alcanza con reactivarla por set-active
            if (!routine.active) {
                await queryRunner.rollbackTransaction();
                return res.status(400).send({
                    error: `La rutina "${routine.name}" está dada de baja y no se puede editar. Reactivala primero.`
                });
            }

            const existingById = new Map(
                routine.routineCircuits.map(routineCircuit => [routineCircuit.id, routineCircuit])
            );

            // Los ids que vienen tienen que ser vinculos de ESTA rutina y apuntar al mismo
            // circuito que dice el body. Las dos cosas son bugs del front y no del entrenador,
            // pero un mensaje explicito ahorra media hora de debug del otro lado
            for (const circuit of circuitsInOrder) {
                if (!circuit.id) {
                    continue;
                }

                const existente = existingById.get(circuit.id);

                if (!existente) {
                    await queryRunner.rollbackTransaction();
                    return res.status(400).send({
                        error: `El circuito de rutina con id ${circuit.id} no pertenece a esta rutina.`
                    });
                }

                if (existente.circuit_id !== circuit.circuit_id) {
                    await queryRunner.rollbackTransaction();
                    return res.status(400).send({
                        error: `El circuito de rutina con id ${circuit.id} apunta a un circuito distinto del enviado.`
                    });
                }
            }

            // Se buscan por el set de ids unicos: un circuito repetido es una sola fila de Circuit
            const uniqueCircuitIds = [...new Set(circuitsInOrder.map(circuit => circuit.circuit_id))];

            const circuits = await queryRunner.manager.find(Circuit, {
                where: { id: In(uniqueCircuitIds) },
                select: { id: true, name: true, active: true },
            });

            if (circuits.length !== uniqueCircuitIds.length) {
                await queryRunner.rollbackTransaction();
                return res.status(404).send({ error: 'Algunos circuitos no fueron encontrados' });
            }

            // Un circuito de baja se puede CONSERVAR pero no AGREGAR. Rechazar tambien lo que
            // ya estaba trabaria la edicion de toda rutina que contenga un circuito dado de
            // baja, aunque el entrenador solo quisiera corregirle el nombre a la rutina.
            // La presencia del id es justo lo que distingue los dos casos
            const inactiveById = new Map(
                circuits.filter(circuit => !circuit.active).map(circuit => [circuit.id, circuit])
            );

            const agregadoInactivo = circuitsInOrder.find(
                circuit => !circuit.id && inactiveById.has(circuit.circuit_id)
            );

            if (agregadoInactivo) {
                await queryRunner.rollbackTransaction();
                return res.status(400).send({
                    error: `El circuito '${inactiveById.get(agregadoInactivo.circuit_id)!.name}' está dado de baja y no puede agregarse a la rutina.`
                });
            }

            // Los que estaban activos y no vuelven en la lista se apagan con order null: un
            // vinculo que ya no esta en la rutina no ocupa ninguna posicion. No se borran
            // fisicamente para conservar la traza de que circuitos integraron la rutina
            const keptIds = new Set(sentIds);

            for (const routineCircuit of routine.routineCircuits) {
                if (routineCircuit.active && !keptIds.has(routineCircuit.id)) {
                    routineCircuit.active = false;
                    routineCircuit.order = null;
                    await queryRunner.manager.save(routineCircuit);
                }
            }

            // El order persistido sale de la posicion tras ordenar, no del valor recibido
            for (const [index, circuit] of circuitsInOrder.entries()) {
                if (circuit.id) {
                    // Sobrevive o reaparece: en los dos casos queda activo y con el orden nuevo
                    const existente = existingById.get(circuit.id)!;
                    existente.active = true;
                    existente.order = index + 1;
                    await queryRunner.manager.save(existente);
                } else {
                    // Un circuito que se saco y se vuelve a agregar entra como vinculo NUEVO,
                    // al reves que en editCircuit: circuit_id no identifica nada porque puede
                    // repetirse en la rutina, asi que no hay una fila vieja que reactivar.
                    // La apagada queda como traza de que ese circuito estuvo antes
                    await queryRunner.manager.save(
                        queryRunner.manager.create(RoutineCircuit, {
                            routine_id: routine.id,
                            circuit_id: circuit.circuit_id,
                            order: index + 1,
                            active: true,
                        })
                    );
                }
            }

            // La cabecera se pisa entera. updated_at se setea a mano porque el onUpdate de
            // las entidades es sintaxis de MySQL y en Postgres no hace nada: sin esto, una
            // rutina editada seguiria mostrando la fecha del alta
            routine.name = editRoutineDto.name;
            routine.coach_note = editRoutineDto.coach_note ?? null;
            routine.updated_at = new Date();
            await queryRunner.manager.save(Routine, routine);

            await queryRunner.commitTransaction();

            // Se recarga con las relaciones para devolver el mismo formato que el detalle
            const updated = await this.findRoutineDetail(routine.id);
            return res.status(200).send(this.buildRoutineDetailResponse(updated!));
        } catch (error) {
            // La recarga del detalle pasa despues del commit: si falla ahi, la transaccion ya
            // esta cerrada y un rollback incondicional tiraria un error nuevo dentro del catch
            if (queryRunner.isTransactionActive) {
                await queryRunner.rollbackTransaction();
            }
            console.error(error);
            res.status(500).send({ error: 'Error al editar la rutina.' });
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
                // Los vinculos dados de baja no cuentan: circuit_count es de circuitos vigentes.
                // Va literal y no como parametro (a diferencia de getAllCircuits) para no
                // pisar el :active que buildRoutinesQuery usa para filtrar rutinas de baja
                .loadRelationCountAndMap(
                    'routine.circuit_count',
                    'routine.routineCircuits',
                    'routineCircuit',
                    queryBuilder => queryBuilder.andWhere('routineCircuit.active = true'),
                )
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
                .leftJoinAndSelect('routine.routineCircuits', 'routineCircuit', 'routineCircuit.active = true')
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

    async setRoutineActive(
        idRoutine: string,
        setRoutineActiveDto: SetRoutineActiveDto,
        res: Response
    ) {
        try {
            const routine = await this.routineRepository.findOne({ where: { id: idRoutine } });

            if (!routine) {
                return res.status(404).send({ error: 'Rutina no encontrada' });
            }

            // La baja no cascadea nada: los circuitos son piezas reutilizables y las
            // planificaciones que la referencian mantienen su integridad. La rutina sale de
            // circulacion para ensamblados y asignaciones NUEVOS, lo ya asignado sigue
            routine.active = setRoutineActiveDto.active;
            await this.routineRepository.save(routine);

            res.status(200).send(routine);
        } catch (error) {
            console.error(error);
            res.status(500).send({ error: 'Error al actualizar el estado de la rutina.' });
        }
    }

    // ===================== CIRCUITOS =====================

    async createCircuit(
        createCircuitDto: CreateCircuitDto,
        res: Response
    ) {
        // Validaciones que no dependen de la base, antes de abrir la transacción
        const reglaIncumplida = this.validateCircuitPayload(createCircuitDto);
        if (reglaIncumplida) {
            return res.status(400).send({ error: reglaIncumplida });
        }

        const exerciseIds = createCircuitDto.exercises.map(exercise => exercise.exercise_id);

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
            // La recarga del detalle pasa despues del commit: si falla ahi, la transaccion ya
            // esta cerrada y un rollback incondicional tiraria un error nuevo dentro del catch
            if (queryRunner.isTransactionActive) {
                await queryRunner.rollbackTransaction();
            }
            console.error(error);
            res.status(500).send({ error: 'Error al crear el circuito.' });
        } finally {
            await queryRunner.release();
        }
    }

    async editCircuit(
        idCircuit: string,
        editCircuitDto: EditCircuitDto,
        res: Response
    ) {
        // Validaciones que no dependen de la base, antes de abrir la transacción
        const reglaIncumplida = this.validateCircuitPayload(editCircuitDto);
        if (reglaIncumplida) {
            return res.status(400).send({ error: reglaIncumplida });
        }

        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // Se cargan TODOS los Routine_Exercise, activos e inactivos: un ejercicio dado
            // de baja que vuelve a la lista se reactiva en vez de duplicarse, asi queda una
            // sola fila por (circuito, ejercicio) y exercise_id sigue siendo clave natural
            const circuit = await queryRunner.manager.findOne(Circuit, {
                where: { id: idCircuit },
                relations: ['routineExercises'],
            });

            if (!circuit) {
                await queryRunner.rollbackTransaction();
                return res.status(404).send({ error: 'Circuito no encontrado' });
            }

            // Precondicion del CU: el circuito tiene que estar activo. Va 400 y no 404
            // porque el id existe: alcanza con reactivarlo por set-active
            if (!circuit.active) {
                await queryRunner.rollbackTransaction();
                return res.status(400).send({
                    error: `El circuito "${circuit.name}" está dado de baja y no se puede editar. Reactivalo primero.`
                });
            }

            const exerciseIds = editCircuitDto.exercises.map(exercise => exercise.exercise_id);

            // Todos los ejercicios tienen que existir en el catálogo
            const exercises = await queryRunner.manager.find(Exercise, {
                where: { id: In(exerciseIds) },
                select: { id: true },
            });

            if (exercises.length !== exerciseIds.length) {
                await queryRunner.rollbackTransaction();
                return res.status(404).send({ error: 'Algunos ejercicios no fueron encontrados' });
            }

            // Los que estaban activos y no vienen en la lista nueva
            const salen = circuit.routineExercises.filter(
                routineExercise => routineExercise.active && !exerciseIds.includes(routineExercise.exercise_id)
            );

            // Una sola query para saber cuales tienen historial, no una por ejercicio
            let conHistorial: string[] = [];
            if (salen.length > 0) {
                const finished = await queryRunner.manager.find(RoutineExerciseFinished, {
                    where: { routine_exercise_id: In(salen.map(routineExercise => routineExercise.id)) },
                    select: { routine_exercise_id: true },
                });
                conHistorial = finished.map(row => row.routine_exercise_id);
            }

            for (const routineExercise of salen) {
                if (conHistorial.includes(routineExercise.id)) {
                    // Alguien ya lo completo: baja logica, el historial queda intacto
                    routineExercise.active = false;
                    await queryRunner.manager.save(routineExercise);
                } else {
                    // Nadie lo hizo: baja fisica, las series se van por cascade
                    await queryRunner.manager.remove(routineExercise);
                }
            }

            // exercise_order y set_order salen de la posición en el array, igual que en el alta
            for (const [exerciseIndex, exercise] of editCircuitDto.exercises.entries()) {
                const existente = circuit.routineExercises.find(
                    routineExercise => routineExercise.exercise_id === exercise.exercise_id
                );

                let routineExercise: RoutineExercise;

                if (existente) {
                    // Sobrevive o reaparece: en los dos casos queda activo y con el orden nuevo
                    existente.active = true;
                    existente.exercise_order = exerciseIndex + 1;
                    existente.coach_note = exercise.coach_note ?? null;
                    routineExercise = await queryRunner.manager.save(existente);

                    // Las series no se reconcilian: despues de repuntar el "hecho" a
                    // Routine_Exercise nadie referencia a Exercise_Set, asi que se reemplazan
                    await queryRunner.manager.delete(ExerciseSet, { routine_exercise_id: routineExercise.id });
                } else {
                    routineExercise = await queryRunner.manager.save(
                        queryRunner.manager.create(RoutineExercise, {
                            circuit_id: circuit.id,
                            exercise_id: exercise.exercise_id,
                            exercise_order: exerciseIndex + 1,
                            coach_note: exercise.coach_note,
                            active: true,
                        })
                    );
                }

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

            // La cabecera se pisa entera. updated_at se setea a mano porque el onUpdate de
            // las entidades es sintaxis de MySQL y en Postgres no hace nada: sin esto, un
            // circuito editado seguiria mostrando la fecha del alta
            circuit.name = editCircuitDto.name;
            circuit.description = editCircuitDto.description ?? null;
            circuit.type = editCircuitDto.type;
            circuit.updated_at = new Date();
            await queryRunner.manager.save(Circuit, circuit);

            await queryRunner.commitTransaction();

            // Se recarga con las relaciones para devolver el mismo formato que el detalle
            const updated = await this.findCircuitDetail(circuit.id);
            return res.status(200).send(this.buildCircuitDetailResponse(updated!));
        } catch (error) {
            // La recarga del detalle pasa despues del commit: si falla ahi, la transaccion ya
            // esta cerrada y un rollback incondicional tiraria un error nuevo dentro del catch
            if (queryRunner.isTransactionActive) {
                await queryRunner.rollbackTransaction();
            }
            console.error(error);
            res.status(500).send({ error: 'Error al editar el circuito.' });
        } finally {
            await queryRunner.release();
        }
    }

    async getAllCircuits(
        query: GetCircuitsQueryDto,
        res: Response
    ) {
        try {
            // El alias del parametro es activeExercise y no active para no pisar el que
            // buildCircuitsQuery ya usa para filtrar circuitos dados de baja
            const circuits = await this.buildCircuitsQuery(query)
                .loadRelationCountAndMap(
                    'circuit.exercise_count',
                    'circuit.routineExercises',
                    'routineExercise',
                    qb => qb.andWhere('routineExercise.active = :activeExercise', { activeExercise: true }),
                )
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
            // La condicion va en el ON del join y no en un where: asi un circuito que
            // quedara sin ejercicios activos igual aparece en el listado
            const circuits = await this.buildCircuitsQuery(query)
                .leftJoinAndSelect(
                    'circuit.routineExercises',
                    'routineExercise',
                    'routineExercise.active = :activeExercise',
                    { activeExercise: true },
                )
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

    // Compartido por el detalle y por las respuestas del alta y la edicion, para que el
    // formato no se duplique.
    // visibleInactiveIds: ids de Routine_Circuit dados de baja que SI hay que mostrar.
    // Las lecturas del entrenador no pasan nada, asi que ven solo los activos: un circuito
    // que sacaste de la rutina no reaparece en la pantalla de edicion. Las del alumno
    // (U-08/U-09 y el historial E-06/E-07) van a pasar los vinculos apagados de los que ese
    // User_Routine tenga algun ejercicio en Routine_Exercise_Finished — mismo contrato que
    // buildCircuitDetailResponse un nivel mas abajo: se ve lo dado de baja que uno completo,
    // y solo eso. Ojo: el vinculo apagado tiene order null, asi que no conserva su posicion
    private buildRoutineDetailResponse(routine: Routine, visibleInactiveIds?: Set<string>) {
        return {
            id: routine.id,
            name: routine.name,
            coach_note: routine.coach_note,
            active: routine.active,
            created_at: routine.created_at,
            updated_at: routine.updated_at,
            circuits: routine.routineCircuits
                .filter(routineCircuit => routineCircuit.active || visibleInactiveIds?.has(routineCircuit.id))
                .map(routineCircuit => ({
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

    // Unica puerta de validacion del payload, compartida por el alta y la edicion: la
    // regla se define una sola vez y los dos endpoints devuelven el mismo mensaje
    private validateCircuitPayload(circuitDto: CreateCircuitDto): string | null {
        const exerciseIds = circuitDto.exercises.map(exercise => exercise.exercise_id);

        if (new Set(exerciseIds).size !== exerciseIds.length) {
            return 'El circuito no puede repetir el mismo ejercicio. Si necesitás el mismo movimiento dos veces, usá una variación del catálogo.';
        }

        for (const [exerciseIndex, exercise] of circuitDto.exercises.entries()) {
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

    // visibleInactiveIds: ids de Routine_Exercise dados de baja que SI hay que mostrar.
    // Las lecturas del entrenador no pasan nada, asi que ven solo los activos. Las del
    // alumno (U-08/U-09/U-10 y el historial) van a pasar los que ese User_Routine tenga
    // en Routine_Exercise_Finished: un ejercicio que completo no tiene que desaparecerle
    // de la pantalla porque el entrenador lo saco del circuito
    private buildCircuitDetailResponse(circuit: Circuit, visibleInactiveIds?: Set<string>) {
        return {
            id: circuit.id,
            name: circuit.name,
            description: circuit.description,
            type: circuit.type,
            active: circuit.active,
            created_at: circuit.created_at,
            updated_at: circuit.updated_at,
            exercises: circuit.routineExercises
                .filter(routineExercise => routineExercise.active || visibleInactiveIds?.has(routineExercise.id))
                .map(routineExercise => ({
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

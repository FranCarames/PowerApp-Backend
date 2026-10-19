import { Injectable } from '@nestjs/common';
import { Response } from 'express';

import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource, In, SelectQueryBuilder, QueryFailedError } from 'typeorm';
import { Circuit } from '../entities/circuit.entity';
import { Exercise } from '../entities/exercise.entity';
import { Routine } from '../entities/routine.entity';
import { RoutineCircuit } from '../entities/routine_circuit.entity';
import { RoutineExercise } from '../entities/routine_exercise.entity';
import { ExerciseSet } from '../entities/exercise_set.entity';
import { RoutineExerciseFinished } from '../entities/routine_exercise_finished.entity';
import { RoutineAsignExerciseFinished } from '../entities/routine_asign_exercise_finished.entity';
import { RoutineAsignationUser } from '../entities/routine_asignation_user.entity';
import { User, UserRole } from '../entities/user.entity';
import { GetCircuitsQueryDto } from '../dtos/circuit/get_circuits_query.dto';
import { SetCircuitActiveDto } from '../dtos/circuit/set_circuit_active.dto';
import { CreateCircuitDto } from '../dtos/circuit/create_circuit.dto';
import { EditCircuitDto } from '../dtos/circuit/edit_circuit.dto';
import { GetRoutinesQueryDto } from '../dtos/routine/get_routines_query.dto';
import { CreateRoutineDto } from '../dtos/routine/create_routine.dto';
import { EditRoutineDto } from '../dtos/routine/edit_routine.dto';
import { SetRoutineActiveDto } from '../dtos/routine/set_routine_active.dto';
import { AssignRoutineToUserDto } from '../dtos/routine/assign_routine_to_user.dto';
import { MarkExerciseFinishedDto } from '../dtos/routine/mark_exercise_finished.dto';
import { GetTrainingHistoryQueryDto } from '../dtos/routine/get_training_history_query.dto';
import { GetAssignedRoutinesQueryDto } from '../dtos/routine/get_assigned_routines_query.dto';
import { AuthUser } from '../authentication/auth-user.interface';

// Los dos 409 de la rutina individual. El de "ya entreno" sale por dos caminos (el chequeo
// previo y la FK RESTRICT de la base), y el de duplicado tambien (chequeo previo y unico)
const ASSIGN_DUPLICATE_ERROR = 'El alumno ya tiene esa rutina asignada ese día.';
const REMOVE_TRAINED_ERROR = 'El alumno ya entrenó esta rutina: no se puede quitar.';

// El 403 de las operaciones sobre una asignacion de otro alumno (detalle, marcar, desmarcar).
// No puede ser el texto de la cuenta deshabilitada: es el unico que hace cerrar la sesion en el web
const OTHER_STUDENT_ASSIGNMENT_ERROR = 'No podés acceder a una rutina asignada a otro alumno.';

@Injectable()
export class RoutineService {
    constructor(
        @InjectRepository(Circuit)
        private circuitRepository: Repository<Circuit>,
        @InjectRepository(Routine)
        private routineRepository: Repository<Routine>,
        @InjectDataSource()
        private dataSource: DataSource,
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(RoutineAsignationUser)
        private routineAsignationUserRepository: Repository<RoutineAsignationUser>,
        @InjectRepository(RoutineAsignExerciseFinished)
        private routineAsignExerciseFinishedRepository: Repository<RoutineAsignExerciseFinished>,
        @InjectRepository(RoutineExercise)
        private routineExerciseRepository: Repository<RoutineExercise>,
        @InjectRepository(RoutineCircuit)
        private routineCircuitRepository: Repository<RoutineCircuit>,
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

        try {
            // Dentro del try: si falla la conexion o el inicio de la transaccion, el finally
            // libera igual el query runner (release sobre uno sin conectar no hace nada)
            await queryRunner.connect();
            await queryRunner.startTransaction();

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

        try {
            // Dentro del try: si falla la conexion o el inicio de la transaccion, el finally
            // libera igual el query runner (release sobre uno sin conectar no hace nada)
            await queryRunner.connect();
            await queryRunner.startTransaction();

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

        try {
            // Dentro del try: si falla la conexion o el inicio de la transaccion, el finally
            // libera igual el query runner (release sobre uno sin conectar no hace nada)
            await queryRunner.connect();
            await queryRunner.startTransaction();

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

        try {
            // Dentro del try: si falla la conexion o el inicio de la transaccion, el finally
            // libera igual el query runner (release sobre uno sin conectar no hace nada)
            await queryRunner.connect();
            await queryRunner.startTransaction();

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

            // Dos queries, una por tabla de "hecho" (la de las planificaciones y la de las
            // asignaciones individuales), y no una por ejercicio. Si CUALQUIERA tiene una fila,
            // el ejercicio no se borra fisicamente: A-06 se apoya en que un Routine_Exercise
            // inactivo solo existe si alguien lo completo, y las FK RESTRICT lo frenarian igual
            let conHistorial: string[] = [];
            if (salen.length > 0) {
                const salenIds = salen.map(routineExercise => routineExercise.id);
                const finishedEnPlan = await queryRunner.manager.find(RoutineExerciseFinished, {
                    where: { routine_exercise_id: In(salenIds) },
                    select: { routine_exercise_id: true },
                });
                const finishedIndividual = await queryRunner.manager.find(RoutineAsignExerciseFinished, {
                    where: { routine_exercise_id: In(salenIds) },
                    select: { routine_exercise_id: true },
                });
                conHistorial = [...finishedEnPlan, ...finishedIndividual].map(row => row.routine_exercise_id);
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

    // ===================== ASIGNACION INDIVIDUAL A UN ALUMNO (CU-E-19, CU-E-20) =====================

    async assignRoutineToUser(
        assignRoutineToUserDto: AssignRoutineToUserDto,
        res: Response
    ) {
        try {
            // El orden de las validaciones es parte del contrato (spec §4.1): primero la
            // rutina, despues el destinatario, al final el duplicado. Es una sola escritura,
            // asi que no hace falta transaccion: las carreras las cierra el unico de la base
            const routine = await this.routineRepository.findOne({
                where: { id: assignRoutineToUserDto.routine_id },
                select: { id: true, name: true, active: true },
            });

            if (!routine) {
                return res.status(404).send({ error: 'Rutina no encontrada' });
            }

            // Una rutina de baja no puede asignarse de nuevo (mismo criterio que armar una
            // rutina con un circuito de baja). Lo ya asignado antes sigue vigente
            if (!routine.active) {
                return res.status(400).send({
                    error: `La rutina '${routine.name}' está dada de baja y no puede asignarse.`
                });
            }

            const user = await this.userRepository.findOne({
                where: { id: assignRoutineToUserDto.user_id },
                select: { id: true, role: true, active: true },
            });

            if (!user) {
                return res.status(404).send({ error: 'Usuario no encontrado' });
            }

            if (user.role !== UserRole.user) {
                return res.status(400).send({ error: 'La rutina sólo puede asignarse a un alumno.' });
            }

            if (!user.active) {
                return res.status(400).send({
                    error: 'La cuenta del alumno está cerrada: no se le puede asignar una rutina.'
                });
            }

            // Los ids de la consulta salen de las filas leidas y no del body: el iOS manda
            // los UUID en mayuscula, y la respuesta tiene que devolverlos como estan en la base
            const alreadyAssigned = await this.routineAsignationUserRepository.exists({
                where: { routine_id: routine.id, user_id: user.id, date: assignRoutineToUserDto.date },
            });

            if (alreadyAssigned) {
                return res.status(409).send({ error: ASSIGN_DUPLICATE_ERROR });
            }

            const assignment = await this.routineAsignationUserRepository.save(
                this.routineAsignationUserRepository.create({
                    routine_id: routine.id,
                    user_id: user.id,
                    date: assignRoutineToUserDto.date,
                })
            );

            return res.status(201).send(this.buildRoutineAssignUserResponse(assignment, routine));
        } catch (error) {
            // Dos altas simultaneas pasan las dos el chequeo previo y la segunda choca con el
            // unico. Se mira el nombre del unico para no disfrazar de duplicado otro error
            if (this.isDatabaseError(error, '23505', 'uk_rau_routine_user_date')) {
                return res.status(409).send({ error: ASSIGN_DUPLICATE_ERROR });
            }

            console.error(error);
            res.status(500).send({ error: 'Error al asignar la rutina.' });
        }
    }

    async removeRoutineFromUser(
        idAssignment: string,
        res: Response
    ) {
        try {
            const assignment = await this.routineAsignationUserRepository.findOne({
                where: { id: idAssignment },
                relations: { routine: true },
            });

            if (!assignment) {
                return res.status(404).send({ error: 'Asignación no encontrada' });
            }

            // D4: una asignacion ya entrenada no se borra, para no destruir el historial del
            // alumno. Entrenada = tiene al menos un ejercicio marcado como hecho
            const trained = await this.routineAsignExerciseFinishedRepository.exists({
                where: { user_routine_asign_id: assignment.id },
            });

            if (trained) {
                return res.status(409).send({ error: REMOVE_TRAINED_ERROR });
            }

            // Borrado fisico (spec de E-20). delete() no toca la entidad, asi que la respuesta
            // se arma con lo leido
            await this.routineAsignationUserRepository.delete({ id: assignment.id });

            return res.status(200).send(this.buildRoutineAssignUserResponse(assignment, assignment.routine));
        } catch (error) {
            // Si el alumno marco un ejercicio entre el chequeo y el borrado, el RESTRICT de la
            // base frena el DELETE (23503): es el mismo caso de "ya entreno"
            if (this.isDatabaseError(error, '23503')) {
                return res.status(409).send({ error: REMOVE_TRAINED_ERROR });
            }

            console.error(error);
            res.status(500).send({ error: 'Error al quitar la rutina del alumno.' });
        }
    }

    // El alumno lo usa para el home de la semana (from = lunes, to = domingo) y el entrenador sin
    // filtro, para ver todo lo que le asigno. Las asignaciones sobreviven a la baja de la rutina y
    // al cierre de la cuenta (spec §6): por eso no se filtra por ninguno de los dos "active"
    async getAssignedRoutines(
        userId: string,
        query: GetAssignedRoutinesQueryDto,
        res: Response
    ) {
        // Validacion que no depende de la base, antes de consultar. Los dias son 'YYYY-MM-DD' de
        // ancho fijo (IsCalendarDay), asi que comparar los strings es comparar fechas
        if (query.from && query.to && query.from > query.to) {
            return res.status(400).send({
                error: 'La fecha inicial (from) no puede ser posterior a la final (to).'
            });
        }

        try {
            const user = await this.userRepository.findOne({
                where: { id: userId },
                select: { id: true },
            });

            if (!user) {
                return res.status(404).send({ error: 'Usuario no encontrado' });
            }

            // De la rutina sale solo lo que muestra el listado. Orden de la spec §4.3: dia y
            // nombre de rutina; el alta desempata dos rutinas homonimas el mismo dia
            const assignmentsQuery = this.routineAsignationUserRepository
                .createQueryBuilder('assignment')
                .innerJoin('assignment.routine', 'routine')
                .addSelect(['routine.id', 'routine.name', 'routine.active'])
                .where('assignment.user_id = :userId', { userId: user.id })
                .orderBy('assignment.date', 'ASC')
                .addOrderBy('routine.name', 'ASC')
                .addOrderBy('assignment.created_at', 'ASC');

            // Los dos extremos son inclusivos y opcionales
            if (query.from) {
                assignmentsQuery.andWhere('assignment.date >= :from', { from: query.from });
            }

            if (query.to) {
                assignmentsQuery.andWhere('assignment.date <= :to', { to: query.to });
            }

            const assignments = await assignmentsQuery.getMany();

            if (assignments.length === 0) {
                return res.status(200).send([]);
            }

            const progressByAssignment = await this.findAssignedRoutinesProgress(assignments);

            return res.status(200).send(assignments.map(assignment => ({
                id: assignment.id,
                routine_id: assignment.routine_id,
                user_id: assignment.user_id,
                date: assignment.date,
                created_at: assignment.created_at,
                updated_at: assignment.updated_at,
                routine: {
                    id: assignment.routine.id,
                    name: assignment.routine.name,
                    active: assignment.routine.active,
                },
                progress: progressByAssignment.get(assignment.id)!,
            })));
        } catch (error) {
            console.error(error);
            res.status(500).send({ error: 'Error al obtener las rutinas asignadas.' });
        }
    }

    // Lo que el alumno abre desde su home (U-09, U-10): la rutina de UNA asignacion, con lo que ya
    // hizo. Se lee por la asignacion y no por la rutina (D8): la unidad de trabajo del alumno es la
    // asignacion del dia, y GET /routine/:id queda para coach y admin
    async getAssignedRoutineById(
        idAssignment: string,
        currentUser: AuthUser,
        res: Response
    ) {
        try {
            const assignment = await this.routineAsignationUserRepository.findOne({
                where: { id: idAssignment },
            });

            if (!assignment) {
                return res.status(404).send({ error: 'Asignación no encontrada' });
            }

            // "Dueño" = la asignacion es del alumno del token. El path trae el id de la asignacion
            // y no el del usuario, asi que no alcanza con @Owner: el chequeo va aca, en minuscula
            // (el iOS manda los UUID en mayuscula). Coach y admin abren la de cualquier alumno
            // (gimnasio compartido, D6). El texto no puede ser el de la cuenta deshabilitada: es
            // el unico que hace cerrar la sesion en el web
            if (currentUser.role === UserRole.user && !this.isAssignmentOwner(assignment, currentUser)) {
                return res.status(403).send({ error: OTHER_STUDENT_ASSIGNMENT_ERROR });
            }

            const finishedRows = await this.routineAsignExerciseFinishedRepository.find({
                where: { user_routine_asign_id: assignment.id },
                order: { created_at: 'ASC', routine_exercise_id: 'ASC' },
            });

            // La misma consulta y los mismos builders que GET /routine/:id (spec §4.4)
            const routine = await this.findRoutineDetail(assignment.routine_id);

            if (!routine) {
                return res.status(404).send({ error: 'Rutina no encontrada' });
            }

            const { visibleInactiveIds, completedIds } = this.buildAssignmentVisibility(routine, finishedRows);

            return res.status(200).send({
                id: assignment.id,
                routine_id: assignment.routine_id,
                user_id: assignment.user_id,
                date: assignment.date,
                created_at: assignment.created_at,
                updated_at: assignment.updated_at,
                routine: this.buildRoutineDetailResponse(routine, visibleInactiveIds, completedIds),
                finished: finishedRows.map(row => this.buildFinishedResponse(row)),
            });
        } catch (error) {
            console.error(error);
            res.status(500).send({ error: 'Error al obtener la rutina asignada.' });
        }
    }

    // CU-U-12, con U-13 incluido (D3): marcar un ejercicio como hecho y, en la misma fila, dejar o
    // editar la nota. El hecho es por ejercicio, no por serie: el tildado serie por serie es de la
    // interfaz. Es una sola escritura (INSERT o UPDATE), asi que no hay transaccion: la carrera de
    // dos marcas simultaneas la cierra el unico de la base. Sin ventana de fechas (D5)
    async markExerciseFinished(
        idAssignment: string,
        markExerciseFinishedDto: MarkExerciseFinishedDto,
        currentUser: AuthUser,
        res: Response
    ) {
        try {
            const assignment = await this.routineAsignationUserRepository.findOne({
                where: { id: idAssignment },
            });

            if (!assignment) {
                return res.status(404).send({ error: 'Asignación no encontrada' });
            }

            if (!this.isAssignmentOwner(assignment, currentUser)) {
                return res.status(403).send({ error: OTHER_STUDENT_ASSIGNMENT_ERROR });
            }

            // Solo un string cuenta como "viene la nota": '' la borra (spec §4.5) y null o ausente
            // significa no tocarla
            const sentNote = typeof markExerciseFinishedDto.user_note === 'string'
                ? (markExerciseFinishedDto.user_note === '' ? null : markExerciseFinishedDto.user_note)
                : undefined;

            let finished = await this.findFinishedRow(assignment.id, markExerciseFinishedDto.routine_exercise_id);

            if (!finished) {
                // No estaba marcado: el ejercicio tiene que ser de la rutina y seguir en ella
                const markable = await this.checkExerciseIsMarkable(
                    assignment.routine_id,
                    markExerciseFinishedDto.routine_exercise_id,
                );

                if ('error' in markable) {
                    return res.status(400).send({ error: markable.error });
                }

                try {
                    const created = await this.routineAsignExerciseFinishedRepository.save(
                        this.routineAsignExerciseFinishedRepository.create({
                            user_routine_asign_id: assignment.id,
                            routine_exercise_id: markable.exerciseId,
                            user_note: sentNote ?? null,
                        })
                    );

                    return res.status(201).send(this.buildFinishedResponse(created));
                } catch (error) {
                    // Dos marcas simultaneas pasan las dos la lectura y la segunda choca con el
                    // unico: se trata como "ya estaba marcado" (spec §4.5). Se mira el nombre del
                    // unico para no disfrazar otro error, y si la fila no aparece se relanza
                    if (!this.isDatabaseError(error, '23505', 'uk_raef_asign_exercise')) {
                        throw error;
                    }

                    finished = await this.findFinishedRow(assignment.id, markExerciseFinishedDto.routine_exercise_id);

                    if (!finished) {
                        throw error;
                    }
                }
            }

            // Ya estaba marcado: idempotente. Sin nota no se toca nada, y con nota solo se escribe
            // si cambia. updated_at se setea a mano: el onUpdate de las entidades es sintaxis de
            // MySQL y en Postgres no hace nada
            if (sentNote !== undefined && sentNote !== (finished.user_note ?? null)) {
                const updatedAt = new Date();

                await this.routineAsignExerciseFinishedRepository.update(
                    { id: finished.id },
                    { user_note: sentNote, updated_at: updatedAt },
                );

                finished.user_note = sentNote;
                finished.updated_at = updatedAt;
            }

            return res.status(200).send(this.buildFinishedResponse(finished));
        } catch (error) {
            console.error(error);
            res.status(500).send({ error: 'Error al marcar el ejercicio.' });
        }
    }

    // Borra la fila y, con ella, la nota. Idempotente: si no estaba marcado tambien responde 200.
    // No mira si el ejercicio sigue en la rutina: se puede desmarcar lo que el coach saco despues
    async unmarkExerciseFinished(
        idAssignment: string,
        routineExerciseId: string,
        currentUser: AuthUser,
        res: Response
    ) {
        try {
            const assignment = await this.routineAsignationUserRepository.findOne({
                where: { id: idAssignment },
            });

            if (!assignment) {
                return res.status(404).send({ error: 'Asignación no encontrada' });
            }

            if (!this.isAssignmentOwner(assignment, currentUser)) {
                return res.status(403).send({ error: OTHER_STUDENT_ASSIGNMENT_ERROR });
            }

            await this.routineAsignExerciseFinishedRepository.delete({
                user_routine_asign_id: assignment.id,
                routine_exercise_id: routineExerciseId,
            });

            // Si no habia nada que borrar no hay fila de donde sacar el id: se devuelve el del path
            // normalizado, en minuscula como el resto
            return res.status(200).send({
                routine_exercise_id: routineExerciseId.toLowerCase(),
                finished: false,
            });
        } catch (error) {
            console.error(error);
            res.status(500).send({ error: 'Error al desmarcar el ejercicio.' });
        }
    }

    // CU-E-06 y E-07: lo que un alumno entreno. Una "sesion" es una asignacion individual con al
    // menos un ejercicio hecho (la via del plan se suma en el bloque B, con source 'plan'). Gimnasio
    // compartido (D6): cualquier coach o admin ve el historial de cualquier alumno
    async getTrainingHistory(
        userId: string,
        query: GetTrainingHistoryQueryDto,
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

            // Una sola consulta que parte del "hecho" y baja hasta las series. Todo INNER salvo
            // las series (un ejercicio puede no tenerlas). Sin ningun "active": lo dado de baja
            // aparece igual si el alumno lo hizo (spec §4.7 y §6) — por eso tampoco une Circuit ni
            // Routine_Circuit. Orden de la spec: dia descendente y nombre de rutina; el resto desempata
            const historyQuery = this.routineAsignExerciseFinishedRepository
                .createQueryBuilder('finished')
                .select(['finished.id', 'finished.routine_exercise_id', 'finished.user_note', 'finished.created_at'])
                .innerJoin('finished.routineAsignationUser', 'assignment')
                .addSelect(['assignment.id', 'assignment.date', 'assignment.created_at'])
                .innerJoin('assignment.routine', 'routine')
                .addSelect(['routine.id', 'routine.name'])
                .innerJoin('finished.routineExercise', 'routineExercise')
                .addSelect(['routineExercise.id'])
                .innerJoin('routineExercise.exercise', 'exercise')
                .addSelect(['exercise.id', 'exercise.name'])
                .leftJoin('routineExercise.exerciseSets', 'exerciseSet')
                .addSelect([
                    'exerciseSet.id', 'exerciseSet.set_order', 'exerciseSet.set_count', 'exerciseSet.rep_count',
                    'exerciseSet.weight', 'exerciseSet.rm_perc', 'exerciseSet.rpe', 'exerciseSet.rir',
                    'exerciseSet.amrap', 'exerciseSet.amrap_time', 'exerciseSet.rm',
                ])
                .where('assignment.user_id = :userId', { userId: user.id })
                .orderBy('assignment.date', 'DESC')
                .addOrderBy('routine.name', 'ASC')
                .addOrderBy('assignment.created_at', 'ASC')
                .addOrderBy('finished.created_at', 'ASC')
                .addOrderBy('finished.id', 'ASC')
                .addOrderBy('exerciseSet.set_order', 'ASC');

            // E-07: el ejercicio del CATALOGO (Exercise.id). Si no hay coincidencias, el array
            // viene vacio: solo el usuario inexistente es 404
            if (query.exercise_id) {
                historyQuery.andWhere('exercise.id = :exerciseId', { exerciseId: query.exercise_id });
            }

            const finishedRows = await historyQuery.getMany();

            // Las filas ya vienen en el orden final: se agrupa por asignacion respetandolo. Los
            // ejercicios de cada sesion quedan en el orden en que el alumno los marco
            const sessions = new Map<string, {
                source: 'individual';
                assignment_id: string;
                date: string;
                routine: { id: string; name: string };
                exercises: unknown[];
            }>();

            for (const finished of finishedRows) {
                const assignment = finished.routineAsignationUser;

                if (!sessions.has(assignment.id)) {
                    sessions.set(assignment.id, {
                        source: 'individual',
                        assignment_id: assignment.id,
                        date: assignment.date,
                        routine: { id: assignment.routine.id, name: assignment.routine.name },
                        exercises: [],
                    });
                }

                // sets es la PRESCRIPCION del coach (D7): el modelo no registra la carga real
                sessions.get(assignment.id)!.exercises.push({
                    routine_exercise_id: finished.routine_exercise_id,
                    exercise: {
                        id: finished.routineExercise.exercise.id,
                        name: finished.routineExercise.exercise.name,
                    },
                    user_note: finished.user_note ?? null,
                    finished_at: finished.created_at,
                    sets: finished.routineExercise.exerciseSets.map(exerciseSet => ({
                        set_order: exerciseSet.set_order,
                        set_count: exerciseSet.set_count,
                        rep_count: exerciseSet.rep_count,
                        weight: exerciseSet.weight ?? null,
                        rm_perc: exerciseSet.rm_perc ?? null,
                        rpe: exerciseSet.rpe ?? null,
                        rir: exerciseSet.rir ?? null,
                        amrap: exerciseSet.amrap,
                        amrap_time: exerciseSet.amrap_time ?? null,
                        rm: exerciseSet.rm,
                    })),
                });
            }

            return res.status(200).send([...sessions.values()]);
        } catch (error) {
            console.error(error);
            res.status(500).send({ error: 'Error al obtener el historial de entrenamientos.' });
        }
    }

    // ===================== HELPERS DE ASIGNACION INDIVIDUAL =====================

    // La misma forma para el alta (la asignacion creada) y la baja (la asignacion borrada).
    // De la rutina sale solo id y name: el listado (BE-12) es el que suma active
    private buildRoutineAssignUserResponse(
        assignment: RoutineAsignationUser,
        routine: Pick<Routine, 'id' | 'name'>
    ) {
        return {
            id: assignment.id,
            routine_id: assignment.routine_id,
            user_id: assignment.user_id,
            date: assignment.date,
            created_at: assignment.created_at,
            updated_at: assignment.updated_at,
            routine: { id: routine.id, name: routine.name },
        };
    }

    // finished y total de cada asignacion (spec §4.3). total son los ejercicios que el alumno ve
    // en el detalle: los activos de los circuitos activos de la rutina MAS los dados de baja que
    // completo en esa asignacion, cada uno una vez. Es una union de conjuntos de ids y no una
    // suma: un circuito repetido en la rutina (A, B, A) comparte sus Routine_Exercise, y un
    // ejercicio completado puede ser a la vez activo. Por eso la cuenta se hace en memoria, con
    // dos consultas chicas, y no con un COUNT en SQL
    private async findAssignedRoutinesProgress(
        assignments: RoutineAsignationUser[]
    ): Promise<Map<string, { finished: number; total: number }>> {
        const routineIds = [...new Set(assignments.map(assignment => assignment.routine_id))];
        const assignmentIds = assignments.map(assignment => assignment.id);

        // Los ejercicios vigentes de cada rutina que aparece: activos y en un vinculo activo.
        // Raw y con alias porque no hay una entidad que los represente
        const activeRows = await this.dataSource
            .createQueryBuilder()
            .select('routineCircuit.routine_id', 'routine_id')
            .addSelect('routineExercise.id', 'routine_exercise_id')
            .distinct(true)
            .from(RoutineCircuit, 'routineCircuit')
            .innerJoin(RoutineExercise, 'routineExercise', 'routineExercise.circuit_id = routineCircuit.circuit_id')
            .where('routineCircuit.routine_id IN (:...routineIds)', { routineIds })
            .andWhere('routineCircuit.active = true')
            .andWhere('routineExercise.active = true')
            .getRawMany<{ routine_id: string; routine_exercise_id: string }>();

        // Lo hecho en cada asignacion. getRawMany y no getMany: un select parcial sin la clave
        // primaria hace que TypeORM agrupe las filas por id y colapse el resultado
        const finishedRows = await this.routineAsignExerciseFinishedRepository
            .createQueryBuilder('finished')
            .select('finished.user_routine_asign_id', 'assignment_id')
            .addSelect('finished.routine_exercise_id', 'routine_exercise_id')
            .where('finished.user_routine_asign_id IN (:...assignmentIds)', { assignmentIds })
            .getRawMany<{ assignment_id: string; routine_exercise_id: string }>();

        const activeByRoutine = new Map<string, Set<string>>();

        for (const row of activeRows) {
            if (!activeByRoutine.has(row.routine_id)) {
                activeByRoutine.set(row.routine_id, new Set());
            }
            activeByRoutine.get(row.routine_id)!.add(row.routine_exercise_id);
        }

        const finishedByAssignment = new Map<string, Set<string>>();

        for (const row of finishedRows) {
            if (!finishedByAssignment.has(row.assignment_id)) {
                finishedByAssignment.set(row.assignment_id, new Set());
            }
            finishedByAssignment.get(row.assignment_id)!.add(row.routine_exercise_id);
        }

        const progressByAssignment = new Map<string, { finished: number; total: number }>();

        for (const assignment of assignments) {
            const finished = finishedByAssignment.get(assignment.id) ?? new Set<string>();
            const visible = new Set([...(activeByRoutine.get(assignment.routine_id) ?? []), ...finished]);

            progressByAssignment.set(assignment.id, { finished: finished.size, total: visible.size });
        }

        return progressByAssignment;
    }

    // Que parte de lo dado de baja se le muestra al alumno en el detalle de una asignacion (spec
    // §4.4): un Routine_Exercise apagado, si lo completo; un Routine_Circuit apagado, si completo
    // algo de ese circuito. Se mira el CIRCUITO y no el vinculo porque la base no registra el
    // hecho por vinculo: con un circuito repetido (A, B, A) el ejercicio completado es el mismo en
    // los dos. Con esto, los ejercicios del detalle (sin repetir ids) son exactamente los de
    // BE-12: los activos de los vinculos activos mas los completados
    private buildAssignmentVisibility(
        routine: Routine,
        finishedRows: RoutineAsignExerciseFinished[]
    ): { visibleInactiveIds: Set<string>; completedIds: Set<string> } {
        const completedIds = new Set(finishedRows.map(row => row.routine_exercise_id));
        const circuitsWithCompleted = new Set<string>();
        const visibleInactiveIds = new Set<string>();

        for (const routineCircuit of routine.routineCircuits) {
            for (const routineExercise of routineCircuit.circuit.routineExercises) {
                if (!completedIds.has(routineExercise.id)) {
                    continue;
                }

                circuitsWithCompleted.add(routineCircuit.circuit_id);

                if (!routineExercise.active) {
                    visibleInactiveIds.add(routineExercise.id);
                }
            }
        }

        for (const routineCircuit of routine.routineCircuits) {
            if (!routineCircuit.active && circuitsWithCompleted.has(routineCircuit.circuit_id)) {
                visibleInactiveIds.add(routineCircuit.id);
            }
        }

        return { visibleInactiveIds, completedIds };
    }

    // "Dueño" = la asignacion es del alumno del token, comparado en minuscula (el iOS manda los
    // UUID en mayuscula). Lo usan el detalle, marcar y desmarcar: el path trae el id de la
    // asignacion y no el del alumno, asi que no alcanza con @Owner
    private isAssignmentOwner(assignment: RoutineAsignationUser, currentUser: AuthUser): boolean {
        return assignment.user_id.toLowerCase() === currentUser.id.toLowerCase();
    }

    private async findFinishedRow(
        assignmentId: string,
        routineExerciseId: string
    ): Promise<RoutineAsignExerciseFinished | null> {
        return this.routineAsignExerciseFinishedRepository.findOne({
            where: { user_routine_asign_id: assignmentId, routine_exercise_id: routineExerciseId },
        });
    }

    // Si un ejercicio que todavia no estaba marcado se puede marcar (spec §4.5). Tiene que ser de
    // la rutina: algun Routine_Circuit de ESA rutina contiene su circuito, activo o no. Y tiene que
    // seguir en ella: el ejercicio activo y al menos un vinculo activo (con un circuito repetido,
    // A, B, A, basta con uno). Un id que no existe cuenta como "no pertenece": un 404 mandaria al
    // cliente a buscar un bug de ids que no esta
    private async checkExerciseIsMarkable(
        routineId: string,
        routineExerciseId: string
    ): Promise<{ exerciseId: string } | { error: string }> {
        const exercise = await this.routineExerciseRepository.findOne({
            where: { id: routineExerciseId },
            select: { id: true, circuit_id: true, active: true },
        });

        const links = exercise
            ? await this.routineCircuitRepository.find({
                where: { routine_id: routineId, circuit_id: exercise.circuit_id },
                select: { id: true, active: true },
            })
            : [];

        if (!exercise || links.length === 0) {
            return { error: 'El ejercicio no pertenece a la rutina de esta asignación.' };
        }

        if (!exercise.active || !links.some(link => link.active)) {
            return { error: 'El ejercicio fue sacado de la rutina: ya no se puede marcar.' };
        }

        // El id de la fila y no el del body: puede venir en mayuscula
        return { exerciseId: exercise.id };
    }

    // Lo que el cliente cruza con el arbol de la rutina por routine_exercise_id. La misma forma en
    // el detalle (finished) y en la respuesta de marcar
    private buildFinishedResponse(row: RoutineAsignExerciseFinished) {
        return {
            routine_exercise_id: row.routine_exercise_id,
            user_note: row.user_note ?? null,
            created_at: row.created_at,
            updated_at: row.updated_at,
        };
    }

    // Reconoce un error de Postgres por su codigo (23505 = unico, 23503 = clave foranea).
    // constraint es opcional: sirve para no confundir el unico que importa con cualquier otro
    private isDatabaseError(error: unknown, code: string, constraint?: string): boolean {
        if (!(error instanceof QueryFailedError)) {
            return false;
        }

        const driverError: { code?: string; constraint?: string } | undefined = error.driverError;

        return driverError?.code === code && (!constraint || driverError.constraint === constraint);
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
    // visibleInactiveIds: ids de Routine_Circuit (y de Routine_Exercise, que bajan al builder del
    // circuito) dados de baja que SI hay que mostrar. Las lecturas del entrenador no pasan nada,
    // asi que ven solo los activos: un circuito que sacaste de la rutina no reaparece en la
    // pantalla de edicion. La del alumno (GET /routine/assign-user/:id) pasa lo apagado de lo que
    // esa asignacion tenga algun ejercicio hecho: se ve lo dado de baja que uno completo.
    // completedIds: los ejercicios que el alumno completo en esa asignacion. Un vinculo apagado
    // que se muestra es porque completo algo de ese circuito, pero el circuito ya no integra la
    // rutina: de el se ve lo completado y nada mas (si no, el detalle mostraria como pendientes
    // ejercicios que el entrenador saco). Ojo: el vinculo apagado tiene order null, asi que no
    // conserva su posicion y Postgres lo manda al final
    private buildRoutineDetailResponse(
        routine: Routine,
        visibleInactiveIds?: Set<string>,
        completedIds?: Set<string>
    ) {
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
                    circuit: this.buildCircuitDetailResponse(
                        routineCircuit.circuit,
                        visibleInactiveIds,
                        routineCircuit.active ? undefined : completedIds,
                    ),
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
    // Las lecturas del entrenador no pasan nada, asi que ven solo los activos. La del
    // alumno (GET /routine/assign-user/:id) pasa los que esa asignacion tenga hechos
    // (Routine_Exercise_Finished o Routine_Asign_Exercise_Finished): un ejercicio que completo
    // no tiene que desaparecerle de la pantalla porque el entrenador lo saco del circuito.
    // onlyExerciseIds: si viene, de este circuito se muestran SOLO esos ejercicios. Lo usa el
    // builder de la rutina para un vinculo apagado: el circuito ya no es parte de la rutina
    private buildCircuitDetailResponse(
        circuit: Circuit,
        visibleInactiveIds?: Set<string>,
        onlyExerciseIds?: Set<string>
    ) {
        return {
            id: circuit.id,
            name: circuit.name,
            description: circuit.description,
            type: circuit.type,
            active: circuit.active,
            created_at: circuit.created_at,
            updated_at: circuit.updated_at,
            exercises: circuit.routineExercises
                .filter(routineExercise => onlyExerciseIds
                    ? onlyExerciseIds.has(routineExercise.id)
                    : routineExercise.active || visibleInactiveIds?.has(routineExercise.id))
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

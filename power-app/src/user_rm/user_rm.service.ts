import { Injectable } from '@nestjs/common';
import { Response } from 'express';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRM } from '../entities/user_rm.entity';
import { User, UserRole } from '../entities/user.entity';
import { Exercise } from '../entities/exercise.entity';
import { CreateUserRmDto } from '../dtos/user_rm/create_user_rm.dto';
import { EditUserRmDto } from '../dtos/user_rm/edit_user_rm.dto';
import { AuthUser } from '../authentication/auth-user.interface';
import { CalculatePotentialRmDto } from '../dtos/user_rm/calculate_potential_rm.dto';
import { PotentialRmItemDto } from '../dtos/user_rm/potential_rm_response.dto';
// import { Exercise } from '../entities/exercise.entity';
// import { EditExerciseDto } from '../dtos/exercise/edit_exercise.dto';
// import { ExercisedMuscle } from '../entities/exercised_muscle.entity';
import { UsersService } from '../users/users.service';
import { AuthService } from '../authentication/auth.service';
import { ExerciseService } from '../exercise/exercise.service';


/** Hasta qué nRM se arma la tabla de RMs potenciales. Más allá de 12 repeticiones Epley pierde precisión. */
const MAX_RM_REPS = 12;

@Injectable()
export class UserRmService {
    constructor(
        @InjectRepository(UserRM)
        private userRmRepository: Repository<UserRM>,
        private userService: UsersService,
        private authService: AuthService,
        private exercisesService: ExerciseService
    ) {
    }

    async getAllUserRms(
        res: Response
    ) {
        try {
            const userRms = await this.userRmRepository.find({
                relations: ['exercise', 'user'],
                select: {
                    id: true,
                    weight: true,
                    reps: true,
                    date: true,
                    created_at: true,
                    updated_at: true,
                    exercise: {
                        id: true,
                        name: true
                    },
                    user: {
                        id: true,
                        first_name: true,
                        last_name: true
                    }
                },
            });

            res.status(200).send(userRms);
        } catch (error) {
            console.error(error);
            res.status(500).send({ error: 'Error al obtener los RMs de los usuarios.' });
        }
    }

    async getUserRmById(
        userRmId: string,
        res: Response
    ) {
        try {
            const userRm = await this.userRmRepository.find({
                where: { id: userRmId },
                relations: ['exercise', 'user'],
                select: {
                    id: true,
                    weight: true,
                    reps: true,
                    date: true,
                    created_at: true,
                    updated_at: true,
                    exercise: {
                        id: true,
                        name: true
                    },
                    user: {
                        id: true,
                        first_name: true,
                        last_name: true
                    }
                },
            });

            res.status(200).send(userRm);
        } catch (error) {
            console.error(error);
            res.status(500).send({ error: 'Error al obtener el RM de usuario.' });
        }
    }

    async getAllUserRmsByUserId(
        idUser: string,
        res: Response
    ) {
        try {
            const userRms = await this.userRmRepository.find({
                where: { user_id: idUser },
                relations: ['exercise', 'user'],
                select: {
                    id: true,
                    weight: true,
                    reps: true,
                    date: true,
                    created_at: true,
                    updated_at: true,
                    exercise: {
                        id: true,
                        name: true
                    },
                    user: {
                        id: true,
                        first_name: true,
                        last_name: true
                    }
                },
            });

            res.status(200).send(userRms);
        } catch (error) {
            console.error(error);
            res.status(500).send({ error: 'Error al obtener los RMs de los usuarios.' });
        }
    }

    async getAllUserRmsByExerciseId(
        idExercise: string,
        res: Response
    ) {
        try {
            const userRms = await this.userRmRepository.find({
                where: { exercise_id: idExercise },
                relations: ['exercise', 'user'],
                select: {
                    id: true,
                    weight: true,
                    reps: true,
                    date: true,
                    created_at: true,
                    updated_at: true,
                    exercise: {
                        id: true,
                        name: true
                    },
                    user: {
                        id: true,
                        first_name: true,
                        last_name: true
                    }
                },
            });

            res.status(200).send(userRms);
        } catch (error) {
            console.error(error);
            res.status(500).send({ error: 'Error al obtener los RMs de los usuarios.' });
        }
    }

    // CU-U-11 — Ver mis RMs de un ejercicio
    async getUserRmsByUserAndExercise(
        currentUser: AuthUser,
        idUser: string,
        idExercise: string,
        res: Response
    ) {
        try {
            // Un alumno sólo puede consultar sus propios RMs; coach y admin ven los de cualquiera.
            if (currentUser.role === UserRole.user && currentUser.id !== idUser) {
                return res.status(403).send({ error: 'No podés consultar los RMs de otro usuario.' });
            }

            const userRms = await this.userRmRepository.find({
                where: { user_id: idUser, exercise_id: idExercise },
                relations: ['exercise', 'user'],
                select: {
                    id: true,
                    weight: true,
                    reps: true,
                    date: true,
                    created_at: true,
                    updated_at: true,
                    exercise: {
                        id: true,
                        name: true
                    },
                    user: {
                        id: true,
                        first_name: true,
                        last_name: true
                    }
                },
                // Del más reciente al más viejo: sirve como referencia de progreso durante la ejecución.
                order: { date: 'DESC' },
            });

            res.status(200).send(userRms);
        } catch (error) {
            console.error(error);
            res.status(500).send({ error: 'Error al obtener los RMs del usuario para el ejercicio.' });
        }
    }

    // CU-U-16 — Calcular mis RM potenciales
    async calculatePotentialRms(
        calculatePotentialRmDto: CalculatePotentialRmDto,
        res: Response
    ) {
        try {
            const { exercise_id, weight, max_reps } = calculatePotentialRmDto;

            const exercise = await this.exercisesService._getExerciseById(exercise_id);
            if (!exercise) {
                return res.status(404).send({ error: 'Ejercicio no encontrado' });
            }

            // Epley directo: a partir del peso y las reps logradas, estima el 1RM.
            // Con max_reps = 1 no se aplica: si el usuario levantó ese peso una vez, ese peso
            // YA es su 1RM. La fórmula lo inflaría un 3.3% (120kg x 1 daría 124).
            const estimated1Rm = max_reps === 1
                ? weight
                : weight * (1 + max_reps / 30);

            // Epley inverso: para cada n, qué peso correspondería a n repeticiones.
            // La fila n = max_reps devuelve exactamente el peso informado, lo que valida la tabla.
            // n = 1 es la excepción: se usa el 1RM directo, porque la inversa en 1 repetición
            // da ~3% menos y no coincidiría con el 1RM que muestra cualquier otra calculadora.
            const potentialRms: PotentialRmItemDto[] = [];
            for (let reps = 1; reps <= MAX_RM_REPS; reps++) {
                const estimatedWeight = reps === 1
                    ? estimated1Rm
                    : estimated1Rm / (1 + reps / 30);

                potentialRms.push({ reps, weight: this.roundToTwo(estimatedWeight) });
            }

            res.status(200).send({
                exercise: { id: exercise.id, name: exercise.name },
                input: { weight, max_reps },
                formula: 'Epley',
                estimated_1rm: this.roundToTwo(estimated1Rm),
                potential_rms: potentialRms
            });
        } catch (error) {
            console.error(error);
            res.status(500).send({ error: 'Error al calcular los RMs potenciales.' });
        }
    }

    /** Redondea a 2 decimales; el redondeo a disco queda del lado del cliente. */
    private roundToTwo(value: number): number {
        return Math.round(value * 100) / 100;
    }

    async createUserRm(
        currentUserId: string,
        createUserRmDto: CreateUserRmDto,
        res: Response
    ) {
        try {
            // Un usuario solo puede crear RMs para sí mismo
            if (createUserRmDto.user_id !== currentUserId) {
                return res.status(403).send({ error: 'No podés crear RMs para otro usuario.' });
            }

            // Validar que todos los usuarios y el ejercicio existen en la base de datos
            const user = await this.userService._getUserById(createUserRmDto.user_id);
            const exercise = await this.exercisesService._getExerciseById(createUserRmDto.exercise_id);

            if (!user) {
                return res.status(404).send({ error: 'Usuario no encontrado' });
            } else if (!exercise) {
                return res.status(404).send({ error: 'Ejercicio no encontrado' });
            } else {
                const rmDate = new Date(createUserRmDto.date);
                if (Number.isNaN(rmDate.getTime())) {
                    return res.status(400).send({ error: 'Fecha inválida' });
                }

                const normalizedDate = new Date(
                    rmDate.getFullYear(),
                    rmDate.getMonth(),
                    rmDate.getDate()
                );

                const newUserRm = this.userRmRepository.create({
                    user_id: createUserRmDto.user_id,
                    exercise_id: createUserRmDto.exercise_id,
                    weight: createUserRmDto.weight,
                    reps: createUserRmDto.reps,
                    date: normalizedDate,
                });

                const savedUserRm = await this.userRmRepository.save(newUserRm);

                res.status(201).send(savedUserRm);
            }
        } catch (error) {
            console.error(error);
            res.status(500).send({ error: 'Error al crear el RM de usuario' });
        }
    }

    async editUserRm(
        currentUserId: string,
        idUserRm: string,
        editUserRmDto: EditUserRmDto,
        res: Response
    ) {
        try {
            const userRm = await this.userRmRepository.findOne({ where: { id: idUserRm } });
            if (!userRm) {
                return res.status(404).send({ error: 'RM de usuario no encontrado' });
            }

            // Solo el dueño puede editar su RM, y no puede reasignarlo a otro usuario
            if (userRm.user_id !== currentUserId || editUserRmDto.user_id !== currentUserId) {
                return res.status(403).send({ error: 'No podés editar RMs de otro usuario.' });
            }

            if (userRm.user_id !== editUserRmDto.user_id) {
                const user = await this.userService._getUserById(editUserRmDto.user_id);

                if (!user) {
                    return res.status(404).send({ error: 'Usuario no encontrado' });
                }
            }
            
            if (userRm.exercise_id !== editUserRmDto.exercise_id) {
                const exercise = await this.exercisesService._getExerciseById(editUserRmDto.exercise_id);

                if (!exercise) {
                    return res.status(404).send({ error: 'Ejercicio no encontrado' });
                }
            }

            const newRmDate = new Date(editUserRmDto.date);
            if (Number.isNaN(newRmDate.getTime())) {
                return res.status(400).send({ error: 'Fecha inválida' });
            }

            const normalizedDate = new Date(
                newRmDate.getFullYear(),
                newRmDate.getMonth(),
                newRmDate.getDate()
            );

            // Actualizar los datos del RM de usuario
            userRm.user_id = editUserRmDto.user_id;
            userRm.exercise_id = editUserRmDto.exercise_id;
            userRm.weight = editUserRmDto.weight;
            userRm.reps = editUserRmDto.reps;
            userRm.date = normalizedDate;

            const savedUserRm = await this.userRmRepository.save(userRm);
            res.status(201).send(savedUserRm);
        } catch (error) {
            console.error(error);
            res.status(500).send({ error: 'Error al crear el RM de usuario' });
        }
    }

    async deleteUserRm(
        currentUserId: string,
        userRmId: string,
        res: Response
    ) {
        try {
            const userRm = await this.userRmRepository.findOne({ where: { id: userRmId } });
            if (!userRm) {
                return res.status(404).send({ error: 'RM de usuario no encontrado' });
            }
            // Solo el dueño puede eliminar su RM
            if (userRm.user_id !== currentUserId) {
                return res.status(403).send({ error: 'No podés eliminar RMs de otro usuario.' });
            }
            await this.userRmRepository.remove(userRm);
            res.status(200).send({ message: 'RM de usuario eliminado correctamente' });
        } catch (error) {
            console.error(error);
            res.status(500).send({ error: 'Error al eliminar el RM de usuario' });
        }
    }
}
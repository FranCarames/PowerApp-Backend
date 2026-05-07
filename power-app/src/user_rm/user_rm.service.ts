import { Injectable } from '@nestjs/common';
import { Response } from 'express';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRM } from '../entities/user_rm.entity';
import { User } from '../entities/user.entity';
import { Exercise } from '../entities/exercise.entity';
import { CreateUserRmDto } from '../dtos/user_rm/create_user_rm.dto';
import { EditUserRmDto } from '../dtos/user_rm/edit_user_rm.dto';
// import { Exercise } from '../entities/exercise.entity';
// import { EditExerciseDto } from '../dtos/exercise/edit_exercise.dto';
// import { ExercisedMuscle } from '../entities/exercised_muscle.entity';
import { UsersService } from '../users/users.service';
import { AuthService } from '../authentication/auth.service';
import { ExerciseService } from '../exercise/exercise.service';


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

    async createUserRm(
        createUserRmDto: CreateUserRmDto,
        res: Response
    ) {
        try {
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
        idUserRm: string,
        editUserRmDto: EditUserRmDto,
        res: Response
    ) {
        try {
            const userRm = await this.userRmRepository.findOne({ where: { id: idUserRm } });
            if (!userRm) {
                return res.status(404).send({ error: 'RM de usuario no encontrado' });
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
        userRmId: string,
        res: Response
    ) {
        try {
            const userRm = await this.userRmRepository.findOne({ where: { id: userRmId } });
            if (!userRm) {
                return res.status(404).send({ error: 'RM de usuario no encontrado' });
            }
            await this.userRmRepository.remove(userRm);
            res.status(200).send({ message: 'RM de usuario eliminado correctamente' });
        } catch (error) {
            console.error(error);
            res.status(500).send({ error: 'Error al eliminar el RM de usuario' });
        }
    }
}
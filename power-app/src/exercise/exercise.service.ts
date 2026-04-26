import { Injectable } from '@nestjs/common';
import { Response } from 'express';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Exercise } from '../entities/exercise.entity';
import { CreateExerciseDto } from '../dtos/exercise/create_exercise.dto';
import { EditExerciseDto } from '../dtos/exercise/edit_exercise.dto';
import { ExercisedMuscle } from '../entities/exercised_muscle.entity';
import { MusclesService } from '../muscles/muscles.service';

@Injectable()
export class ExerciseService {
    constructor(
        @InjectRepository(Exercise)
        private exerciseRepository: Repository<Exercise>,
        @InjectRepository(ExercisedMuscle)
        private exercisedMuscleRepository: Repository<ExercisedMuscle>,
        private musclesService: MusclesService
    ) {
    }

    async getAllExercises(
        res: Response
    ) {
        try {
            const exercises = await this.exerciseRepository.find({
                relations: ['exercisedMuscles', 'exercisedMuscles.muscle'],
                select: {
                    id: true,
                    name: true,
                    description: true,
                    safety_tips: true,
                    activation_tips: true,
                    video_url: true,
                    preview_image: true,
                    bg_image: true,
                    exercisedMuscles: {
                        id: true,
                        muscle: {
                            id: true,
                            name: true,
                            description: true,
                            image_url: true,
                            preview_image: true,
                        }
                    }
                },
            });

            const transformedExercises = exercises.map(exercise => ({
                ...exercise,
                exercisedMuscles: exercise.exercisedMuscles.map(em => ({
                    id: em.muscle.id,
                    name: em.muscle.name,
                    description: em.muscle.description,
                    image_url: em.muscle.image_url,
                    preview_image: em.muscle.preview_image,
                })),
            }));

            res.status(200).send(transformedExercises);
        } catch (error) {
            console.error(error);
            res.status(500).send({ error: 'Error al obtener los ejercicios.' });
        }
    }

    async getExerciseById(
        idExercise: string,
        res: Response
    ) {
        try {
            const exercise = await this.exerciseRepository.findOne({ 
                where: { id: idExercise },
                relations: ['exercisedMuscles', 'exercisedMuscles.muscle'],
                select: {
                    id: true,
                    name: true,
                    description: true,
                    safety_tips: true,
                    activation_tips: true,
                    video_url: true,
                    preview_image: true,
                    bg_image: true,
                    exercisedMuscles: {
                        id: true,
                        muscle: {
                            id: true,
                            name: true,
                            description: true,
                            image_url: true,
                            preview_image: true,
                        }
                    }
                },
            });
            
            if (!exercise) {
                return res.status(404).send({ error: 'Ejercicio no encontrado' });
            }
            res.status(200).send(exercise);
        } catch (error) {
            console.error(error);
            res.status(404).send({ error: 'Error al obtener el ejercicio' });
        }
    }

    async createExercise(
        createExerciseDto: CreateExerciseDto,
        res: Response
    ) {
        try {
            // Validar que todos los músculos existen en la base de datos
            const muscles = await this.musclesService.getMusclesByIds(createExerciseDto.exercised_muscles_ids);

            if (muscles.length !== createExerciseDto.exercised_muscles_ids.length) {
                return res.status(404).send({ error: 'Algunos músculos no fueron encontrados' });
            }

            // Crear el ejercicio
            const newExercise = this.exerciseRepository.create({
                name: createExerciseDto.name,
                description: createExerciseDto.description,
                safety_tips: createExerciseDto.safety_tips,
                activation_tips: createExerciseDto.activation_tips,
                video_url: createExerciseDto.video_url,
                preview_image: createExerciseDto.preview_image,
                bg_image: createExerciseDto.bg_image,
            });

            const savedExercise = await this.exerciseRepository.save(newExercise);

            // Crear un ExercisedMuscle por cada músculo
            const exercisedMusclesPromises = createExerciseDto.exercised_muscles_ids.map(muscleId => {
                const exercisedMuscle = this.exercisedMuscleRepository.create({
                    exercise_id: savedExercise.id,
                    muscle_id: muscleId,
                });
                return this.exercisedMuscleRepository.save(exercisedMuscle);
            });
            await Promise.all(exercisedMusclesPromises);

            res.status(201).send(savedExercise);
        } catch (error) {
            console.error(error);
            res.status(500).send({ error: 'Error al crear el ejercicio' });
        }
    }

    async editExercise(
        idExercise: string,
        editExerciseDto: EditExerciseDto,
        res: Response
    ) {
        try {
            const exercise = await this.exerciseRepository.findOne({ where: { id: idExercise } });
            if (!exercise) {
                return res.status(404).send({ error: 'Ejercicio no encontrado' });
            }

            // Obtener las relaciones actuales de ExercisedMuscle para este ejercicio
            const currentExercisedMuscles = await this.exercisedMuscleRepository.find({
                where: { exercise_id: idExercise },
            });

            const currentMuscleIds = currentExercisedMuscles.map(em => em.muscle_id);
            const newMuscleIds = editExerciseDto.exercised_muscles_ids;

            // Identificar músculos a eliminar (están en el ejercicio pero no en el DTO)
            const musclesToRemove = currentMuscleIds.filter(id => !newMuscleIds.includes(id));

            // Identificar músculos a agregar (están en el DTO pero no en el ejercicio)
            const musclesToAdd = newMuscleIds.filter(id => !currentMuscleIds.includes(id));

            // Eliminar relaciones de músculos que ya no están en el DTO
            if (musclesToRemove.length > 0) {
                await this.exercisedMuscleRepository.delete({
                    exercise_id: idExercise,
                    muscle_id: musclesToRemove[0], // Eliminar uno a uno para evitar problemas
                });
                // Eliminar los restantes
                for (let i = 1; i < musclesToRemove.length; i++) {
                    await this.exercisedMuscleRepository.delete({
                        exercise_id: idExercise,
                        muscle_id: musclesToRemove[i],
                    });
                }
            }

            // Agregar nuevas relaciones para músculos que no existían
            if (musclesToAdd.length > 0) {
                // Validar que los músculos existen en la base de datos
                const muscles = await this.musclesService.getMusclesByIds(musclesToAdd);
                if (muscles.length !== musclesToAdd.length) {
                    return res.status(404).send({ error: 'Algunos músculos no fueron encontrados' });
                }

                // Crear las nuevas relaciones
                const newExercisedMuscles = musclesToAdd.map(muscleId => {
                    return this.exercisedMuscleRepository.create({
                        exercise_id: idExercise,
                        muscle_id: muscleId,
                    });
                });
                await this.exercisedMuscleRepository.save(newExercisedMuscles);
            }

            // Actualizar los datos del ejercicio
            exercise.name = editExerciseDto.name;
            exercise.description = editExerciseDto.description ?? exercise.description;
            exercise.safety_tips = editExerciseDto.safety_tips ?? exercise.safety_tips;
            exercise.activation_tips = editExerciseDto.activation_tips ?? exercise.activation_tips;
            exercise.video_url = editExerciseDto.video_url ?? exercise.video_url;
            exercise.preview_image = editExerciseDto.preview_image ?? exercise.preview_image;
            exercise.bg_image = editExerciseDto.bg_image ?? exercise.bg_image;

            const savedExercise = await this.exerciseRepository.save(exercise);
            res.status(201).send(savedExercise);
        } catch (error) {
            console.error(error);
            res.status(500).send({ error: 'Error al editar el ejercicio' });
        }
    }

    async deleteExercise(
        exerciseId: string,
        res: Response
    ) {
        try {
            const exercise = await this.exerciseRepository.findOne({ where: { id: exerciseId } });
            if (!exercise) {
                return res.status(404).send({ error: 'Ejercicio no encontrado' });
            }
            await this.exerciseRepository.remove(exercise);
            res.status(200).send({ message: 'Ejercicio eliminado correctamente' });
        } catch (error) {
            console.error(error);
            res.status(500).send({ error: 'Error al eliminar el ejercicio' });
        }
    }

    async getAllExercisedMuscles(
        res: Response
    ) {
        try {
            const exercisedMuscles = await this.exercisedMuscleRepository.find({
                relations: ['exercise', 'muscle'],
                select: {
                    id: true,
                    exercise: {
                        id: true,
                        name: true
                    },
                    muscle: {
                        id: true,
                        name: true
                    }
                },
            });

            res.status(200).send(exercisedMuscles);
        } catch (error) {
            console.error(error);
            res.status(500).send({ error: 'Error al obtener los músculos ejercitados' });
        }
    }
}

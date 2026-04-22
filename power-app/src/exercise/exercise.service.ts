import { Injectable } from '@nestjs/common';
import { Response } from 'express';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Exercise } from '../entities/exercise.entity';
// import { ExercisedMuscle } from '../entities/exercised_muscle.entity';
import { CreateExerciseDto } from '../dtos/exercise/create_exercise.dto';
import { ExercisedMuscle } from '../entities/exercised_muscle.entity';

@Injectable()
export class ExerciseService {
    constructor(
        @InjectRepository(Exercise)
        private exerciseRepository: Repository<Exercise>,
        @InjectRepository(ExercisedMuscle)
        private exercisedMuscleRepository: Repository<ExercisedMuscle>,
    ) {
    }

    async createExercise(
        createExerciseDto: CreateExerciseDto,
        res: Response
    ) {
        try {

            // const muscleGroup = await this.exerciseRepository.findOne({ where: { id: createExerciseDto.muscle_group_id } });

            // if (!muscleGroup) {
            //     return res.status(404).send({ error: 'Grupo muscular no encontrado' });
            // }

            // const newExercise = this.exerciseRepository.create(createExerciseDto);
            // const savedExercise = await this.exerciseRepository.save(newExercise);
            // res.status(201).send(savedExercise);
        } catch (error) {
            console.error(error);
            res.status(500).send({ error: 'Error al crear el ejercicio' });
        }
    }
}

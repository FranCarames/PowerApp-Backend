import { Injectable } from '@nestjs/common';
import { Response } from 'express';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Muscle } from 'src/entities/muscle.entity';

@Injectable()
export class MusclesService {
    constructor(
        @InjectRepository(Muscle)
        private muscleRepository: Repository<Muscle>,
    ) {
    }

    async getAllMuscles(
        res: Response
    ) {
        try {
            const muscles = await this.muscleRepository.find();

            res.status(200).send(muscles);
        } catch (error) {
            console.error(error);
            res.status(500).send({ error: 'Error al obtener los músculos' });
        }
    }

    async getMuscleById(
        idMuscle: string,
        res: Response
    ) {
        try {
            const muscle = await this.muscleRepository.findOne({ 
                where: { id: idMuscle },
                relations: ['muscle_group'],
                select: {
                    id: true,
                    name: true,
                    description: true,
                    image_url: true,
                    preview_image: true,
                    muscle_group: {
                        id: true,
                        name: true,
                    },
                },
            });
            
            if (!muscle) {
                return res.status(404).send({ error: 'Músculo no encontrado' });
            }
            res.status(200).send(muscle);
        } catch (error) {
            console.error(error);
            res.status(404).send({ error: 'Error al obtener el músculo' });
        }
    }
}
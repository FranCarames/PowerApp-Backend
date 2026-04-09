import { Injectable } from '@nestjs/common';
import { Response } from 'express';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MuscleGroup } from 'src/entities/muscle_group.entity';

@Injectable()
export class MuscleGroupsService {
    constructor(
        @InjectRepository(MuscleGroup)
        private muscleGroupsRepository: Repository<MuscleGroup>,
    ) {
    }

    async getAllMuscleGroups(
        res: Response
    ) {
        try {
            const muscleGroups = await this.muscleGroupsRepository.find();
            res.status(200).send(muscleGroups);
        } catch (error) {
            console.error(error);
            res.status(500).send({ error: 'Error al obtener los grupos musculares' });
        }
    }
}
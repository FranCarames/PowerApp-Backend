import { Injectable } from '@nestjs/common';
import { Response } from 'express';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MuscleGroup } from '../entities/muscle_group.entity';
import { CreateMuscleGroupDto } from '../dtos/muscle_groups/create_muscle_group.dto';

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

    async getMuscleGroupId(
        idMuscleGroup: string,
        res: Response
    ) {
        try {
            const muscleGroup = await this.muscleGroupsRepository.findOne({ where: { id: idMuscleGroup } });

            if (!muscleGroup) {
                throw new Error('Grupo muscular no encontrado');
            }
            res.status(200).send(muscleGroup);
        } catch (error) {
            console.error(error);
            res.status(404).send({ error: 'Error al obtener el grupo muscular solicitado' });
        } 
    }

    async createMuscleGroup(
        createMuscleGroupDto: CreateMuscleGroupDto,
        res: Response
    ) {
        try {
            const newMuscleGroup = this.muscleGroupsRepository.create(createMuscleGroupDto);
            const savedMuscleGroup = await this.muscleGroupsRepository.save(newMuscleGroup);
            res.status(201).send(savedMuscleGroup);
        } catch (error) {
            console.error(error);
            res.status(500).send({ error: 'Error al crear el grupo muscular' });
        }
    }
}
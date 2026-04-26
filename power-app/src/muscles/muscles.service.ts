import { Injectable } from '@nestjs/common';
import { Response } from 'express';

import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Muscle } from '../entities/muscle.entity';
import { MuscleGroup } from '../entities/muscle_group.entity';
import { CreateMuscleDto } from '../dtos/muscles/create_muscle.dto';
import { EditMuscleDto } from '../dtos/muscles/edit_muscle.dto';
import { CreateMuscleGroupDto } from '../dtos/muscle_groups/create_muscle_group.dto';
import { EditMuscleGroupDto } from '../dtos/muscle_groups/edit_muscle_group.dto';

@Injectable()
export class MusclesService {
    constructor(
        @InjectRepository(Muscle)
        private muscleRepository: Repository<Muscle>,
        @InjectRepository(MuscleGroup)
        private muscleGroupsRepository: Repository<MuscleGroup>,
    ) {
    }

    async getAllMuscles(
        res: Response
    ) {
        try {
            const muscles = await this.muscleRepository.find({
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

    async getMusclesByIds(ids: string[]): Promise<Muscle[]> {
        return this.muscleRepository.findBy({ id: In(ids) });
    }

    async createMuscle(
        createMuscleDto: CreateMuscleDto,
        res: Response
    ) {
        try {
            const muscleGroup = await this.muscleGroupsRepository.findOne({ where: { id: createMuscleDto.muscle_group_id } });

            if (!muscleGroup) {
                return res.status(404).send({ error: 'Grupo muscular no encontrado' });
            }

            const newMuscle = this.muscleRepository.create(createMuscleDto);
            const savedMuscle = await this.muscleRepository.save(newMuscle);
            res.status(201).send(savedMuscle);
        } catch (error) {
            console.error(error);
            res.status(500).send({ error: 'Error al crear el músculo' });
        }
    }

    async editMuscle(
        idMuscle: string,
        editMuscleDto: EditMuscleDto,
        res: Response
    ) {
        try {
            const muscle = await this.muscleRepository.findOne({ where: { id: idMuscle } });
            if (!muscle) {
                return res.status(404).send({ error: 'Músculo no encontrado' });
            }

            if (muscle.muscle_group_id !== editMuscleDto.muscle_group_id) {
                const muscleGroup = await this.muscleGroupsRepository.findOne({ where: { id: editMuscleDto.muscle_group_id } });
                if (!muscleGroup) {
                    return res.status(404).send({ error: 'Grupo muscular no encontrado' });
                }
                muscle.muscle_group_id = editMuscleDto.muscle_group_id;
            }

            muscle.name = editMuscleDto.name;
            muscle.description = editMuscleDto.description;
            muscle.image_url = editMuscleDto.image_url;
            muscle.preview_image = editMuscleDto.preview_image;
            muscle.updated_at = new Date(); 

            const savedMuscle = await this.muscleRepository.save(muscle);
            res.status(201).send(savedMuscle);
        } catch (error) {
            console.error(error);
            res.status(500).send({ error: 'Error al crear el músculo' });
        }
    }

    async deleteMuscle(
        muscleId: string,
        res: Response
    ) {
        try {
            const muscle = await this.muscleRepository.findOne({ where: { id: muscleId } });
            if (!muscle) {
                return res.status(404).send({ error: 'Músculo no encontrado' });
            }
            await this.muscleRepository.remove(muscle);
            res.status(200).send({ message: 'Músculo eliminado correctamente' });
        } catch (error) {
            console.error(error);
            res.status(500).send({ error: 'Error al eliminar el músculo' });
        }
    }

    async getAllMuscleGroups(
        res: Response
    ) {
        try {
            const muscleGroups = await this.muscleGroupsRepository.find({
                relations: ['muscles'],
                select: {
                    id: true,
                    name: true,
                    image_url: true,
                    preview_image: true,
                    muscles: {
                        id: true,
                        name: true,
                        description: true
                    },
                },
            });

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
            const muscleGroup = await this.muscleGroupsRepository.findOne({ 
                where: { id: idMuscleGroup },
                relations: ['muscles'],
                select: {
                    id: true,
                    name: true,
                    image_url: true,
                    preview_image: true,
                    muscles: {
                        id: true,
                        name: true,
                        description: true
                    },
                },
            });

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

    async editMuscleGroup(
        idMuscleGroup: string,
        editMuscleGroupDto: EditMuscleGroupDto,
        res: Response
    ) {
        try {
            const muscleGroup = await this.muscleGroupsRepository.findOne({ where: { id: idMuscleGroup } });
            if (!muscleGroup) {
                return res.status(404).send({ error: 'Grupo muscular no encontrado' });
            }

            muscleGroup.name = editMuscleGroupDto.name;
            muscleGroup.image_url = editMuscleGroupDto.image_url;
            muscleGroup.preview_image = editMuscleGroupDto.preview_image;
            muscleGroup.updated_at = new Date();

            const savedMuscleGroup = await this.muscleGroupsRepository.save(muscleGroup);
            res.status(201).send(savedMuscleGroup);
        } catch (error) {
            console.error(error);
            res.status(500).send({ error: 'Error al editar el grupo muscular' });
        }
    }
    
    async deleteMuscleGroup(
        muscleGroupId: string,
        res: Response
    ) {
        try {
            const muscleGroup = await this.muscleGroupsRepository.findOne({ where: { id: muscleGroupId } });
            if (!muscleGroup) {
                return res.status(404).send({ error: 'Grupo muscular no encontrado' });
            }
            await this.muscleGroupsRepository.remove(muscleGroup);
            res.status(200).send({ message: 'Grupo muscular eliminado correctamente' });
        } catch (error) {
            console.error(error);
            res.status(500).send({ error: 'Error al eliminar el grupo muscular' });
        }
    }   
}
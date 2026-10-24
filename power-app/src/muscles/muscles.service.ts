import { Injectable } from '@nestjs/common';
import { Response } from 'express';

import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Muscle } from '../entities/muscle.entity';
import { MuscleGroup } from '../entities/muscle_group.entity';
import { ExercisedMuscle } from '../entities/exercised_muscle.entity';
import { CreateMuscleDto } from '../dtos/muscles/create_muscle.dto';
import { EditMuscleDto } from '../dtos/muscles/edit_muscle.dto';
import { CreateMuscleGroupDto } from '../dtos/muscle_groups/create_muscle_group.dto';
import { EditMuscleGroupDto } from '../dtos/muscle_groups/edit_muscle_group.dto';
import { isDatabaseError } from '../common/database_error';

/** Conflicto de unicidad del nombre del grupo muscular (CU-A-13 y CU-A-14). */
const DUPLICATE_GROUP_NAME_ERROR = 'Ya existe un grupo muscular con ese nombre';

/** Bajas que impide la integridad referencial (CU-A-10 y CU-A-15). */
const DELETE_MUSCLE_IN_USE_ERROR = 'No se puede eliminar el músculo: está asociado a ejercicios';
const DELETE_GROUP_WITH_MUSCLES_ERROR = 'No se puede eliminar el grupo muscular: todavía tiene músculos';

@Injectable()
export class MusclesService {
    constructor(
        @InjectRepository(Muscle)
        private muscleRepository: Repository<Muscle>,
        @InjectRepository(MuscleGroup)
        private muscleGroupsRepository: Repository<MuscleGroup>,
        @InjectRepository(ExercisedMuscle)
        private exercisedMuscleRepository: Repository<ExercisedMuscle>,
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

            // Un músculo asociado a ejercicios no se elimina (CU-A-10): antes la FK en CASCADE lo
            // sacaba de sus ejercicios. Desde BE-24 la FK es RESTRICT, y el catch cubre la carrera
            // de un ejercicio que lo suma entre este control y el DELETE.
            if (await this.exercisedMuscleRepository.count({ where: { muscle_id: muscleId } }) > 0) {
                return res.status(409).send({ error: DELETE_MUSCLE_IN_USE_ERROR });
            }

            await this.muscleRepository.remove(muscle);
            res.status(200).send({ message: 'Músculo eliminado correctamente' });
        } catch (error) {
            if (isDatabaseError(error, '23503', 'fk_exercised_muscle_muscle')) {
                return res.status(409).send({ error: DELETE_MUSCLE_IN_USE_ERROR });
            }

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

    /** Nombre listo para compararlo: sin espacios en los extremos y sin distinguir mayúsculas. */
    private normalizeName(name: string): string {
        return name.trim().toLowerCase();
    }

    /**
     * Si otro grupo muscular ya tiene ese nombre. Se compara en memoria, igual que ejercicios y
     * membresías: son unos pocos grupos, y así no depende del collation ni del LOWER de la base.
     */
    private async isGroupNameTaken(name: string, excludeId?: string): Promise<boolean> {
        const wanted = this.normalizeName(name);
        const muscleGroups = await this.muscleGroupsRepository.find({ select: { id: true, name: true } });

        return muscleGroups.some(mg => mg.id !== excludeId && this.normalizeName(mg.name) === wanted);
    }

    async createMuscleGroup(
        createMuscleGroupDto: CreateMuscleGroupDto,
        res: Response
    ) {
        try {
            if (await this.isGroupNameTaken(createMuscleGroupDto.name)) {
                return res.status(409).send({ error: DUPLICATE_GROUP_NAME_ERROR });
            }

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

            // Sólo se controla si el nombre cambia (igual que ejercicios y membresías): un duplicado
            // heredado no bloquea editar las imágenes.
            if (this.normalizeName(editMuscleGroupDto.name) !== this.normalizeName(muscleGroup.name)
                && await this.isGroupNameTaken(editMuscleGroupDto.name, muscleGroup.id)) {
                return res.status(409).send({ error: DUPLICATE_GROUP_NAME_ERROR });
            }

            muscleGroup.name = editMuscleGroupDto.name;
            muscleGroup.image_url = editMuscleGroupDto.image_url;
            muscleGroup.preview_image = editMuscleGroupDto.preview_image;

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

            // Un grupo con músculos no se elimina (CU-A-15): antes la FK en CASCADE borraba sus
            // músculos y los vínculos de esos músculos con ejercicios. Desde BE-25 la FK es RESTRICT,
            // y el catch cubre la carrera de un músculo creado entre este control y el DELETE.
            if (await this.muscleRepository.count({ where: { muscle_group_id: muscleGroupId } }) > 0) {
                return res.status(409).send({ error: DELETE_GROUP_WITH_MUSCLES_ERROR });
            }

            await this.muscleGroupsRepository.remove(muscleGroup);
            res.status(200).send({ message: 'Grupo muscular eliminado correctamente' });
        } catch (error) {
            if (isDatabaseError(error, '23503', 'fk_muscle_muscle_group')) {
                return res.status(409).send({ error: DELETE_GROUP_WITH_MUSCLES_ERROR });
            }

            console.error(error);
            res.status(500).send({ error: 'Error al eliminar el grupo muscular' });
        }
    }   
}
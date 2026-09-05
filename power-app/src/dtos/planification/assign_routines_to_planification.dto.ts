import { IsNotEmpty, IsUUID, IsArray, ArrayNotEmpty, ArrayMaxSize } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignRoutinesToPlanificationDto {

    @ApiProperty({ example: 'uuid-1234' })
    @IsNotEmpty()
    @IsUUID('all', { message: 'El ID de planificación debe ser un UUID válido' })
    planification_id!: string;

    @ApiProperty({ example: ['uuid-1234', 'uuid-5678'], description: 'Se asignan al final del plan, consecutivas y en el orden del array. Se permiten ids repetidos: crean una asignación cada uno' })
    @IsArray()
    @ArrayNotEmpty({ message: 'Hay que enviar al menos una rutina' })
    @ArrayMaxSize(50, { message: 'No se pueden asignar más de 50 rutinas por vez' })
    @IsUUID('all', { each: true, message: 'Cada ID de rutina debe ser un UUID válido' })
    routine_ids!: string[];
}

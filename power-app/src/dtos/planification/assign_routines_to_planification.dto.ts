import { IsNotEmpty, IsUUID, IsArray, ArrayNotEmpty, ArrayMaxSize, IsInt, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { INTEGER_MAX } from './planification_limits';

export class AssignRoutinesToPlanificationDto {

    @ApiProperty({ example: 'uuid-1234' })
    @IsNotEmpty()
    @IsUUID('all', { message: 'El ID de planificación debe ser un UUID válido' })
    planification_id!: string;

    @ApiProperty({ example: 1, minimum: 1, description: 'Semana del plan en la que van todas las rutinas del lote (una semana por lote). Si la planificación tiene duración mayor que 0, no puede superarla (400)' })
    @IsNotEmpty()
    @IsInt()
    @Min(1)
    @Max(INTEGER_MAX)
    week!: number;

    @ApiProperty({ example: ['uuid-1234', 'uuid-5678'], description: 'Se asignan al final de esa semana, consecutivas y en el orden del array. Se permiten ids repetidos: crean una asignación cada uno' })
    @IsArray()
    @ArrayNotEmpty({ message: 'Hay que enviar al menos una rutina' })
    @ArrayMaxSize(50, { message: 'No se pueden asignar más de 50 rutinas por vez' })
    @IsUUID('all', { each: true, message: 'Cada ID de rutina debe ser un UUID válido' })
    routine_ids!: string[];
}

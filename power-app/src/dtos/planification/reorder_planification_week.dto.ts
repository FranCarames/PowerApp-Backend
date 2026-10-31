import { IsNotEmpty, IsUUID, IsArray, ArrayNotEmpty, IsInt, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { INTEGER_MAX } from './planification_limits';

export class ReorderPlanificationWeekDto {

    @ApiProperty({ example: 'uuid-1234' })
    @IsNotEmpty()
    @IsUUID('all', { message: 'El ID de planificación debe ser un UUID válido' })
    planification_id!: string;

    @ApiProperty({ example: 1, minimum: 1, maximum: INTEGER_MAX, description: 'Semana que se reordena' })
    @IsNotEmpty()
    @IsInt()
    @Min(1)
    @Max(INTEGER_MAX)
    week!: number;

    // Sin tope propio de largo: la igualdad con las vigentes de la semana ya lo acota. Los repetidos, los
    // faltantes y los extras los resuelve el service con el 400 «la lista no coincide»
    @ApiProperty({ type: [String], example: ['uuid-1234', 'uuid-5678'], minItems: 1, description: 'Ids de las asignaciones (Routine_Asignation, los routines[].id del detalle) en el orden nuevo. Tienen que ser exactamente las vigentes de la semana, sin faltantes, extras ni repetidos (400): quedan con order 1, 2, 3…' })
    @IsArray()
    @ArrayNotEmpty({ message: 'Hay que enviar al menos una asignación' })
    @IsUUID('all', { each: true, message: 'Cada ID de asignación debe ser un UUID válido' })
    routine_asignation_ids!: string[];
}

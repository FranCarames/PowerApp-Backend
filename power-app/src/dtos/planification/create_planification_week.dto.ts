import { IsNotEmpty, IsUUID, IsArray, ArrayNotEmpty, ArrayMaxSize, IsInt, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { INTEGER_MAX } from './planification_limits';

// Una semana del plan que se crea ya armada (CU-E-09): vive dentro de CreatePlanificationDto.weeks
export class CreatePlanificationWeekDto {

    @ApiProperty({ example: 1, minimum: 1, maximum: INTEGER_MAX, description: 'Semana del plan. Si la duración es mayor que 0, no puede superarla (400). No puede repetirse entre las entradas de weeks (400)' })
    @IsNotEmpty()
    @IsInt()
    @Min(1)
    @Max(INTEGER_MAX)
    week!: number;

    @ApiProperty({ type: [String], example: ['uuid-1234', 'uuid-5678'], minItems: 1, maxItems: 50, description: 'Rutinas de la semana, en orden: quedan con order 1, 2, 3… Se permiten ids repetidos: crean una asignación cada uno. Las semanas vacías no se mandan' })
    @IsArray()
    @ArrayNotEmpty({ message: 'Hay que enviar al menos una rutina' })
    @ArrayMaxSize(50, { message: 'No se pueden asignar más de 50 rutinas por semana' })
    @IsUUID('all', { each: true, message: 'Cada ID de rutina debe ser un UUID válido' })
    routine_ids!: string[];
}

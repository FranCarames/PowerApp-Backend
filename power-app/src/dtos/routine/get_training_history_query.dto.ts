import { IsOptional, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetTrainingHistoryQueryDto {

    @ApiPropertyOptional({ example: 'uuid-1234', description: 'Id de un ejercicio del catálogo (Exercise.id, no el Routine_Exercise). Con él, sólo vuelven las sesiones donde el alumno hizo ese ejercicio y, en cada una, únicamente ese ejercicio (CU-E-07). Si no coincide ninguna, el array viene vacío' })
    @IsOptional()
    @IsUUID('all', { message: 'El ID de ejercicio debe ser un UUID válido' })
    exercise_id?: string;
}

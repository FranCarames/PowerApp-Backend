import { IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MarkExerciseFinishedDto {

    @ApiProperty({ example: 'uuid-1234', description: 'Id del Routine_Exercise que el alumno hizo (en el árbol del detalle es el campo id de cada ejercicio). El hecho es por ejercicio, no por serie: el tildado serie por serie es de la interfaz' })
    @IsNotEmpty()
    @IsUUID('all', { message: 'El ID de ejercicio debe ser un UUID válido' })
    routine_exercise_id!: string;

    @ApiPropertyOptional({ example: 'Me costó la última serie', maxLength: 100, description: 'Nota del alumno sobre el ejercicio. Si se omite, no se toca la nota (en un ejercicio nuevo queda sin nota). La cadena vacía la borra' })
    @IsOptional()
    @IsString()
    @MaxLength(100)
    user_note?: string;
}

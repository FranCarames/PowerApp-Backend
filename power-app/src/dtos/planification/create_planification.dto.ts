import { IsNotEmpty, IsString, IsOptional, MaxLength, IsInt, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePlanificationDto {

    @ApiProperty({ example: 'Plan fuerza 3 días', maxLength: 50, description: 'Obligatorio acá aunque la columna sea nullable: no se cargan planificaciones sin nombre' })
    @IsNotEmpty()
    @IsString()
    @MaxLength(50)
    name!: string;

    @ApiProperty({ example: 3, minimum: 1, description: 'Rutinas que el entrenador declara para el plan. Es la intención del plan, no el conteo real: ese es routine_count, que sale de las rutinas efectivamente asignadas por CU-E-12' })
    @IsNotEmpty()
    @IsInt()
    @Min(1)
    number_of_routines!: number;

    @ApiPropertyOptional({ example: 'Planificación orientada a fuerza máxima', maxLength: 1000, description: 'La columna es TEXT sin límite; el tope es sanidad de input' })
    @IsOptional()
    @IsNotEmpty()
    @IsString()
    @MaxLength(1000)
    description?: string;

    @ApiPropertyOptional({ example: 'fuerza', maxLength: 30 })
    @IsOptional()
    @IsNotEmpty()
    @IsString()
    @MaxLength(30)
    type?: string;

    @ApiPropertyOptional({ example: '12 semanas', maxLength: 50 })
    @IsOptional()
    @IsNotEmpty()
    @IsString()
    @MaxLength(50)
    duration?: string;
}

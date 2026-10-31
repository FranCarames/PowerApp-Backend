import { IsNotEmpty, IsString, IsOptional, MaxLength, IsInt, Min, Max, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { INTEGER_MAX } from './planification_limits';
import { CreatePlanificationWeekDto } from './create_planification_week.dto';

export class CreatePlanificationDto {

    @ApiProperty({ example: 'Plan fuerza 3 días', maxLength: 50, description: 'Obligatorio acá aunque la columna sea nullable: no se cargan planificaciones sin nombre' })
    @IsNotEmpty()
    @IsString()
    @MaxLength(50)
    name!: string;

    @ApiProperty({ example: 3, minimum: 1, description: 'Rutinas por semana: cuántas rutinas lleva cada semana del plan. Define los huecos de cada semana; no es un tope (una semana puede terminar con más o con menos, o vacía). Es la intención del plan, no el conteo real: ese es routine_count, que sale de las rutinas efectivamente asignadas por CU-E-12' })
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

    @ApiProperty({ example: 12, minimum: 0, maximum: INTEGER_MAX, description: 'Duración del plan en semanas. 0 = sin duración fija. Si es mayor que 0, limita la semana (week) de las rutinas del plan a 1..duration. Obligatoria, también al editar. Al editar, si es mayor que 0 no puede ser menor que la semana más alta usada por una rutina vigente del plan (400)' })
    @IsNotEmpty()
    @IsInt()
    @Min(0)
    @Max(INTEGER_MAX)
    duration!: number;

    // Solo del alta: al editar, las rutinas de un plan que ya existe se cambian con sus propios endpoints
    // (EditPlanificationDto lo saca)
    @ApiPropertyOptional({ type: [CreatePlanificationWeekDto], description: 'Rutinas de cada semana, para crear el plan ya armado (CU-E-09). Sin weeks o con [], el plan se crea sin rutinas. Solo las semanas que tienen rutinas (de 1 a 50 por semana); sin semanas repetidas. Todo o nada: la planificación y sus rutinas se guardan en una sola operación, y si algo falla no se crea ninguna de las dos' })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreatePlanificationWeekDto)
    weeks?: CreatePlanificationWeekDto[];
}

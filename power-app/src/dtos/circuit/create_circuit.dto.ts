import {
  IsNotEmpty, IsUUID, IsArray, ArrayNotEmpty, ValidateNested,
  IsString, IsOptional, MaxLength, IsInt, IsNumber, IsBoolean, Min, Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCircuitSetDto {

    @ApiProperty({ example: 3, minimum: 1, maximum: 20, description: 'Cantidad de series del bloque. Una fila es un bloque de series iguales: set_count 3 con rep_count 8 es "3x8"' })
    @IsNotEmpty()
    @IsInt()
    @Min(1)
    @Max(20)
    set_count!: number;

    @ApiProperty({ example: 8, minimum: 1, maximum: 1000, description: 'Repeticiones por serie. Con amrap = true se interpreta como reps objetivo; el valor 1 significa "sin objetivo"' })
    @IsNotEmpty()
    @IsInt()
    @Min(1)
    @Max(1000)
    rep_count!: number;

    @ApiPropertyOptional({ example: 80.5, minimum: 0.01, maximum: 1000 })
    @IsOptional()
    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0.01)
    @Max(1000)
    weight?: number;

    @ApiPropertyOptional({ example: 7, minimum: 1, maximum: 10, description: 'Escala RPE. Mutuamente excluyente con rir' })
    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(10)
    rpe?: number;

    @ApiPropertyOptional({ example: 2, minimum: 0, maximum: 10, description: 'Repeticiones en reserva. Mutuamente excluyente con rpe' })
    @IsOptional()
    @IsInt()
    @Min(0)
    @Max(10)
    rir?: number;

    @ApiPropertyOptional({ example: 75, minimum: 1, maximum: 125, description: 'Porcentaje del 1RM. Llega a 125 para permitir trabajo supramáximo' })
    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(125)
    rm_perc?: number;

    @ApiPropertyOptional({ example: false, default: false, description: 'Serie al fallo. Con amrap_time, AMRAP cronometrado' })
    @IsOptional()
    @IsBoolean()
    amrap?: boolean = false;

    @ApiPropertyOptional({ example: 60, minimum: 1, description: 'Duración del AMRAP en segundos. Sólo válido con amrap = true' })
    @IsOptional()
    @IsInt()
    @Min(1)
    amrap_time?: number;

    @ApiPropertyOptional({ example: false, default: false, description: 'Marca el bloque como intento de RM. Exige set_count = 1: dos intentos se mandan como dos series iguales' })
    @IsOptional()
    @IsBoolean()
    rm?: boolean = false;
}

export class CreateCircuitExerciseDto {

    @ApiProperty({ example: 'uuid-1234', description: 'ID del ejercicio del catálogo. No puede repetirse dentro del circuito' })
    @IsNotEmpty()
    @IsUUID('4', { message: 'El ID de ejercicio debe ser un UUID válido' })
    exercise_id!: string;

    @ApiPropertyOptional({ example: 'Bajar lento en 3 segundos', maxLength: 100 })
    @IsOptional()
    @IsNotEmpty()
    @IsString()
    @MaxLength(100)
    coach_note?: string;

    @ApiProperty({ type: [CreateCircuitSetDto], description: 'Series prescritas, en orden. Al menos una' })
    @IsArray()
    @ArrayNotEmpty({ message: 'Cada ejercicio debe tener al menos una serie' })
    @ValidateNested({ each: true })
    @Type(() => CreateCircuitSetDto)
    sets!: CreateCircuitSetDto[];
}

export class CreateCircuitDto {

    @ApiProperty({ example: 'Entrada en calor - Tren superior', maxLength: 100 })
    @IsNotEmpty()
    @IsString()
    @MaxLength(100)
    name!: string;

    @ApiPropertyOptional({ example: 'Movilidad de hombro y activación de manguito', maxLength: 100 })
    @IsOptional()
    @IsNotEmpty()
    @IsString()
    @MaxLength(100)
    description?: string;

    @ApiProperty({ example: 'entrada en calor', maxLength: 30 })
    @IsNotEmpty()
    @IsString()
    @MaxLength(30)
    type!: string;

    @ApiProperty({ type: [CreateCircuitExerciseDto], description: 'Ejercicios del circuito, en orden. Al menos uno' })
    @IsArray()
    @ArrayNotEmpty({ message: 'El circuito debe tener al menos un ejercicio' })
    @ValidateNested({ each: true })
    @Type(() => CreateCircuitExerciseDto)
    exercises!: CreateCircuitExerciseDto[];
}

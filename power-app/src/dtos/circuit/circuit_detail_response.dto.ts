import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CircuitSetResponseDto {

    @ApiProperty({ example: 'uuid-1234' })
    id!: string;

    @ApiProperty({ example: 1 })
    set_order!: number;

    @ApiProperty({ example: 3 })
    set_count!: number;

    @ApiProperty({ example: 8 })
    rep_count!: number;

    @ApiPropertyOptional({ example: 80.5 })
    weight?: number;

    @ApiPropertyOptional({ example: 7 })
    rpe?: number;

    @ApiPropertyOptional({ example: 2 })
    rir?: number;

    @ApiPropertyOptional({ example: 75 })
    rm_perc?: number;

    @ApiProperty({ example: false })
    amrap!: boolean;

    @ApiPropertyOptional({ example: 60 })
    amrap_time?: number;

    @ApiProperty({ example: false })
    rm!: boolean;
}

export class CircuitExerciseResponseDto {

    @ApiProperty({ example: 'uuid-1234', description: 'Id del Routine_Exercise (no el del Exercise)' })
    id!: string;

    @ApiProperty({ example: 1 })
    exercise_order!: number;

    @ApiPropertyOptional({ example: 'Bajar lento en 3 segundos' })
    coach_note?: string;

    @ApiProperty({ description: 'Ficha del ejercicio del catálogo' })
    exercise!: Record<string, any>;

    @ApiProperty({ type: [CircuitSetResponseDto] })
    sets!: CircuitSetResponseDto[];
}

export class CircuitDetailResponseDto {

    @ApiProperty({ example: 'uuid-1234' })
    id!: string;

    @ApiProperty({ example: 'Entrada en calor - Tren superior' })
    name!: string;

    @ApiPropertyOptional({ example: 'Movilidad de hombro y activación de manguito' })
    description?: string;

    @ApiProperty({ example: 'entrada en calor' })
    type!: string;

    @ApiProperty({ example: true })
    active!: boolean;

    @ApiProperty()
    created_at!: Date;

    @ApiProperty()
    updated_at!: Date;

    @ApiProperty({ type: [CircuitExerciseResponseDto] })
    exercises!: CircuitExerciseResponseDto[];
}

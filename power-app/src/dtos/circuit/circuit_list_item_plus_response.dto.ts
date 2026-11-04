import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CircuitTypeRefDto } from '../circuit_type/circuit_type_ref.dto';

export class CircuitListItemExerciseRefDto {

    @ApiProperty({ example: 'uuid-1234' })
    id!: string;

    @ApiProperty({ example: 'Sentadilla con Peso Corporal' })
    name!: string;
}

export class CircuitListItemExerciseDto {

    @ApiProperty({ example: 'uuid-1234', description: 'Id del Routine_Exercise (no el del Exercise)' })
    id!: string;

    @ApiProperty({ example: 1 })
    exercise_order!: number;

    @ApiProperty({ type: CircuitListItemExerciseRefDto })
    exercise!: CircuitListItemExerciseRefDto;
}

export class CircuitListItemPlusResponseDto {

    @ApiProperty({ example: 'uuid-1234' })
    id!: string;

    @ApiProperty({ example: 'Entrada en calor - Tren inferior' })
    name!: string;

    @ApiPropertyOptional({ example: 'Activación de cadera y movilidad previa a piernas' })
    description?: string;

    @ApiProperty({ type: CircuitTypeRefDto, description: 'El tipo del circuito. Puede estar dado de baja (active: false): el circuito lo conserva' })
    circuit_type!: CircuitTypeRefDto;

    @ApiProperty({ example: true })
    active!: boolean;

    @ApiProperty({ example: 3, description: 'Cantidad de ejercicios que componen el circuito' })
    exercise_count!: number;

    @ApiProperty()
    created_at!: Date;

    @ApiProperty()
    updated_at!: Date;

    @ApiProperty({ type: [CircuitListItemExerciseDto], description: 'Ejercicios del circuito ordenados por exercise_order. Sin series ni notas: para eso está el detalle' })
    exercises!: CircuitListItemExerciseDto[];
}

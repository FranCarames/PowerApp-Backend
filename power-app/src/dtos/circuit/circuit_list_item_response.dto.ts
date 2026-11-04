import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CircuitTypeRefDto } from '../circuit_type/circuit_type_ref.dto';

export class CircuitListItemResponseDto {

    @ApiProperty({ example: 'uuid-1234' })
    id!: string;

    @ApiProperty({ example: 'Entrada en calor - Tren superior' })
    name!: string;

    @ApiPropertyOptional({ example: 'Movilidad de hombro y activación de manguito' })
    description?: string;

    @ApiProperty({ type: CircuitTypeRefDto, description: 'El tipo del circuito. Puede estar dado de baja (active: false): el circuito lo conserva' })
    circuit_type!: CircuitTypeRefDto;

    @ApiProperty({ example: true })
    active!: boolean;

    @ApiProperty({ example: 4, description: 'Cantidad de ejercicios que componen el circuito' })
    exercise_count!: number;

    @ApiProperty()
    created_at!: Date;

    @ApiProperty()
    updated_at!: Date;
}

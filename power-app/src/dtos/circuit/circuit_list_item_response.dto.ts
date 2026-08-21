import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CircuitListItemResponseDto {

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

    @ApiProperty({ example: 4, description: 'Cantidad de ejercicios que componen el circuito' })
    exercise_count!: number;

    @ApiProperty()
    created_at!: Date;

    @ApiProperty()
    updated_at!: Date;
}

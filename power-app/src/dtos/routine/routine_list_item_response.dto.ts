import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RoutineListItemResponseDto {

    @ApiProperty({ example: 'uuid-1234' })
    id!: string;

    @ApiProperty({ example: 'Dia A - Piernas' })
    name!: string;

    @ApiPropertyOptional({ example: 'Enfocarse en la contracción' })
    coach_note?: string;

    @ApiProperty({ example: true })
    active!: boolean;

    @ApiProperty({ example: 3, description: 'Cantidad de circuitos que componen la rutina' })
    circuit_count!: number;

    @ApiProperty()
    created_at!: Date;

    @ApiProperty()
    updated_at!: Date;
}

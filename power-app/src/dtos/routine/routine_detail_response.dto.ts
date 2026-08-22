import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CircuitDetailResponseDto } from '../circuit/circuit_detail_response.dto';

export class RoutineDetailCircuitDto {

    @ApiProperty({ example: 'uuid-1234', description: 'Id del Routine_Circuit (no el del Circuit)' })
    id!: string;

    @ApiProperty({ example: 1 })
    order!: number;

    @ApiProperty({ type: CircuitDetailResponseDto, description: 'El circuito completo, con el mismo formato que GET /routine/circuit/:id' })
    circuit!: CircuitDetailResponseDto;
}

export class RoutineDetailResponseDto {

    @ApiProperty({ example: 'uuid-1234' })
    id!: string;

    @ApiProperty({ example: 'Dia A - Piernas' })
    name!: string;

    @ApiPropertyOptional({ example: 'Enfocarse en la contracción' })
    coach_note?: string;

    @ApiProperty({ example: true })
    active!: boolean;

    @ApiProperty()
    created_at!: Date;

    @ApiProperty()
    updated_at!: Date;

    @ApiProperty({ type: [RoutineDetailCircuitDto], description: 'Circuitos de la rutina ordenados por order, cada uno con sus ejercicios y series' })
    circuits!: RoutineDetailCircuitDto[];
}

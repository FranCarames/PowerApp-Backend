import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RoutineListItemCircuitRefDto {

    @ApiProperty({ example: 'uuid-1234' })
    id!: string;

    @ApiProperty({ example: 'Entrada en calor - Tren inferior' })
    name!: string;

    @ApiProperty({ example: 'entrada en calor' })
    type!: string;

    @ApiProperty({ example: true, description: 'Una rutina puede referenciar un circuito dado de baja' })
    active!: boolean;
}

export class RoutineListItemCircuitDto {

    @ApiProperty({ example: 'uuid-1234', description: 'Id del Routine_Circuit (no el del Circuit)' })
    id!: string;

    @ApiProperty({ example: 1, description: 'Posicion 1..N dentro de la rutina. Los vinculos dados de baja no se devuelven, asi que la lista nunca tiene huecos' })
    order!: number;

    @ApiProperty({ type: RoutineListItemCircuitRefDto })
    circuit!: RoutineListItemCircuitRefDto;
}

export class RoutineListItemPlusResponseDto {

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

    @ApiProperty({ type: [RoutineListItemCircuitDto], description: 'Circuitos de la rutina ordenados por order. Sin ejercicios ni series: para eso está el detalle' })
    circuits!: RoutineListItemCircuitDto[];
}

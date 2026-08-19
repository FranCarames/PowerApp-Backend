import { ApiProperty } from '@nestjs/swagger';

export class PotentialRmExerciseDto {
    @ApiProperty({ example: 'uuid-1234' })
    id!: string;

    @ApiProperty({ example: 'Press banca' })
    name!: string;
}

export class PotentialRmInputDto {
    @ApiProperty({ example: 100 })
    weight!: number;

    @ApiProperty({ example: 5 })
    max_reps!: number;
}

export class PotentialRmItemDto {
    @ApiProperty({ example: 3, description: 'Cantidad de repeticiones (el "n" de nRM)' })
    reps!: number;

    @ApiProperty({ example: 106.06, description: 'Peso estimado para esa cantidad de repeticiones, en kg' })
    weight!: number;
}

/**
 * Resultado del cálculo de RMs potenciales (CU-U-16). Es un valor volátil:
 * no se guarda en la base.
 */
export class PotentialRmResponseDto {
    @ApiProperty({ type: PotentialRmExerciseDto })
    exercise!: PotentialRmExerciseDto;

    @ApiProperty({ type: PotentialRmInputDto })
    input!: PotentialRmInputDto;

    @ApiProperty({ example: 'Epley' })
    formula!: string;

    @ApiProperty({ example: 116.67, description: 'RM estimado por la fórmula directa de Epley' })
    estimated_1rm!: number;

    @ApiProperty({ type: [PotentialRmItemDto], description: 'Tabla de 1RM a 12RM' })
    potential_rms!: PotentialRmItemDto[];
}

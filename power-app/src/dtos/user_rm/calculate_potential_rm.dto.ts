import { IsNotEmpty, IsUUID, IsNumber, IsInt, IsPositive, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Input del cálculo de RMs potenciales (CU-U-16): el usuario informa con qué
 * peso llegó a cuántas repeticiones en un ejercicio. No se persiste nada.
 */
export class CalculatePotentialRmDto {

    @ApiProperty({ example: 'uuid-1234', description: 'Ejercicio sobre el que se calcula' })
    @IsNotEmpty()
    @IsUUID('all', { message: 'El ID de ejercicio debe ser un UUID válido en formato PostgreSQL' })
    exercise_id!: string;

    @ApiProperty({ example: 100, description: 'Peso levantado, en kg' })
    @IsNotEmpty()
    @Type(() => Number)
    @IsNumber({ maxDecimalPlaces: 2 }, { message: 'El peso debe ser numérico' })
    @IsPositive({ message: 'El peso tiene que ser mayor a cero' })
    @Max(1000)
    weight!: number;

    @ApiProperty({ example: 5, minimum: 1, maximum: 100, description: 'Máximo de repeticiones logradas con ese peso' })
    @IsNotEmpty()
    @Type(() => Number)
    @IsInt({ message: 'Las repeticiones deben ser un número entero' })
    @Min(1, { message: 'Las repeticiones tienen que ser al menos 1' })
    @Max(100)
    max_reps!: number;
}

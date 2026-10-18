import { IsNotEmpty, IsBoolean, IsOptional, IsInt, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { INTEGER_MAX } from './planification_limits';

export class SetRoutineAsignationActiveDto {

    @ApiProperty({ example: false, description: 'false da de baja la asignación y la rutina CONSERVA su semana y su orden; true la reactiva' })
    @IsNotEmpty()
    @IsBoolean()
    active!: boolean;

    @ApiPropertyOptional({ example: 2, minimum: 1, description: 'Sólo válido con active = true: la semana con la que vuelve. Si se omite, vuelve a la que tenía. Si la semana resultante queda fuera de la duración actual del plan, es un 400. Mandarlo con active = false es un 400' })
    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(INTEGER_MAX)
    week?: number;

    @ApiPropertyOptional({ example: 2, minimum: 1, description: 'Sólo válido con active = true: la posición con la que vuelve, tal cual (puede repetirse). Si se omite, vuelve a su lugar; con week y sin order, va al final de esa semana. Mandarlo con active = false es un 400' })
    @IsOptional()
    @IsInt()
    @Min(1)
    order?: number;
}

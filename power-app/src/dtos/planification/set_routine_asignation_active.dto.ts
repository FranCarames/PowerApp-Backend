import { IsNotEmpty, IsBoolean, IsOptional, IsInt, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SetRoutineAsignationActiveDto {

    @ApiProperty({ example: false, description: 'false da de baja la asignación y le borra el order; true la reactiva' })
    @IsNotEmpty()
    @IsBoolean()
    active!: boolean;

    @ApiPropertyOptional({ example: 2, minimum: 1, description: 'Sólo válido con active = true: la posición con la que vuelve. Si se omite, vuelve al final. Mandarlo con active = false es un 400' })
    @IsOptional()
    @IsInt()
    @Min(1)
    order?: number;
}

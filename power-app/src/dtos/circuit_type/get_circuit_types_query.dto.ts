import { IsOptional, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetCircuitTypesQueryDto {

    // El mismo @Transform que GetCircuitsQueryDto: el query llega como texto
    @ApiPropertyOptional({ example: false, default: false, description: 'true para incluir también los tipos dados de baja. Sin él, sólo los activos (los que se ofrecen al armar un circuito)' })
    @IsOptional()
    @Transform(({ value }: { value: unknown }) => {
        if (value === 'true' || value === true) return true;
        if (value === 'false' || value === false) return false;
        return value;
    })
    @IsBoolean()
    include_inactive?: boolean = false;
}

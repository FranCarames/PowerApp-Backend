import { IsOptional, IsString, MaxLength, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetPlanificationsQueryDto {

    @ApiPropertyOptional({ example: 'fuerza', description: 'Busca coincidencias parciales (sin distinguir mayúsculas) en nombre y descripción' })
    @IsOptional()
    @IsString()
    @MaxLength(100)
    keyword?: string;

    @ApiPropertyOptional({ example: 'fuerza', description: 'Filtra por tipo de planificación (coincidencia exacta, sin distinguir mayúsculas)' })
    @IsOptional()
    @IsString()
    @MaxLength(30)
    type?: string;

    @ApiPropertyOptional({ example: false, default: false, description: 'true para incluir también las planificaciones dadas de baja' })
    @IsOptional()
    @Transform(({ value }) => {
        if (value === 'true' || value === true) return true;
        if (value === 'false' || value === false) return false;
        return value;
    })
    @IsBoolean()
    include_inactive?: boolean = false;
}

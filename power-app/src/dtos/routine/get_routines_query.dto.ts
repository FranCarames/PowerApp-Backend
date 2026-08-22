import { IsOptional, IsString, MaxLength, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetRoutinesQueryDto {

    @ApiPropertyOptional({ example: 'pecho', description: 'Busca coincidencias parciales (sin distinguir mayúsculas) en nombre y nota del entrenador' })
    @IsOptional()
    @IsString()
    @MaxLength(100)
    keyword?: string;

    @ApiPropertyOptional({ example: false, default: false, description: 'true para incluir también las rutinas dadas de baja' })
    @IsOptional()
    @Transform(({ value }) => {
        if (value === 'true' || value === true) return true;
        if (value === 'false' || value === false) return false;
        return value;
    })
    @IsBoolean()
    include_inactive?: boolean = false;
}

import { IsOptional, IsEnum, IsString, MaxLength, IsBoolean, IsInt, Min, Max } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../../entities/user.entity';

export class GetUsersQueryDto {

    @ApiPropertyOptional({ enum: UserRole, description: 'Filtra por rol: user, coach o admin' })
    @IsOptional()
    @IsEnum(UserRole)
    role?: UserRole;

    @ApiPropertyOptional({ example: 'juan', description: 'Busca coincidencias parciales (sin distinguir mayúsculas) en nombre, apellido y email' })
    @IsOptional()
    @IsString()
    @MaxLength(100)
    keyword?: string;

    @ApiPropertyOptional({ example: true, description: 'Filtra por estado de la cuenta (activa / dada de baja)' })
    @IsOptional()
    @Transform(({ value }) => {
        if (value === 'true' || value === true) return true;
        if (value === 'false' || value === false) return false;
        return value;
    })
    @IsBoolean()
    active?: boolean;

    @ApiPropertyOptional({ example: 1, default: 1, minimum: 1, description: 'Número de página (arranca en 1)' })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;

    @ApiPropertyOptional({ example: 20, default: 20, minimum: 1, maximum: 100, description: 'Cantidad de resultados por página' })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    limit?: number = 20;
}

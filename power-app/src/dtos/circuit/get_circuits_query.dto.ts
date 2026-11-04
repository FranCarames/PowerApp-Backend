import { IsOptional, IsString, MaxLength, IsBoolean, IsUUID } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CIRCUIT_TYPE_ID_UUID_ERROR } from '../circuit_type/circuit_type_messages';

export class GetCircuitsQueryDto {

    @ApiPropertyOptional({ example: 'calor', description: 'Busca coincidencias parciales (sin distinguir mayúsculas) en nombre y descripción' })
    @IsOptional()
    @IsString()
    @MaxLength(100)
    keyword?: string;

    @ApiPropertyOptional({ example: '49f793de-7681-5c05-a171-371baa69e9eb', format: 'uuid', description: 'Filtra por tipo de circuito: el id de un tipo de `GET /routine/circuit-type/all`, activo o dado de baja. Un id que no es de ningún tipo devuelve []' })
    @IsOptional()
    @IsUUID('all', { message: CIRCUIT_TYPE_ID_UUID_ERROR })
    circuit_type_id?: string;

    @ApiPropertyOptional({ example: false, default: false, description: 'true para incluir también los circuitos dados de baja' })
    @IsOptional()
    @Transform(({ value }) => {
        if (value === 'true' || value === true) return true;
        if (value === 'false' || value === false) return false;
        return value;
    })
    @IsBoolean()
    include_inactive?: boolean = false;
}

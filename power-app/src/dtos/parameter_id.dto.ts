import { IsUUID, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class ParameterIdDto {
    @ApiProperty({ example: 'uuid-1234' })
    @Type(() => String)
    @IsNotEmpty()
    @IsUUID('all', { message: 'El ID debe ser un UUID válido en formato PostgreSQL' })
    id!: string;
}

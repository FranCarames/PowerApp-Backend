import { IsOptional, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class MembershipTypeQueryDto {

    @ApiPropertyOptional({
        example: 'uuid-1234',
        description: 'Tipo de membresía por el que se filtra. Si se omite, devuelve todos los tipos agrupados.',
    })
    @IsOptional()
    @IsUUID('4', { message: 'El ID de membresía debe ser un UUID válido en formato PostgreSQL' })
    membership_id?: string;
}

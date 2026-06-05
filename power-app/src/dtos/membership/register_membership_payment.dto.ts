import { IsNotEmpty, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterMembershipPaymentDto {

    @ApiProperty({ example: 'uuid-1234', description: 'ID del usuario' })
    @Type(() => String)
    @IsNotEmpty()
    @IsUUID('4', { message: 'El ID debe ser un UUID válido en formato PostgreSQL' })
    user_id!: string;

    @ApiProperty({ example: 'uuid-5678', description: 'ID de la membresía' })
    @Type(() => String)
    @IsNotEmpty()
    @IsUUID('4', { message: 'El ID debe ser un UUID válido en formato PostgreSQL' })
    membership_id!: string;
}

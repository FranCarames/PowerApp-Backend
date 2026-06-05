import { IsUUID, IsNotEmpty, IsString, MaxLength, IsEmail, Length } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class PromoteCoachDto {

    @ApiProperty({ example: 'uuid-1234', description: 'ID del usuario a promover' })
    @Type(() => String)
    @IsNotEmpty()
    @IsUUID('4', { message: 'El ID debe ser un UUID válido en formato PostgreSQL' })
    user_id!: string;

    @ApiProperty({ example: 'coach@example.com', maxLength: 50 })
    @IsNotEmpty()
    @IsString()
    @MaxLength(50)
    @Transform(({ value: email }) => email.toLowerCase())
    @IsEmail()
    coach_email!: string;

    @ApiProperty({ example: '20123456789', description: 'CUIL sin guiones, 11 caracteres' })
    @IsNotEmpty()
    @IsString()
    @Length(11, 11, { message: 'El CUIL debe tener exactamente 11 caracteres' })
    cuil!: string;
}

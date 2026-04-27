import {
  IsUUID,
  IsNotEmpty,
  IsString,
  MaxLength,
  IsEmail,
  Length
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class PromoteCoachDto {
    
    @Type(() => String)
    @IsNotEmpty()
    @IsUUID('4', { message: 'El ID debe ser un UUID válido en formato PostgreSQL' })
    user_id!: string;

    @IsNotEmpty()
    @IsString()
    @MaxLength(50)
    @Transform(({ value: email }) => email.toLowerCase())
    @IsEmail()
    coach_email!: string;

    @IsNotEmpty()
    @IsString()
    @Length(11, 11, { message: 'El CUIL debe tener exactamente 11 caracteres' })
    cuil!: string;
}
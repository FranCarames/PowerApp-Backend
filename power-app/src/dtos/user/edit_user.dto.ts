import {
  IsOptional,
  IsString,
  IsEmail,
  MaxLength,
  IsUrl,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Datos personales editables por el propio usuario (CU-U-06).
 * Todos los campos son opcionales: sólo se persisten los que vienen en el body.
 * El rol, la contraseña y los datos de membresía quedan fuera de alcance.
 */
export class EditUserDto {

    @ApiPropertyOptional({ example: 'Juan', maxLength: 50 })
    @IsOptional()
    @IsString()
    @MaxLength(50)
    first_name?: string;

    @ApiPropertyOptional({ example: 'Pérez', maxLength: 50 })
    @IsOptional()
    @IsString()
    @MaxLength(50)
    last_name?: string;

    @ApiPropertyOptional({ example: 'juan@example.com', maxLength: 50 })
    @IsOptional()
    @IsString()
    @MaxLength(50)
    @Transform(({ value: email }) => (typeof email === 'string' ? email.toLowerCase() : email))
    @IsEmail()
    email?: string;

    @ApiPropertyOptional({ example: '+54', maxLength: 10 })
    @IsOptional()
    @IsString()
    @MaxLength(10)
    phone_prefix?: string;

    @ApiPropertyOptional({ example: '1123456789', maxLength: 20 })
    @IsOptional()
    @IsString()
    @MaxLength(20)
    phone_number?: string;

    @ApiPropertyOptional({ example: 'https://cdn.powerapp.com/avatars/juan.png', maxLength: 150 })
    @IsOptional()
    @IsString()
    @MaxLength(150)
    @IsUrl()
    profile_picture?: string;
}

import {
  IsOptional,
  IsString,
  IsEmail,
  MaxLength,
  Matches,
  IsUrl,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PHONE_NUMBER_MESSAGE, PHONE_NUMBER_REGEX, PHONE_PREFIX_MESSAGE, PHONE_PREFIX_REGEX } from './phone_format';

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

    // Como en el alta, el @MaxLength va último para que el mensaje de largo salga antes que el de formato.
    // Sólo se valida si el campo viene en el body
    @ApiPropertyOptional({ example: '+54', maxLength: 10, pattern: PHONE_PREFIX_REGEX.source, description: 'Código de país: "+" y de 1 a 4 dígitos' })
    @IsOptional()
    @IsString()
    @Matches(PHONE_PREFIX_REGEX, { message: PHONE_PREFIX_MESSAGE })
    @MaxLength(10)
    phone_prefix?: string;

    @ApiPropertyOptional({ example: '1123456789', maxLength: 20, pattern: PHONE_NUMBER_REGEX.source, description: 'Sólo dígitos, sin espacios ni guiones' })
    @IsOptional()
    @IsString()
    @Matches(PHONE_NUMBER_REGEX, { message: PHONE_NUMBER_MESSAGE })
    @MaxLength(20)
    phone_number?: string;

    @ApiPropertyOptional({ example: 'https://cdn.powerapp.com/avatars/juan.png', maxLength: 150 })
    @IsOptional()
    @IsString()
    @MaxLength(150)
    @IsUrl()
    profile_picture?: string;
}

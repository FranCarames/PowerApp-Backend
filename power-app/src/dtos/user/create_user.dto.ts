import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEmail,
  MinLength,
  MaxLength,
  Matches,
  IsIn
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../../entities/user.entity';
import { PHONE_NUMBER_MESSAGE, PHONE_NUMBER_REGEX, PHONE_PREFIX_MESSAGE, PHONE_PREFIX_REGEX } from './phone_format';

export class CreateUserDto {

    @ApiProperty({ example: 'Juan', maxLength: 50 })
    @IsNotEmpty()
    @IsString()
    @MaxLength(50)
    first_name!: string;

    @ApiProperty({ example: 'Pérez', maxLength: 50 })
    @IsNotEmpty()
    @IsString()
    @MaxLength(50)
    last_name!: string;

    @ApiProperty({ example: 'juan@example.com', maxLength: 50 })
    @IsNotEmpty()
    @IsString()
    @MaxLength(50)
    @Transform(({ value: email }) => email.toLowerCase())
    @IsEmail()
    email!: string;

    @ApiProperty({ example: 'secret123', minLength: 6, maxLength: 50 })
    @IsNotEmpty()
    @IsString()
    @MinLength(6)
    @MaxLength(50)
    password!: string;

    // El registro sólo crea alumnos (CU-U-01). El campo se conserva porque el web manda `role: 'user'`
    // explícito y `forbidNonWhitelisted` lo rechazaría; el service fuerza el rol igual.
    @ApiPropertyOptional({ enum: [UserRole.user], default: UserRole.user, description: 'Sólo se acepta `user`: el registro siempre crea un alumno' })
    @IsOptional()
    @IsIn([UserRole.user], { message: 'El registro sólo crea cuentas de alumno (role = user)' })
    role: UserRole = UserRole.user;

    // El @MaxLength va último: los decoradores se evalúan de abajo hacia arriba, así que el mensaje de
    // largo sale antes que el de formato en el `message[]` del 400
    @ApiProperty({ example: '+54', maxLength: 10, pattern: PHONE_PREFIX_REGEX.source, description: 'Código de país: "+" y de 1 a 4 dígitos' })
    @IsNotEmpty()
    @IsString()
    @Matches(PHONE_PREFIX_REGEX, { message: PHONE_PREFIX_MESSAGE })
    @MaxLength(10)
    phone_prefix?: string;

    @ApiProperty({ example: '1123456789', maxLength: 20, pattern: PHONE_NUMBER_REGEX.source, description: 'Sólo dígitos, sin espacios ni guiones' })
    @IsNotEmpty()
    @IsString()
    @Matches(PHONE_NUMBER_REGEX, { message: PHONE_NUMBER_MESSAGE })
    @MaxLength(20)
    phone_number?: string;
}

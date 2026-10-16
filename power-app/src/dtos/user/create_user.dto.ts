import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEmail,
  MinLength,
  MaxLength,
  IsIn
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../../entities/user.entity';

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

    @ApiProperty({ example: '+54', maxLength: 10 })
    @IsNotEmpty()
    @IsString()
    @MaxLength(10)
    phone_prefix?: string;

    @ApiProperty({ example: '1123456789', maxLength: 20 })
    @IsNotEmpty()
    @IsString()
    @MaxLength(20)
    phone_number?: string;
}

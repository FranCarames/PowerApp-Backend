import {
  IsNotEmpty,
  IsString,
  IsEmail,
  MinLength,
  MaxLength
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class LoginUserDto {

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
}
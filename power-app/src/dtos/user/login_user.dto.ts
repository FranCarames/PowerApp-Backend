import {
  IsNotEmpty,
  IsString,
  IsEmail,
  MinLength,
  MaxLength
} from 'class-validator';
import { Transform } from 'class-transformer';

export class LoginUserDto {

    @IsNotEmpty()
    @IsString()
    @MaxLength(50)
    @Transform(({ value: email }) => email.toLowerCase())
    @IsEmail()
    email!: string;
    
    @IsNotEmpty()
    @IsString()
    @MinLength(6)
    @MaxLength(50)
    password!: string;
}
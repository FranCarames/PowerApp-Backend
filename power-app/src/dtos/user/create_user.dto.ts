import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEmail,
  MinLength,
  MaxLength,
  IsEnum
} from 'class-validator';
import { Transform } from 'class-transformer';
import { UserRole } from '../../entities/user.entity';

export class CreateUserDto {
    
    @IsNotEmpty()
    @IsString()
    @MaxLength(50)
    first_name!: string;
    
    @IsNotEmpty()
    @IsString()
    @MaxLength(50)
    last_name!: string;
    
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

    @IsOptional()
    @IsEnum(UserRole)
    role: UserRole = UserRole.user;
    
    @IsNotEmpty()
    @IsString()
    @MaxLength(10)
    phone_prefix?: string;
    
    @IsNotEmpty()
    @IsString()
    @MaxLength(20)
    phone_number?: string;
}

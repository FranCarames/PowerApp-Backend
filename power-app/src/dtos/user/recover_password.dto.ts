import { IsNotEmpty, IsString, IsEmail, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class RecoverPasswordDto {

    @ApiProperty({ example: 'juan@example.com', maxLength: 50 })
    @IsNotEmpty()
    @IsString()
    @MaxLength(50)
    @Transform(({ value: email }) => email.toLowerCase())
    @IsEmail()
    email!: string;
}

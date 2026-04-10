import { IsNotEmpty, IsEmail, IsString, IsOptional } from 'class-validator';

export class AuthenticableDTO {
    @IsNotEmpty()
    @IsString()
    authorization!: string;
}
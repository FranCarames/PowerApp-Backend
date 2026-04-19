import { IsNotEmpty, IsString } from 'class-validator';

export class AuthenticableDTO {
    @IsNotEmpty()
    @IsString()
    authorization!: string;
}
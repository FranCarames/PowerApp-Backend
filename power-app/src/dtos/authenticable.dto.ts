import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class AuthenticableDTO {
  @IsNotEmpty()
  @IsString()
  authorization!: string;
}

export class AuthenticableOptionalDTO {
  @IsOptional()
  @IsString()
  authorization?: string;
}
import {
  IsUUID,
  IsNotEmpty,
  IsString,
  IsOptional,
  MaxLength
} from 'class-validator';
import { Type } from 'class-transformer';

export class EditMuscleDto {
    
    @Type(() => String)
    @IsNotEmpty()
    @IsUUID('4', { message: 'El ID debe ser un UUID válido en formato PostgreSQL' })
    muscle_group_id!: string;

    @IsNotEmpty()
    @IsString()
    @MaxLength(50)
    name!: string;

    @IsOptional()
    @IsNotEmpty()
    @IsString()
    description?: string;

    @IsOptional()
    @IsNotEmpty()
    @IsString()
    image_url?: string;

    @IsOptional()
    @IsNotEmpty()
    @IsString()
    preview_image?: string;   
}
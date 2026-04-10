import {
  IsNotEmpty,
  IsString,
  IsOptional,
  MaxLength
} from 'class-validator';

export class CreateMuscleGroupDto {
    
    @IsNotEmpty()
    @IsString()
    @MaxLength(50)
    name!: string;

    @IsOptional()
    @IsNotEmpty()
    @IsString()
    image_url?: string;

    @IsOptional()
    @IsNotEmpty()
    @IsString()
    preview_image?: string;   
}
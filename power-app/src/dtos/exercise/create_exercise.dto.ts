import {
  IsNotEmpty,
  IsUUID,
  ArrayUnique,
  ArrayNotEmpty,
  IsArray,
  IsString,
  IsOptional,
  MaxLength,
} from 'class-validator';

export class CreateExerciseDto {

    @IsNotEmpty()
    @IsArray()
    @ArrayNotEmpty()
    @ArrayUnique()
    @IsUUID('4', { 
        each: true, 
        message: 'Todos los elementos del array deben ser UUID válidos' 
    })
    exercised_muscles_ids!: string[];
    
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
    @MaxLength(500)
    safety_tips?: string;

    @IsOptional()
    @IsNotEmpty()
    @IsString()
    @MaxLength(500)
    activation_tips?: string;

    @IsOptional()
    @IsNotEmpty()
    @IsString()
    video_url?: string;

    @IsOptional()
    @IsNotEmpty()
    @IsString()
    preview_image?: string;

    @IsOptional()
    @IsNotEmpty()
    @IsString()
    bg_image?: string;
}
import {
  IsNotEmpty, IsUUID, ArrayUnique, ArrayNotEmpty,
  IsArray, IsString, IsOptional, MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateExerciseDto {

    @ApiProperty({ example: ['uuid-1234', 'uuid-5678'], description: 'IDs de los músculos que ejercita' })
    @IsNotEmpty()
    @IsArray()
    @ArrayNotEmpty()
    @ArrayUnique()
    @IsUUID('all', { each: true, message: 'Todos los elementos del array deben ser UUID válidos' })
    exercised_muscles_ids!: string[];

    @ApiProperty({ example: 'Press de banca', maxLength: 50 })
    @IsNotEmpty()
    @IsString()
    @MaxLength(50)
    name!: string;

    @ApiPropertyOptional({ example: 'Ejercicio compuesto para el pecho...' })
    @IsOptional()
    @IsNotEmpty()
    @IsString()
    description?: string;

    @ApiPropertyOptional({ example: 'Mantener los codos a 45°', maxLength: 500 })
    @IsOptional()
    @IsNotEmpty()
    @IsString()
    @MaxLength(500)
    safety_tips?: string;

    @ApiPropertyOptional({ example: 'Apretar el pecho al subir', maxLength: 500 })
    @IsOptional()
    @IsNotEmpty()
    @IsString()
    @MaxLength(500)
    activation_tips?: string;

    @ApiPropertyOptional({ example: 'https://...' })
    @IsOptional()
    @IsNotEmpty()
    @IsString()
    video_url?: string;

    @ApiPropertyOptional({ example: 'https://...' })
    @IsOptional()
    @IsNotEmpty()
    @IsString()
    preview_image?: string;

    @ApiPropertyOptional({ example: 'https://...' })
    @IsOptional()
    @IsNotEmpty()
    @IsString()
    bg_image?: string;
}

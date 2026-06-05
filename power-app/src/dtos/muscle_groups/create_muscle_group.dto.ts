import { IsNotEmpty, IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMuscleGroupDto {

    @ApiProperty({ example: 'Pecho', maxLength: 50 })
    @IsNotEmpty()
    @IsString()
    @MaxLength(50)
    name!: string;

    @ApiPropertyOptional({ example: 'https://...' })
    @IsOptional()
    @IsNotEmpty()
    @IsString()
    image_url?: string;

    @ApiPropertyOptional({ example: 'https://...' })
    @IsOptional()
    @IsNotEmpty()
    @IsString()
    preview_image?: string;
}

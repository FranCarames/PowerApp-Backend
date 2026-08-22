import { IsUUID, IsNotEmpty, IsString, IsOptional, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class EditMuscleDto {

    @ApiProperty({ example: 'uuid-1234', description: 'ID del grupo muscular' })
    @Type(() => String)
    @IsNotEmpty()
    @IsUUID('all', { message: 'El ID debe ser un UUID válido en formato PostgreSQL' })
    muscle_group_id!: string;

    @ApiProperty({ example: 'Pectoral mayor', maxLength: 50 })
    @IsNotEmpty()
    @IsString()
    @MaxLength(50)
    name!: string;

    @ApiPropertyOptional({ example: 'Músculo principal del pecho' })
    @IsOptional()
    @IsNotEmpty()
    @IsString()
    description?: string;

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

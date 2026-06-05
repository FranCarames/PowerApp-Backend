import { IsUUID, IsNotEmpty, IsNumber, IsInt, IsDateString, Min, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserRmDto {

    @ApiProperty({ example: 'uuid-1234', description: 'ID del usuario' })
    @Type(() => String)
    @IsNotEmpty()
    @IsUUID('4', { message: 'El UserID debe ser un UUID válido en formato PostgreSQL' })
    user_id!: string;

    @ApiProperty({ example: 'uuid-5678', description: 'ID del ejercicio' })
    @Type(() => String)
    @IsNotEmpty()
    @IsUUID('4', { message: 'El ExerciseID debe ser un UUID válido en formato PostgreSQL' })
    exercise_id!: string;

    @ApiProperty({ example: 100.5, description: 'Peso en kg' })
    @IsNotEmpty()
    @IsNumber({ maxDecimalPlaces: 2 })
    @IsPositive()
    @Min(0.99)
    weight!: number;

    @ApiProperty({ example: 5, description: 'Cantidad de repeticiones' })
    @IsNotEmpty()
    @IsInt()
    @IsPositive()
    @Min(1)
    reps!: number;

    @ApiProperty({ example: '2024-01-15' })
    @IsNotEmpty()
    @IsDateString()
    date!: Date;
}

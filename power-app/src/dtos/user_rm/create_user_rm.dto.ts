import {
  IsUUID,
  IsNotEmpty,
  IsNumber,
  IsInt,
  IsDateString,
  Min,
  IsPositive
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateUserRmDto {
    
    @Type(() => String)
    @IsNotEmpty()
    @IsUUID('4', { message: 'El UserID debe ser un UUID válido en formato PostgreSQL' })
    user_id!: string;

    @Type(() => String)
    @IsNotEmpty()
    @IsUUID('4', { message: 'El ExerciseID debe ser un UUID válido en formato PostgreSQL' })
    exercise_id!: string;

    @IsNotEmpty()
    @IsNumber({ maxDecimalPlaces: 2 })
    @IsPositive()
    @Min(0.99)
    weight!: number;

    @IsNotEmpty()
    @IsInt()
    @IsPositive()
    @Min(1)
    reps!: number;

    @IsNotEmpty()
    @IsDateString()
    date!: Date;
}
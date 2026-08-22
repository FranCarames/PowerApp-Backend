import {
  IsNotEmpty, IsUUID, IsArray, ArrayNotEmpty, ArrayMaxSize,
  ValidateNested, IsString, IsOptional, MaxLength, IsInt, Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRoutineCircuitDto {

    @ApiProperty({ example: 'uuid-1234', description: 'ID del circuito a ensamblar. Puede repetirse dentro de la rutina: el order distingue las apariciones' })
    @IsNotEmpty()
    @IsUUID('all', { message: 'El ID de circuito debe ser un UUID válido' })
    circuit_id!: string;

    @ApiProperty({ example: 1, minimum: 1, description: 'Posición del circuito. El server ordena por este campo y persiste 1..N; se aceptan valores espaciados (10, 20, 30) pero no duplicados' })
    @IsNotEmpty()
    @IsInt()
    @Min(1)
    order!: number;
}

export class CreateRoutineDto {

    @ApiProperty({ example: 'Día A - Pecho y tríceps', maxLength: 50 })
    @IsNotEmpty()
    @IsString()
    @MaxLength(50)
    name!: string;

    @ApiPropertyOptional({ example: 'Cuidar el ritmo en las primeras series', maxLength: 100 })
    @IsOptional()
    @IsNotEmpty()
    @IsString()
    @MaxLength(100)
    coach_note?: string;

    @ApiProperty({ type: [CreateRoutineCircuitDto], description: 'Circuitos de la rutina. Al menos uno, máximo 50. Todos tienen que estar activos' })
    @IsArray()
    @ArrayNotEmpty({ message: 'La rutina debe tener al menos un circuito' })
    @ArrayMaxSize(50, { message: 'Una rutina no puede tener más de 50 circuitos' })
    @ValidateNested({ each: true })
    @Type(() => CreateRoutineCircuitDto)
    circuits!: CreateRoutineCircuitDto[];
}

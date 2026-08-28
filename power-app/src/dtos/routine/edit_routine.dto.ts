import {
  IsNotEmpty, IsUUID, IsArray, ArrayNotEmpty, ArrayMaxSize,
  ValidateNested, IsString, IsOptional, MaxLength, IsInt, Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// No extiende CreateRoutineDto como hace EditCircuitDto con el alta de circuitos:
// aca el item cambia de forma porque suma el id del vinculo, asi que se declara entero
export class EditRoutineCircuitDto {

    @ApiPropertyOptional({ example: 'uuid-1234', description: 'Id del Routine_Circuit (no el del Circuit). Su presencia es lo que distingue un vínculo que sobrevive de uno nuevo: sin id se crea, con id se mantiene, y lo que el server tenía y no vuelve en la lista se da de baja' })
    @IsOptional()
    @IsUUID('all', { message: 'El ID del circuito de la rutina debe ser un UUID válido' })
    id?: string;

    @ApiProperty({ example: 'uuid-1234', description: 'ID del circuito a ensamblar. Puede repetirse dentro de la rutina: el id del vínculo distingue las apariciones' })
    @IsNotEmpty()
    @IsUUID('all', { message: 'El ID de circuito debe ser un UUID válido' })
    circuit_id!: string;

    @ApiProperty({ example: 1, minimum: 1, description: 'Posición del circuito. El server ordena por este campo y persiste 1..N; se aceptan valores espaciados (10, 20, 30) pero no duplicados' })
    @IsNotEmpty()
    @IsInt()
    @Min(1)
    order!: number;
}

export class EditRoutineDto {

    @ApiProperty({ example: 'Día A - Pecho y tríceps', maxLength: 50 })
    @IsNotEmpty()
    @IsString()
    @MaxLength(50)
    name!: string;

    @ApiPropertyOptional({ example: 'Cuidar el ritmo en las primeras series', maxLength: 100, description: 'Omitirlo borra la nota que la rutina tuviera' })
    @IsOptional()
    @IsNotEmpty()
    @IsString()
    @MaxLength(100)
    coach_note?: string;

    @ApiProperty({ type: [EditRoutineCircuitDto], description: 'Lista COMPLETA de circuitos tal como queda la rutina. Al menos uno, máximo 50. Los circuitos dados de baja se pueden conservar (ítem con id) pero no agregar' })
    @IsArray()
    @ArrayNotEmpty({ message: 'La rutina debe tener al menos un circuito' })
    @ArrayMaxSize(50, { message: 'Una rutina no puede tener más de 50 circuitos' })
    @ValidateNested({ each: true })
    @Type(() => EditRoutineCircuitDto)
    circuits!: EditRoutineCircuitDto[];
}

import { IsUUID, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Params de DELETE /routine/assign-user/:id/finished/:routineExerciseId.
 * `ParameterIdDto` sólo contempla un id, y acá el path lleva dos.
 */
export class AssignedFinishedParamsDto {

    @ApiProperty({ example: 'uuid-1234', description: 'Id de la asignación individual' })
    @Type(() => String)
    @IsNotEmpty()
    @IsUUID('all', { message: 'El ID de asignación debe ser un UUID válido en formato PostgreSQL' })
    id!: string;

    @ApiProperty({ example: 'uuid-1234', description: 'Id del Routine_Exercise que se desmarca' })
    @Type(() => String)
    @IsNotEmpty()
    @IsUUID('all', { message: 'El ID de ejercicio debe ser un UUID válido en formato PostgreSQL' })
    routineExerciseId!: string;
}

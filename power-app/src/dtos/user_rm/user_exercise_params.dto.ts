import { IsUUID, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Params de la consulta de RMs cruzada por usuario y ejercicio (CU-U-11).
 * `ParameterIdDto` sólo contempla un id, y acá el path lleva dos.
 */
export class UserExerciseParamsDto {

    @ApiProperty({ example: 'uuid-1234', description: 'Id del usuario dueño de los RMs' })
    @Type(() => String)
    @IsNotEmpty()
    @IsUUID('all', { message: 'El ID de usuario debe ser un UUID válido en formato PostgreSQL' })
    idUser!: string;

    @ApiProperty({ example: 'uuid-1234', description: 'Id del ejercicio por el que se filtra' })
    @Type(() => String)
    @IsNotEmpty()
    @IsUUID('all', { message: 'El ID de ejercicio debe ser un UUID válido en formato PostgreSQL' })
    idExercise!: string;
}

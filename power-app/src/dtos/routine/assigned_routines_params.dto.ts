import { IsUUID, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Params de GET /routine/assigned/:userId. `ParameterIdDto` llama `id` a su parametro y
 * @Owner necesita el nombre del parametro del path, que aca es `userId`.
 */
export class AssignedRoutinesParamsDto {

    @ApiProperty({ example: 'uuid-1234', description: 'Id del alumno dueño de las asignaciones' })
    @Type(() => String)
    @IsNotEmpty()
    @IsUUID('all', { message: 'El ID de usuario debe ser un UUID válido en formato PostgreSQL' })
    userId!: string;
}

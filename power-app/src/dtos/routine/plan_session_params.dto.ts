import { IsUUID, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Params de una sesión del plan: el par (User_Planification, Routine_Asignation), que es lo que el
 * alumno abre y marca (spec del bloque B, §5.4). Los usan el detalle (BE-20b) y marcar (BE-20c);
 * desmarcar los extiende con el ejercicio (`PlanSessionFinishedParamsDto`).
 */
export class PlanSessionParamsDto {

    @ApiProperty({ example: 'uuid-1234', description: 'Id de la asignación de la planificación al alumno (User_Planification)' })
    @Type(() => String)
    @IsNotEmpty()
    @IsUUID('all', { message: 'El ID de la asignación debe ser un UUID válido en formato PostgreSQL' })
    userPlanificationId!: string;

    @ApiProperty({ example: 'uuid-1234', description: 'Id de la rutina del plan (Routine_Asignation)' })
    @Type(() => String)
    @IsNotEmpty()
    @IsUUID('all', { message: 'El ID de la rutina del plan debe ser un UUID válido en formato PostgreSQL' })
    routineAsignationId!: string;
}

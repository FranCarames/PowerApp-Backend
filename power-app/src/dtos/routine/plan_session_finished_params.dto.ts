import { IsUUID, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { PlanSessionParamsDto } from './plan_session_params.dto';

/**
 * Params de DELETE /routine/assign-plan/:userPlanificationId/:routineAsignationId/finished/:routineExerciseId:
 * los dos ids de la sesión del plan (los de `PlanSessionParamsDto`, BE-20b) más el ejercicio que se
 * desmarca. Es el equivalente de `AssignedFinishedParamsDto` en la vía de la planificación.
 */
export class PlanSessionFinishedParamsDto extends PlanSessionParamsDto {

    @ApiProperty({ example: 'uuid-1234', description: 'Id del Routine_Exercise que se desmarca' })
    @Type(() => String)
    @IsNotEmpty()
    @IsUUID('all', { message: 'El ID de ejercicio debe ser un UUID válido en formato PostgreSQL' })
    routineExerciseId!: string;
}

import { ApiProperty } from '@nestjs/swagger';
import { RoutineDetailResponseDto } from './routine_detail_response.dto';
import { RoutineAssignedFinishedDto } from './routine_assigned_detail_response.dto';
import { RoutineAssignedPlanUserPlanificationDto } from './routine_assigned_plan_response.dto';

// El bloque de los grupos del home del plan, mas active (D37): el detalle tambien se abre con la
// asignacion quitada (D24), y el cliente tiene que saberlo para no ofrecer marcar
export class RoutinePlanSessionUserPlanificationDto extends RoutineAssignedPlanUserPlanificationDto {

    @ApiProperty({ example: true, description: 'false si el entrenador quitó la planificación al alumno (E-14): la sesión se puede leer, pero marcar, desmarcar y anotar dan 400' })
    active!: boolean;
}

// El detalle de una sesion del plan (spec del detalle de una sesion del plan, §3): la rutina de una
// semana del plan para ese alumno, con lo que ya hizo. El equivalente de RoutineAssignedDetailResponseDto
// en la via de la planificacion
export class RoutinePlanSessionDetailResponseDto {

    @ApiProperty({ type: RoutinePlanSessionUserPlanificationDto })
    user_planification!: RoutinePlanSessionUserPlanificationDto;

    @ApiProperty({ example: 'uuid-1234', description: 'Id de la Routine_Asignation. Con el id de la asignación identifica la sesión del plan' })
    routine_asignation_id!: string;

    @ApiProperty({ example: 2, minimum: 1, description: 'Semana del plan: la 1 es la de lunes a domingo que contiene start_date' })
    week!: number;

    @ApiProperty({ example: '2026-10-26', description: 'Lunes de esa semana del plan (YYYY-MM-DD), aunque el plan arranque a mitad de semana o la semana caiga después del fin' })
    week_start!: string;

    @ApiProperty({ example: '2026-11-01', description: 'Domingo de esa semana del plan (YYYY-MM-DD)' })
    week_end!: string;

    @ApiProperty({ example: 1, description: 'Posición dentro de la semana. Etiqueta de orden: puede repetirse' })
    order!: number;

    @ApiProperty({ example: true, description: 'false si el entrenador quitó la rutina del plan (E-12c): sólo se ve lo que el alumno completó' })
    active!: boolean;

    @ApiProperty({ type: RoutineDetailResponseDto, description: 'El mismo árbol que GET /routine/:id. Lo dado de baja aparece sólo si el alumno completó algo de ello en esta sesión; en una rutina quitada del plan se ve únicamente lo completado' })
    routine!: RoutineDetailResponseDto;

    @ApiProperty({ type: [RoutineAssignedFinishedDto], description: 'Los ejercicios que el alumno ya marcó como hechos en esta sesión, con su nota y el día en que los hizo' })
    finished!: RoutineAssignedFinishedDto[];
}

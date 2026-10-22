import { ApiProperty } from '@nestjs/swagger';
import { RoutineAssignedListItemResponseDto } from './routine_assigned_list_item_response.dto';
import { RoutineAssignedPlanWeekResponseDto } from './routine_assigned_plan_response.dto';

// Una semana del home (GET /routine/home/:userId). Cada elemento de individual es el de
// GET /routine/assigned/:userId y cada uno de plan, el de GET /routine/assigned-plan/:userId (D36)
export class RoutineHomeWeekResponseDto {

    @ApiProperty({ example: '2026-10-19', description: 'Lunes de la semana (YYYY-MM-DD)' })
    week_start!: string;

    @ApiProperty({ example: '2026-10-25', description: 'Domingo de la semana (YYYY-MM-DD)' })
    week_end!: string;

    @ApiProperty({ type: [RoutineAssignedListItemResponseDto], description: 'Las rutinas individuales con día en esta semana, por día, nombre de rutina y alta. Iguales a las de GET /routine/assigned/:userId' })
    individual!: RoutineAssignedListItemResponseDto[];

    @ApiProperty({ type: [RoutineAssignedPlanWeekResponseDto], description: 'La semana del plan de cada asignación activa que cae en esta semana, por nombre de la planificación y alta. Iguales a los grupos de GET /routine/assigned-plan/:userId: repiten week_start y week_end' })
    plan!: RoutineAssignedPlanWeekResponseDto[];
}

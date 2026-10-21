import { ApiProperty } from '@nestjs/swagger';
import { UserPlanificationPlanificationDto } from '../planification/user_planification_response.dto';
import { RoutineAssignedRoutineDto, RoutineAssignedProgressDto } from './routine_assigned_list_item_response.dto';

// La asignacion de la que sale cada grupo del home del plan: lo propio de la User_Planification y la
// cabecera de la plantilla, que se lee en vivo (D18)
export class RoutineAssignedPlanUserPlanificationDto {

    @ApiProperty({ example: 'uuid-1234', description: 'Id de la User_Planification' })
    id!: string;

    @ApiProperty({ example: '2026-10-22', description: 'Día de inicio (YYYY-MM-DD, sin hora). La semana 1 del plan es la de lunes a domingo que lo contiene' })
    start_date!: string;

    @ApiProperty({ example: '2026-11-15', description: 'Día de fin, inclusive (YYYY-MM-DD, sin hora). La última semana del plan es la que lo contiene' })
    end_date!: string;

    @ApiProperty({ example: 'Foco en técnica', nullable: true, type: String })
    coach_note!: string | null;

    @ApiProperty({ type: UserPlanificationPlanificationDto })
    planification!: UserPlanificationPlanificationDto;
}

// Una rutina de la semana del plan para ese alumno: una sesion del plan (la asignacion y la
// Routine_Asignation), que es lo que el alumno abre y marca
export class RoutineAssignedPlanRoutineDto {

    @ApiProperty({ example: 'uuid-1234', description: 'Id de la Routine_Asignation. Con el id de la asignación identifica la sesión del plan' })
    routine_asignation_id!: string;

    @ApiProperty({ example: 1, description: 'Posición dentro de la semana. Etiqueta de orden: puede repetirse, y desempata el alta' })
    order!: number;

    @ApiProperty({ example: true, description: 'false si el entrenador la quitó del plan (E-12c): sólo aparece si el alumno hizo algo en ella, y sólo con lo que hizo' })
    active!: boolean;

    @ApiProperty({ type: RoutineAssignedRoutineDto })
    routine!: RoutineAssignedRoutineDto;

    @ApiProperty({ type: RoutineAssignedProgressDto, description: 'Sobre lo hecho en esta sesión. En una rutina quitada del plan sólo se ve lo completado: finished = total' })
    progress!: RoutineAssignedProgressDto;
}

// Una semana del plan de una asignacion (spec del bloque B, §5.5). Las rutinas del plan no tienen
// dia: solo semana y orden (D28)
export class RoutineAssignedPlanWeekResponseDto {

    @ApiProperty({ type: RoutineAssignedPlanUserPlanificationDto })
    user_planification!: RoutineAssignedPlanUserPlanificationDto;

    @ApiProperty({ example: 2, minimum: 1, description: 'Semana del plan: la 1 es la de lunes a domingo que contiene start_date' })
    week!: number;

    @ApiProperty({ example: '2026-10-26', description: 'Lunes de esa semana del plan (YYYY-MM-DD), aunque el plan arranque a mitad de semana' })
    week_start!: string;

    @ApiProperty({ example: '2026-11-01', description: 'Domingo de esa semana del plan (YYYY-MM-DD), aunque el plan termine a mitad de semana' })
    week_end!: string;

    @ApiProperty({ type: [RoutineAssignedPlanRoutineDto], description: 'Las rutinas de la semana que el alumno ve, por order y alta. Vacío si la semana no tiene ninguna' })
    routines!: RoutineAssignedPlanRoutineDto[];
}

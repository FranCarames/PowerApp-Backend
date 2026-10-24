import { ApiProperty } from '@nestjs/swagger';

export class RoutineHistoryRoutineDto {

    @ApiProperty({ example: 'uuid-1234' })
    id!: string;

    @ApiProperty({ example: 'Dia A - Piernas' })
    name!: string;
}

export class RoutineHistoryCatalogExerciseDto {

    @ApiProperty({ example: 'uuid-1234', description: 'Exercise.id, el del catálogo: es el que se manda en exercise_id para filtrar' })
    id!: string;

    @ApiProperty({ example: 'Sentadilla' })
    name!: string;
}

// La prescripcion del coach (D7): el modelo no registra la carga real del alumno. Cuelga del
// ejercicio de la rutina, asi que si el coach edita las series despues, el historial viejo
// muestra la prescripcion nueva
export class RoutineHistorySetDto {

    @ApiProperty({ example: 1 })
    set_order!: number;

    @ApiProperty({ example: 3 })
    set_count!: number;

    @ApiProperty({ example: 8 })
    rep_count!: number;

    @ApiProperty({ example: 80.5, nullable: true, type: Number })
    weight!: number | null;

    @ApiProperty({ example: 75, nullable: true, type: Number })
    rm_perc!: number | null;

    @ApiProperty({ example: 7, nullable: true, type: Number })
    rpe!: number | null;

    @ApiProperty({ example: 2, nullable: true, type: Number })
    rir!: number | null;

    @ApiProperty({ example: false })
    amrap!: boolean;

    @ApiProperty({ example: 60, nullable: true, type: Number })
    amrap_time!: number | null;

    @ApiProperty({ example: false })
    rm!: boolean;
}

export class RoutineHistoryExerciseDto {

    @ApiProperty({ example: 'uuid-1234', description: 'Id del Routine_Exercise que el alumno marcó como hecho' })
    routine_exercise_id!: string;

    @ApiProperty({ type: RoutineHistoryCatalogExerciseDto })
    exercise!: RoutineHistoryCatalogExerciseDto;

    @ApiProperty({ example: 'Me costó la última serie', nullable: true, type: String, description: 'Nota del alumno; null si no dejó ninguna' })
    user_note!: string | null;

    @ApiProperty({ example: '2026-10-20', description: 'Día en que el alumno hizo el ejercicio (YYYY-MM-DD, sin hora): el que indicó al marcar, no el momento en que marcó. Desde el 21/10 (BE-18); antes era el instante de la marca' })
    finished_at!: string;

    @ApiProperty({ type: [RoutineHistorySetDto], description: 'La prescripción del coach, ordenada por set_order. Vacía si el ejercicio no tiene series' })
    sets!: RoutineHistorySetDto[];
}

// El historial tiene dos tipos de sesion, que se distinguen por `source` (spec del bloque B, §5.9):
// la de una asignacion individual y la de una rutina de una planificacion. La respuesta es una lista
// de las dos, mezcladas y ordenadas juntas

export class RoutineHistoryIndividualSessionDto {

    @ApiProperty({ enum: ['individual'], example: 'individual', description: 'De dónde viene la sesión: una asignación individual (una rutina asignada para un día)' })
    source!: 'individual';

    @ApiProperty({ example: 'uuid-1234', description: 'Id de la Routine_Asignation_User' })
    assignment_id!: string;

    @ApiProperty({ example: '2026-10-20', description: 'Día de la asignación (YYYY-MM-DD, sin hora)' })
    date!: string;

    @ApiProperty({ type: RoutineHistoryRoutineDto })
    routine!: RoutineHistoryRoutineDto;

    @ApiProperty({ type: [RoutineHistoryExerciseDto], description: 'Los ejercicios que el alumno hizo en la sesión, por el día en que los hizo y, dentro del mismo día, en el orden en que los marcó. Incluye los que el coach dio de baja después' })
    exercises!: RoutineHistoryExerciseDto[];
}

export class RoutineHistoryPlanificationDto {

    @ApiProperty({ example: 'uuid-1234', description: 'Id de la plantilla (Planification)' })
    id!: string;

    @ApiProperty({ example: 'Fuerza 4 semanas', nullable: true, type: String, description: 'Nombre de la plantilla, leído en vivo; null si no tiene' })
    name!: string | null;
}

// No tiene assignment_id: la sesion es el par (User_Planification, Routine_Asignation)
export class RoutineHistoryPlanSessionDto {

    @ApiProperty({ enum: ['plan'], example: 'plan', description: 'De dónde viene la sesión: una rutina de la planificación asignada al alumno' })
    source!: 'plan';

    @ApiProperty({ example: 'uuid-1234', description: 'Id de la User_Planification: la planificación asignada al alumno' })
    user_planification_id!: string;

    @ApiProperty({ example: 'uuid-1234', description: 'Id de la Routine_Asignation: la rutina del plan. Con el anterior, identifica la sesión (y es el par del detalle, GET /routine/assign-plan/:userPlanificationId/:routineAsignationId)' })
    routine_asignation_id!: string;

    @ApiProperty({ example: 2, description: 'Semana del plan en la que va la rutina' })
    week!: number;

    @ApiProperty({ example: '2026-10-20', description: 'La rutina del plan no tiene día: es el día más viejo en que el alumno hizo alguno de los ejercicios que se devuelven (YYYY-MM-DD, sin hora). Con exercise_id, el día en que hizo ese ejercicio' })
    date!: string;

    @ApiProperty({ type: RoutineHistoryPlanificationDto })
    planification!: RoutineHistoryPlanificationDto;

    @ApiProperty({ type: RoutineHistoryRoutineDto })
    routine!: RoutineHistoryRoutineDto;

    @ApiProperty({ type: [RoutineHistoryExerciseDto], description: 'Los ejercicios que el alumno hizo en la sesión, con la misma forma y el mismo orden que en la sesión individual. Incluye los que el coach quitó del plan después, y los de una planificación que le quitaron al alumno' })
    exercises!: RoutineHistoryExerciseDto[];
}

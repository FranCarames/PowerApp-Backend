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

    @ApiProperty({ description: 'Cuándo lo marcó el alumno' })
    finished_at!: Date;

    @ApiProperty({ type: [RoutineHistorySetDto], description: 'La prescripción del coach, ordenada por set_order. Vacía si el ejercicio no tiene series' })
    sets!: RoutineHistorySetDto[];
}

export class RoutineHistorySessionDto {

    @ApiProperty({ enum: ['individual', 'plan'], example: 'individual', description: 'De dónde viene la sesión. Hoy sólo sale individual (una asignación individual); las sesiones de una planificación llegan con el bloque B, con campos extra, sin cambiar esta forma' })
    source!: 'individual' | 'plan';

    @ApiProperty({ example: 'uuid-1234', description: 'Id de la Routine_Asignation_User' })
    assignment_id!: string;

    @ApiProperty({ example: '2026-10-20', description: 'Día de la asignación (YYYY-MM-DD, sin hora)' })
    date!: string;

    @ApiProperty({ type: RoutineHistoryRoutineDto })
    routine!: RoutineHistoryRoutineDto;

    @ApiProperty({ type: [RoutineHistoryExerciseDto], description: 'Los ejercicios que el alumno hizo en la sesión, en el orden en que los marcó. Incluye los que el coach dio de baja después' })
    exercises!: RoutineHistoryExerciseDto[];
}

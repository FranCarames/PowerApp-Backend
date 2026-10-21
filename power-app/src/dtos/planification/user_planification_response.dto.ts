import { ApiProperty } from '@nestjs/swagger';

// La cabecera de la plantilla dentro de una asignacion: se lee siempre en vivo de Planification (D18)
export class UserPlanificationPlanificationDto {

    @ApiProperty({ example: 'uuid-1234' })
    id!: string;

    @ApiProperty({ example: 'Fuerza 4 semanas', nullable: true, type: String })
    name!: string | null;

    @ApiProperty({ example: 4, description: 'Duración de la plantilla en semanas (0 = sin duración fija). Es la de hoy: editarla no mueve el fin de la asignación' })
    duration!: number;

    @ApiProperty({ example: true, description: 'Si la plantilla sigue activa. Darla de baja no saca las asignaciones que ya tenía' })
    active!: boolean;
}

// La forma de una asignacion (spec del bloque B, §5). La devuelven E-13 (la creada, y en el 409 las
// que se pisan) y, desde BE-19, E-14 y el listado del alumno. Nunca trae un estado calculado
// ("vigente", "vencida"): el cliente lo deduce de las fechas
export class UserPlanificationResponseDto {

    @ApiProperty({ example: 'uuid-1234', description: 'Id de la User_Planification' })
    id!: string;

    @ApiProperty({ example: 'uuid-1234' })
    user_id!: string;

    @ApiProperty({ example: 'uuid-1234', description: 'El coach que la asignó' })
    coach_id!: string;

    @ApiProperty({ example: 'uuid-1234' })
    planification_id!: string;

    @ApiProperty({ example: '2026-10-22', description: 'Día de inicio (YYYY-MM-DD, sin hora). La semana 1 del plan es la de lunes a domingo que lo contiene' })
    start_date!: string;

    @ApiProperty({ example: '2026-11-15', description: 'Día de fin, inclusive (YYYY-MM-DD, sin hora). Queda guardado: editar la duración de la plantilla no lo mueve' })
    end_date!: string;

    @ApiProperty({ example: 'Foco en técnica', nullable: true, type: String })
    coach_note!: string | null;

    @ApiProperty({ example: true, description: 'false si el coach la quitó (E-14)' })
    active!: boolean;

    @ApiProperty()
    created_at!: Date;

    @ApiProperty()
    updated_at!: Date;

    @ApiProperty({ type: UserPlanificationPlanificationDto })
    planification!: UserPlanificationPlanificationDto;
}

// El 409 de E-13: las asignaciones activas del alumno que se pisan con la nueva (D21)
export class AssignPlanificationOverlapResponseDto {

    @ApiProperty({ example: 'El alumno ya tiene una planificación en esas fechas. Reenviá con confirm_overlap: true para asignarla igual.' })
    error!: string;

    @ApiProperty({ type: [UserPlanificationResponseDto], description: 'Las asignaciones activas del alumno cuyo rango se pisa con el nuevo (los dos extremos inclusivos), de la más nueva a la más vieja' })
    overlapping!: UserPlanificationResponseDto[];
}

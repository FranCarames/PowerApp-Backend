import { ApiProperty } from '@nestjs/swagger';
import { RoutineDetailResponseDto } from './routine_detail_response.dto';

export class RoutineAssignedFinishedDto {

    @ApiProperty({ example: 'uuid-1234', description: 'Id del Routine_Exercise que el alumno marcó como hecho. El cliente cruza el árbol de la rutina por este id (en el árbol es el campo id de cada ejercicio)' })
    routine_exercise_id!: string;

    @ApiProperty({ example: 'Me costó la última serie', nullable: true, type: String, description: 'Nota del alumno sobre ese ejercicio (hasta 100 caracteres); null si no dejó ninguna' })
    user_note!: string | null;

    @ApiProperty({ example: '2026-10-20', description: 'Día en que el alumno hizo el ejercicio (YYYY-MM-DD, sin hora). Lo indica al marcar y lo puede corregir' })
    finished_at!: string;

    @ApiProperty({ description: 'Cuándo se registró la marca' })
    created_at!: Date;

    @ApiProperty()
    updated_at!: Date;
}

export class RoutineAssignedDetailResponseDto {

    @ApiProperty({ example: 'uuid-1234', description: 'Id de la Routine_Asignation_User' })
    id!: string;

    @ApiProperty({ example: 'uuid-1234' })
    routine_id!: string;

    @ApiProperty({ example: 'uuid-1234' })
    user_id!: string;

    @ApiProperty({ example: '2026-10-20', description: 'Día en que el alumno hace la rutina (YYYY-MM-DD, sin hora)' })
    date!: string;

    @ApiProperty()
    created_at!: Date;

    @ApiProperty()
    updated_at!: Date;

    @ApiProperty({ type: RoutineDetailResponseDto, description: 'El mismo árbol que GET /routine/:id. Los circuitos y ejercicios dados de baja sólo aparecen si el alumno completó algo de ellos en esta asignación; de un circuito que el entrenador sacó de la rutina se ven únicamente los ejercicios completados' })
    routine!: RoutineDetailResponseDto;

    @ApiProperty({ type: [RoutineAssignedFinishedDto], description: 'Los ejercicios que el alumno ya marcó como hechos en esta asignación, con su nota' })
    finished!: RoutineAssignedFinishedDto[];
}

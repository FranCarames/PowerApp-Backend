import { ApiProperty } from '@nestjs/swagger';

export class RoutineAssignUserRoutineDto {

    @ApiProperty({ example: 'uuid-1234' })
    id!: string;

    @ApiProperty({ example: 'Dia A - Piernas' })
    name!: string;
}

// Lo que devuelven POST /routine/assign-user (la asignacion creada) y
// DELETE /routine/assign-user/:id (la asignacion borrada): misma forma en los dos
export class RoutineAssignUserResponseDto {

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

    @ApiProperty({ type: RoutineAssignUserRoutineDto })
    routine!: RoutineAssignUserRoutineDto;
}

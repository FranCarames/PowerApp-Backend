import { ApiProperty } from '@nestjs/swagger';

export class RoutineAssignedRoutineDto {

    @ApiProperty({ example: 'uuid-1234' })
    id!: string;

    @ApiProperty({ example: 'Dia A - Piernas' })
    name!: string;

    @ApiProperty({ example: true, description: 'false si el entrenador dio de baja la rutina después de asignarla: la asignación existe y se puede ejecutar, el flag es informativo' })
    active!: boolean;
}

export class RoutineAssignedProgressDto {

    @ApiProperty({ example: 2, description: 'Ejercicios que el alumno ya marcó como hechos en esta asignación' })
    finished!: number;

    @ApiProperty({ example: 5, description: 'Ejercicios que el alumno ve en el detalle: los activos de los circuitos activos de la rutina (cada uno una vez) más los dados de baja que completó en esta asignación' })
    total!: number;
}

export class RoutineAssignedListItemResponseDto {

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

    @ApiProperty({ type: RoutineAssignedRoutineDto })
    routine!: RoutineAssignedRoutineDto;

    @ApiProperty({ type: RoutineAssignedProgressDto })
    progress!: RoutineAssignedProgressDto;
}

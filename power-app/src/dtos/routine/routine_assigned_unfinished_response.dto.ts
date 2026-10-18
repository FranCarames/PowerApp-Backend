import { ApiProperty } from '@nestjs/swagger';

export class RoutineAssignedUnfinishedResponseDto {

    @ApiProperty({ example: 'uuid-1234', description: 'El ejercicio que se desmarcó (el id del path, en minúscula)' })
    routine_exercise_id!: string;

    @ApiProperty({ example: false, description: 'Siempre false. Desmarcar es idempotente: también responde 200 si el ejercicio no estaba marcado' })
    finished!: boolean;
}

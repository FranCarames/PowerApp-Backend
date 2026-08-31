import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PlanificationListItemResponseDto {

    @ApiProperty({ example: 'uuid-1234' })
    id!: string;

    @ApiPropertyOptional({ example: 'Plan fuerza 3 días', description: 'Opcional acá y obligatorio en el alta: la columna es nullable y puede haber filas viejas sin nombre' })
    name?: string;

    @ApiPropertyOptional({ example: 'Planificación orientada a fuerza máxima' })
    description?: string;

    @ApiProperty({ example: 3, description: 'Rutinas declaradas por el entrenador: la intención del plan' })
    number_of_routines!: number;

    @ApiPropertyOptional({ example: 'fuerza' })
    type?: string;

    @ApiPropertyOptional({ example: '12 semanas' })
    duration?: string;

    @ApiProperty({ example: true })
    active!: boolean;

    @ApiProperty({ example: 2, description: 'Rutinas efectivamente asignadas al plan (Routine_Asignation). Puede diferir de number_of_routines, que es la meta' })
    routine_count!: number;

    @ApiProperty()
    created_at!: Date;

    @ApiProperty()
    updated_at!: Date;
}

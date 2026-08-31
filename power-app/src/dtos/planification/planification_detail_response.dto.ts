import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PlanificationListItemResponseDto } from './planification_list_item_response.dto';

export class PlanificationRoutineResponseDto {

    @ApiProperty({ example: 'uuid-1234' })
    id!: string;

    @ApiProperty({ example: 'Día A - Pecho y tríceps' })
    name!: string;

    @ApiPropertyOptional({ example: 'Enfocarse en la contracción' })
    coach_note?: string;

    @ApiProperty({ example: true, description: 'Se devuelve a propósito: una rutina dada de baja sigue apareciendo en los planes que la referencian' })
    active!: boolean;
}

export class PlanificationAsignationResponseDto {

    @ApiProperty({ example: 'uuid-1234', description: 'Id del Routine_Asignation (el vínculo), NO el de la rutina: es el que va a necesitar CU-E-12 para desasignar' })
    id!: string;

    @ApiProperty({ example: 1 })
    order!: number;

    @ApiProperty({ type: PlanificationRoutineResponseDto })
    routine!: PlanificationRoutineResponseDto;
}

// Extiende el item del listado porque el detalle es exactamente eso mas las rutinas.
// Es tambien la forma de cada fila de GET /planification/all-plus: el arbol de una
// planificacion termina en las rutinas, asi que el "plus" y el detalle coinciden y no
// hace falta un DTO aparte. Si el detalle algun dia baja a los circuitos, ahi se separan
export class PlanificationDetailResponseDto extends PlanificationListItemResponseDto {

    @ApiProperty({ type: [PlanificationAsignationResponseDto], description: 'Rutinas del plan, ordenadas por order. Vacío hasta que exista CU-E-12' })
    routines!: PlanificationAsignationResponseDto[];
}

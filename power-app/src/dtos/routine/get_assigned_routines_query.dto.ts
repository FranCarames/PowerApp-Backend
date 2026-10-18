import { IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsCalendarDay } from './is_calendar_day.decorator';

export class GetAssignedRoutinesQueryDto {

    @ApiPropertyOptional({ example: '2026-10-19', description: 'Primer día a incluir (inclusive), en formato YYYY-MM-DD. El home del alumno manda el lunes de la semana; el entrenador, nada' })
    @IsOptional()
    @IsCalendarDay()
    from?: string;

    @ApiPropertyOptional({ example: '2026-10-25', description: 'Último día a incluir (inclusive), en formato YYYY-MM-DD. El home del alumno manda el domingo de la semana. No puede ser anterior a from (400)' })
    @IsOptional()
    @IsCalendarDay()
    to?: string;
}

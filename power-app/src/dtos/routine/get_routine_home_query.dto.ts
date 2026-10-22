import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsCalendarDay } from './is_calendar_day.decorator';

// Query de GET /routine/home/:userId (spec del home, D32 y D33). No acepta from ni to: el rango son
// semanas enteras, del lunes de la semana de date en adelante
export class GetRoutineHomeQueryDto {

    @ApiPropertyOptional({ example: '2026-10-22', description: 'Día alrededor del cual se arma el home (YYYY-MM-DD), generalmente hoy. Se redondea al lunes de su semana. Si se omite, es hoy en hora de Argentina' })
    @IsOptional()
    @IsCalendarDay()
    date?: string;

    @ApiPropertyOptional({ example: 2, minimum: 1, maximum: 8, default: 1, description: 'Cantidad de semanas enteras que se devuelven, contando la de date' })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(8)
    week?: number;
}

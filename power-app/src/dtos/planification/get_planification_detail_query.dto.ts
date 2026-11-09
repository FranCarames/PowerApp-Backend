import { IsOptional, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

// El mismo parametro y la misma transformacion que los listados de plantillas
// (GetPlanificationsQueryDto) y el del alumno (GetUserPlanificationsQueryDto), sin keyword ni type:
// el detalle es de una sola planificacion
export class GetPlanificationDetailQueryDto {

    @ApiPropertyOptional({ example: false, default: false, description: 'true para incluir también las rutinas quitadas del plan (vínculos con active = false, CU-E-12c)' })
    @IsOptional()
    @Transform(({ value }) => {
        if (value === 'true' || value === true) return true;
        if (value === 'false' || value === false) return false;
        return value;
    })
    @IsBoolean()
    include_inactive?: boolean = false;
}

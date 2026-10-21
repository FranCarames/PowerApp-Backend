import { IsOptional, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

// El mismo parametro y la misma transformacion que los listados de plantillas
// (GetPlanificationsQueryDto), sin keyword ni type: el listado del alumno no los usa
export class GetUserPlanificationsQueryDto {

    @ApiPropertyOptional({ example: false, default: false, description: 'true para incluir también las asignaciones quitadas (E-14)' })
    @IsOptional()
    @Transform(({ value }) => {
        if (value === 'true' || value === true) return true;
        if (value === 'false' || value === false) return false;
        return value;
    })
    @IsBoolean()
    include_inactive?: boolean = false;
}

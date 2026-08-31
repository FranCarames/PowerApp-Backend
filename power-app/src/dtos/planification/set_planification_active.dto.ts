import { IsNotEmpty, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SetPlanificationActiveDto {

    @ApiProperty({ example: false, description: 'false para dar de baja la planificación (baja lógica), true para reactivarla' })
    @IsNotEmpty()
    @IsBoolean()
    active!: boolean;
}

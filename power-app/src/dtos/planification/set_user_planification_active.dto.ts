import { IsNotEmpty, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SetUserPlanificationActiveDto {

    @ApiProperty({ example: false, description: 'false para quitarle la planificación al alumno (baja lógica), true para reincorporarla con sus mismas fechas. Pedir el estado que ya tiene da 400' })
    @IsNotEmpty()
    @IsBoolean()
    active!: boolean;
}

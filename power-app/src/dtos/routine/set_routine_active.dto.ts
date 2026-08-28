import { IsNotEmpty, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SetRoutineActiveDto {

    @ApiProperty({ example: false, description: 'false para dar de baja la rutina (baja lógica), true para reactivarla' })
    @IsNotEmpty()
    @IsBoolean()
    active!: boolean;
}

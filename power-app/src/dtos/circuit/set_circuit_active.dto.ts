import { IsNotEmpty, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SetCircuitActiveDto {

    @ApiProperty({ example: false, description: 'false para dar de baja el circuito (baja lógica), true para reactivarlo' })
    @IsNotEmpty()
    @IsBoolean()
    active!: boolean;
}

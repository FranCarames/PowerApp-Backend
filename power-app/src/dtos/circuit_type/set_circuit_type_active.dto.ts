import { IsNotEmpty, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SetCircuitTypeActiveDto {

    @ApiProperty({ example: false, description: 'false para dar de baja el tipo (baja lógica), true para reactivarlo. Un tipo con circuitos se da de baja igual: los circuitos lo conservan' })
    @IsNotEmpty()
    @IsBoolean()
    active!: boolean;
}

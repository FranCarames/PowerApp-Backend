import { IsNotEmpty, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SetUserActiveDto {

    @ApiProperty({ example: false, description: 'true para reactivar la cuenta, false para cerrarla (baja lógica)' })
    @IsNotEmpty()
    @IsBoolean()
    active!: boolean;
}

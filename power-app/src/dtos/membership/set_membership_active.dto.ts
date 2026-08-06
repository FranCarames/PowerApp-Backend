import { IsNotEmpty, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SetMembershipActiveDto {

    @ApiProperty({ example: false, description: 'true para reactivar la membresía, false para darla de baja (baja lógica)' })
    @IsNotEmpty()
    @IsBoolean()
    active!: boolean;
}

import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../entities/user.entity';

export class LoginResponseDto extends User {

    @ApiProperty({
        example: false,
        description: 'true si se ingresó con la contraseña temporal (CU-U-04): el cliente tiene que llevar al cambio de contraseña (CU-U-05) antes de continuar. Viene siempre.',
    })
    password_change_required!: boolean;
}

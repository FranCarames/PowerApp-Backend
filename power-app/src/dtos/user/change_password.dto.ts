import { IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {

    @ApiProperty({ example: 'secret123', maxLength: 50, description: 'Contraseña actual, o la temporal si la sesión vino de una recuperación' })
    @IsNotEmpty()
    @IsString()
    @MaxLength(50)
    current_password!: string;

    @ApiProperty({ example: 'nuevaSecret456', minLength: 6, maxLength: 50 })
    @IsNotEmpty()
    @IsString()
    @MinLength(6)
    @MaxLength(50)
    new_password!: string;
}

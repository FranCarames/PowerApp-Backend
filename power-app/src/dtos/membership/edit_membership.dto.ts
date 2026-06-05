import { IsNotEmpty, IsString, MaxLength, IsNumber, Min, IsPositive, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class EditMembershipDto {

    @ApiProperty({ example: 'Plan Mensual', maxLength: 50 })
    @IsNotEmpty()
    @IsString()
    @MaxLength(50)
    name!: string;

    @ApiProperty({ example: 30, description: 'Duración en días' })
    @IsNotEmpty()
    @IsInt()
    @IsPositive()
    @Min(1)
    duration!: number;

    @ApiProperty({ example: 9999.99 })
    @IsNotEmpty()
    @IsNumber({ maxDecimalPlaces: 2 })
    @IsPositive()
    @Min(0.01)
    price!: number;
}

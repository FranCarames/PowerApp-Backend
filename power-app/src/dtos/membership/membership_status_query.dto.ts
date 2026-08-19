import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MembershipStatus } from './membership_status.enum';

export class MembershipStatusQueryDto {

    @ApiProperty({ enum: MembershipStatus, description: 'Estado de membresía por el que se filtra' })
    @IsNotEmpty()
    @IsEnum(MembershipStatus)
    status!: MembershipStatus;
}

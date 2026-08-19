import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MembershipStatus } from './membership_status.enum';

export class MembershipStatusCountsDto {
    @ApiProperty({ example: 12 })
    active!: number;

    @ApiProperty({ example: 3 })
    expiring_soon!: number;

    @ApiProperty({ example: 5 })
    expired!: number;

    @ApiProperty({ example: 2, description: 'Alumnos sin ningún pago registrado' })
    no_payments!: number;
}

/** CU-E-26 — contadores de alumnos por estado de membresía. */
export class MembershipStatusSummaryDto {
    @ApiProperty({ type: MembershipStatusCountsDto })
    counts!: MembershipStatusCountsDto;

    @ApiProperty({ example: 22 })
    total_students!: number;

    @ApiProperty({ example: 7, description: 'Ventana de aviso configurada (MEMBERSHIP_EXPIRING_SOON_DAYS)' })
    expiring_soon_days!: number;
}

export class StudentMembershipDto {
    @ApiProperty({ example: 'uuid-1234' })
    id!: string;

    @ApiProperty({ example: 'Lucia' })
    first_name!: string;

    @ApiProperty({ example: 'Fernandez' })
    last_name!: string;

    @ApiProperty({ example: 'lucia.fernandez@test.com' })
    email!: string;

    @ApiProperty({ enum: MembershipStatus })
    membership_status!: MembershipStatus;

    @ApiPropertyOptional({ example: '2026-09-15T23:59:59.999-03:00', nullable: true, description: 'Vencimiento del último pago; null si nunca pagó' })
    expired_at!: Date | null;

    @ApiPropertyOptional({ example: 'Plan Mensual', nullable: true, description: 'Tipo del último pago; null si nunca pagó' })
    membership_name!: string | null;

    @ApiPropertyOptional({ example: 'uuid-1234', nullable: true })
    membership_id!: string | null;
}

export class MembershipTypeGroupDto {
    @ApiProperty({ example: 'uuid-1234', nullable: true })
    membership_id!: string | null;

    @ApiProperty({ example: 'Plan Mensual' })
    membership_name!: string;

    @ApiProperty({ example: 8 })
    total!: number;

    @ApiProperty({ type: [StudentMembershipDto] })
    students!: StudentMembershipDto[];
}

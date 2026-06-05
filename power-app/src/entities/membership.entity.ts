import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { MembershipPayment } from './membership_payment.entity';

@Entity('Membership')
export class Membership {
    @ApiProperty({ example: 'uuid-1234' })
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ApiProperty({ example: 'Plan Mensual', maxLength: 50 })
    @Column({ length: 50, nullable: false })
    name!: string;

    @ApiProperty({ example: 30 })
    @Column({ type: 'integer', nullable: false })
    duration!: number;

    @ApiProperty({ example: 9999.99 })
    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false, transformer: { to: (v) => v, from: (v) => parseFloat(v) } })
    price!: number;

    @ApiProperty()
    @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    created_at!: Date;

    @ApiProperty()
    @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    updated_at!: Date;

    // JOIN RELATIONSHIPS
    @OneToMany(() => MembershipPayment, membershipPayment => membershipPayment.membership)
    membershipPayments!: MembershipPayment[];
}

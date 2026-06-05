import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from './user.entity';
import { Membership } from './membership.entity';

@Entity('Membership_Payment')
export class MembershipPayment {
    @ApiProperty({ example: 'uuid-1234' })
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ApiProperty({ example: 'uuid-1234' })
    @Column({ type: 'uuid', nullable: false })
    user_id!: string;

    @ApiProperty({ example: 'uuid-1234' })
    @Column({ type: 'uuid', nullable: false })
    membership_id!: string;

    @ApiProperty({ example: 'Plan Mensual', maxLength: 50 })
    @Column({ length: 50, nullable: false })
    name!: string;

    @ApiProperty({ example: 30 })
    @Column({ type: 'integer', nullable: false })
    duration!: number;

    @ApiProperty({ example: true })
    @Column({ nullable: false, default: true })
    active!: boolean;

    @ApiProperty({ example: 9999.99 })
    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false, transformer: { to: (v) => v, from: (v) => parseFloat(v) } })
    price!: number;

    @ApiProperty()
    @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    created_at!: Date;

    @ApiProperty()
    @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    updated_at!: Date;

    @ApiProperty()
    @Column({ type: 'timestamptz', nullable: false })
    expired_at!: Date;

    // JOIN RELATIONSHIPS
    @ManyToOne(() => User, user => user.userMembershipPayments)
    @JoinColumn({ name: 'user_id' })
    user!: User;

    @ManyToOne(() => Membership, membership => membership.membershipPayments)
    @JoinColumn({ name: 'membership_id' })
    membership!: Membership;
}

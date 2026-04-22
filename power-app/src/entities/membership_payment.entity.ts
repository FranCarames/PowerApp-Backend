import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Membership } from './membership.entity';

@Entity('Membership_Payment')
export class MembershipPayment {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'uuid', nullable: false })
    user_id!: string;

    @Column({ type: 'uuid', nullable: false })
    membership_id!: string;

    @Column({ length: 50, nullable: false })
    name!: string;

    @Column({ type: 'integer', nullable: false })
    duration!: number;

    @Column({ nullable: false, default: true })
    active!: boolean;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
    price!: number;

    @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    created_at!: Date;

    @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    updated_at!: Date;

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
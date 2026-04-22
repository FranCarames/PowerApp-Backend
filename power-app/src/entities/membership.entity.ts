import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { MembershipPayment } from './membership_payment.entity';

@Entity('Membership')
export class Membership {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ length: 50, nullable: false })
    name!: string;

    @Column({ type: 'integer', nullable: false })
    duration!: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
    price!: number;

    @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    created_at!: Date;

    @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    updated_at!: Date;

    // JOIN RELATIONSHIPS
    @OneToMany(() => MembershipPayment, membershipPayment => membershipPayment.membership)
    membershipPayments!: MembershipPayment[];
}
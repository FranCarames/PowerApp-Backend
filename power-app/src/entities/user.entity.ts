import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { FavoriteExercise } from './ParaValidar/favorite_exercise.entity';
import { UserCron } from './ParaValidar/user_cron.entity';
import { UserRM } from './user_rm.entity';
import { MembershipPayment } from './membership_payment.entity';

export enum UserRole {
    user  = 'user',
    admin = 'admin',
}

@Entity('User')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ length: 50, nullable: false })
    first_name!: string;

    @Column({ length: 50, nullable: false })
    last_name!: string;

    @Column({ length: 50, nullable: false, unique: true })
    email!: string;

    @Column({ nullable: false, default: false })
    email_verified!: boolean;

    @Column({ length: 255, nullable: false })
    password!: string;

    @Column({ length: 255, nullable: true })
    temp_password!: string;

    @Column({
        type: 'enum',
        enum: UserRole,
        default: UserRole.user,
        nullable: false
    })
    role!: UserRole;

    @Column({ length: 150, nullable: true })
    profile_picture?: string;

    @Column({ length: 10, nullable: true })
    phone_prefix?: string;

    @Column({ length: 20, nullable: true })
    phone_number?: string;

    @Column({ nullable: false, default: false })
    phone_verified!: boolean;

    @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    created_at!: Date;

    @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updated_at!: Date;

    // JOIN RELATIONSHIPS
    @OneToMany(() => UserRM, userRM => userRM.user)
    userRMs!: UserRM[];

    @OneToMany(() => MembershipPayment, membershipPayment => membershipPayment.user)
    userMembershipPayments!: MembershipPayment[];
}

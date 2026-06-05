import { Entity, PrimaryGeneratedColumn, Column, OneToMany, OneToOne } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Coach } from './coach.entity';
import { FavoriteExercise } from './ParaValidar/favorite_exercise.entity';
import { UserCron } from './ParaValidar/user_cron.entity';
import { UserRM } from './user_rm.entity';
import { MembershipPayment } from './membership_payment.entity';

export enum UserRole {
    user  = 'user',
    coach = 'coach',
    admin = 'admin',
}

@Entity('User')
export class User {
    @ApiProperty({ example: 'uuid-1234' })
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ApiProperty({ example: 'Juan', maxLength: 50 })
    @Column({ length: 50, nullable: false })
    first_name!: string;

    @ApiProperty({ example: 'Pérez', maxLength: 50 })
    @Column({ length: 50, nullable: false })
    last_name!: string;

    @ApiProperty({ example: 'juan@example.com', maxLength: 50 })
    @Column({ length: 50, nullable: false, unique: true })
    email!: string;

    @ApiProperty({ example: false })
    @Column({ nullable: false, default: false })
    email_verified!: boolean;

    @ApiProperty({ maxLength: 255 })
    @Column({ length: 255, nullable: false })
    password!: string;

    @ApiPropertyOptional({ maxLength: 255 })
    @Column({ length: 255, nullable: true })
    temp_password!: string;

    @ApiProperty({ enum: UserRole, default: UserRole.user })
    @Column({ type: 'enum', enum: UserRole, default: UserRole.user, nullable: false })
    role!: UserRole;

    @ApiPropertyOptional({ example: 'https://...', maxLength: 150 })
    @Column({ length: 150, nullable: true })
    profile_picture?: string;

    @ApiPropertyOptional({ example: '+54', maxLength: 10 })
    @Column({ length: 10, nullable: true })
    phone_prefix?: string;

    @ApiPropertyOptional({ example: '1123456789', maxLength: 20 })
    @Column({ length: 20, nullable: true })
    phone_number?: string;

    @ApiProperty({ example: false })
    @Column({ nullable: false, default: false })
    phone_verified!: boolean;

    @ApiProperty()
    @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    created_at!: Date;

    @ApiProperty()
    @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updated_at!: Date;

    // JOIN RELATIONSHIPS
    @OneToMany(() => UserRM, userRM => userRM.user)
    userRMs!: UserRM[];

    @OneToMany(() => MembershipPayment, membershipPayment => membershipPayment.user)
    userMembershipPayments!: MembershipPayment[];

    @OneToOne(() => Coach, coach => coach.user, { nullable: true })
    coach?: Coach;
}

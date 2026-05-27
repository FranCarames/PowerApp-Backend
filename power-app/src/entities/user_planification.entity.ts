import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Coach } from './coach.entity';
import { Planification } from './planification.entity';

@Entity('User_Planification')
export class UserPlanification {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'uuid', nullable: false })
    user_id!: string;

    @Column({ type: 'uuid', nullable: true })
    coach_id?: string;

    @Column({ type: 'uuid', nullable: true })
    planification_id?: string;

    @Column({ type: 'text', nullable: true })
    description?: string;

    @Column({ type: 'integer', nullable: true })
    number_of_routines?: number;

    @Column({ length: 30, nullable: true })
    type?: string;

    @Column({ length: 100, nullable: true })
    coach_note?: string;

    @Column({ length: 50, nullable: true })
    duration?: string;

    @Column({ type: 'date', nullable: false })
    start_date!: Date;

    @Column({ type: 'date', nullable: false })
    end_date!: Date;

    @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    created_at!: Date;

    @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updated_at!: Date;

    // JOIN RELATIONSHIPS
    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user!: User;

    @ManyToOne(() => Coach, { onDelete: 'SET NULL', nullable: true })
    @JoinColumn({ name: 'coach_id' })
    coach?: Coach;

    @ManyToOne(() => Planification, planification => planification.userPlanifications, { onDelete: 'SET NULL', nullable: true })
    @JoinColumn({ name: 'planification_id' })
    planification?: Planification;
}

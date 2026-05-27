import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { RoutineAsignation } from './routine_asignation.entity';
import { User } from './user.entity';

@Entity('User_Routine')
export class UserRoutine {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'uuid', nullable: false })
    routine_asignation_id!: string;

    @Column({ type: 'uuid', nullable: false })
    user_id!: string;

    @Column({ type: 'date', nullable: false })
    date!: Date;

    @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    created_at!: Date;

    @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updated_at!: Date;

    // JOIN RELATIONSHIPS
    @ManyToOne(() => RoutineAsignation, routineAsignation => routineAsignation.userRoutines, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'routine_asignation_id' })
    routineAsignation!: RoutineAsignation;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user!: User;
}

import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Routine } from './routine.entity';
import { User } from './user.entity';
import { RoutineAsignation } from './routine_asignation.entity';

@Entity('Routine_Asignation_User')
export class RoutineAsignationUser {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'uuid', nullable: false })
    routine_id!: string;

    @Column({ type: 'uuid', nullable: false })
    user_id!: string;

    @Column({ type: 'uuid', nullable: false })
    routine_asignation_id!: string;

    @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    created_at!: Date;

    @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updated_at!: Date;

    // JOIN RELATIONSHIPS
    @ManyToOne(() => Routine, routine => routine.routineAsignationUsers, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'routine_id' })
    routine!: Routine;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user!: User;

    @ManyToOne(() => RoutineAsignation, routineAsignation => routineAsignation.routineAsignationUsers, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'routine_asignation_id' })
    routineAsignation!: RoutineAsignation;
}

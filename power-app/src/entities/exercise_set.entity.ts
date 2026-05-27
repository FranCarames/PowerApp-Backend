import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { RoutineExercise } from './routine_exercise.entity';

@Entity('Exercise_Set')
export class ExerciseSet {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'uuid', nullable: false })
    routine_exercise_id!: string;

    @Column({ type: 'integer', nullable: false })
    set_order!: number;

    @Column({ type: 'integer', nullable: false })
    set_count!: number;

    @Column({ type: 'integer', nullable: false })
    rep_count!: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    weight?: number;

    @Column({ type: 'integer', nullable: true })
    rpe?: number;

    @Column({ type: 'integer', nullable: true })
    rir?: number;

    @Column({ type: 'integer', nullable: true })
    rm_perc?: number;

    @Column({ nullable: false, default: false })
    amrap!: boolean;

    @Column({ type: 'integer', nullable: true })
    amrap_time?: number;

    @Column({ nullable: false, default: false })
    rm!: boolean;

    @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    created_at!: Date;

    @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updated_at!: Date;

    // JOIN RELATIONSHIPS
    @ManyToOne(() => RoutineExercise, routineExercise => routineExercise.exerciseSets, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'routine_exercise_id' })
    routineExercise!: RoutineExercise;
}

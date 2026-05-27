import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Exercise } from './exercise.entity';
import { Circuit } from './circuit.entity';
import { ExerciseSet } from './exercise_set.entity';

@Entity('Routine_Exercise')
export class RoutineExercise {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'uuid', nullable: false })
    exercise_id!: string;

    @Column({ type: 'uuid', nullable: false })
    circuit_id!: string;

    @Column({ type: 'integer', nullable: false })
    exercise_order!: number;

    @Column({ length: 100, nullable: true })
    coach_note?: string;

    @Column({ length: 100, nullable: true })
    user_note?: string;

    @Column({ nullable: false, default: false })
    finished!: boolean;

    @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    created_at!: Date;

    @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updated_at!: Date;

    // JOIN RELATIONSHIPS
    @ManyToOne(() => Exercise, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'exercise_id' })
    exercise!: Exercise;

    @ManyToOne(() => Circuit, circuit => circuit.routineExercises, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'circuit_id' })
    circuit!: Circuit;

    @OneToMany(() => ExerciseSet, exerciseSet => exerciseSet.routineExercise)
    exerciseSets!: ExerciseSet[];
}

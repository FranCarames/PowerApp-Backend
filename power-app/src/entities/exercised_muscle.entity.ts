import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Exercise } from './exercise.entity';
import { Muscle } from './muscle.entity';

@Entity('Exercised_Muscle')
export class ExercisedMuscle {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'uuid', nullable: false })
    exercise_id!: string;

    @Column({ type: 'uuid', nullable: false })
    muscle_id!: string;

    @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    created_at!: Date;

    @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updated_at!: Date;

    // JOIN RELATIONSHIPS
    @ManyToOne(() => Exercise, exercise => exercise.exercisedMuscles, { onDelete: 'CASCADE' })
    exercise!: Exercise;

    @ManyToOne(() => Muscle, muscle => muscle.exercisedMuscles, { onDelete: 'CASCADE' })
    muscle!: Muscle;
}
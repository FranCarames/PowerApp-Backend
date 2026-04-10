import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { MuscleGroup } from './muscle_group.entity';
import { ExercisedMuscle } from './exercised_muscle.entity';

@Entity('Muscle')
export class Muscle {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'uuid', nullable: false })
    muscle_group_id!: string;

    @Column({ length: 50, nullable: false })
    name!: string;

    @Column({ type: 'text', nullable: true })
    description!: string;

    @Column({ length: 150, nullable: true })
    image_url?: string;

    @Column({ length: 150, nullable: true })
    preview_image?: string;

    @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    created_at!: Date;

    @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updated_at!: Date;

    // JOIN RELATIONSHIPS
    @ManyToOne(() => MuscleGroup, muscleGroup => muscleGroup.muscles)
    @JoinColumn({ name: 'muscle_group_id' })
    muscle_group!: MuscleGroup;

    @OneToMany(() => ExercisedMuscle, exercisedMuscle => exercisedMuscle.muscle, { cascade: true })
    exercisedMuscles!: ExercisedMuscle[];
}
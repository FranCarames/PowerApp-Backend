import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Exercise } from './exercise.entity';
import { Muscle } from './muscle.entity';

@Entity('Exercised_Muscle')
export class ExercisedMuscle {
    @ApiProperty({ example: 'uuid-1234' })
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ApiProperty({ example: 'uuid-1234' })
    @Column({ type: 'uuid', nullable: false })
    exercise_id!: string;

    @ApiProperty({ example: 'uuid-1234' })
    @Column({ type: 'uuid', nullable: false })
    muscle_id!: string;

    @ApiProperty()
    @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    created_at!: Date;

    @ApiProperty()
    @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updated_at!: Date;

    // JOIN RELATIONSHIPS
    @ManyToOne(() => Exercise, exercise => exercise.exercisedMuscles, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'exercise_id' })
    exercise!: Exercise;

    @ManyToOne(() => Muscle, muscle => muscle.exercisedMuscles, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'muscle_id' })
    muscle!: Muscle;
}

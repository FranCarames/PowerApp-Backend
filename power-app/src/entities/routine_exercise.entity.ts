import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exercise } from './exercise.entity';
import { Circuit } from './circuit.entity';
import { ExerciseSet } from './exercise_set.entity';

@Entity('Routine_Exercise')
export class RoutineExercise {
    @ApiProperty({ example: 'uuid-1234' })
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ApiProperty({ example: 'uuid-1234' })
    @Column({ type: 'uuid', nullable: false })
    exercise_id!: string;

    @ApiProperty({ example: 'uuid-1234' })
    @Column({ type: 'uuid', nullable: false })
    circuit_id!: string;

    @ApiProperty({ example: 1 })
    @Column({ type: 'integer', nullable: false })
    exercise_order!: number;

    @ApiPropertyOptional({ example: 'Bajar lento en 3 segundos', maxLength: 100 })
    @Column({ length: 100, nullable: true })
    coach_note?: string;

    @ApiPropertyOptional({ example: 'Me costó la última serie', maxLength: 100 })
    @Column({ length: 100, nullable: true })
    user_note?: string;

    @ApiProperty({ example: false })
    @Column({ nullable: false, default: false })
    finished!: boolean;

    @ApiProperty()
    @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    created_at!: Date;

    @ApiProperty()
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

import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RoutineExercise } from './routine_exercise.entity';

@Entity('Exercise_Set')
export class ExerciseSet {
    @ApiProperty({ example: 'uuid-1234' })
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ApiProperty({ example: 'uuid-1234' })
    @Column({ type: 'uuid', nullable: false })
    routine_exercise_id!: string;

    @ApiProperty({ example: 1 })
    @Column({ type: 'integer', nullable: false })
    set_order!: number;

    @ApiProperty({ example: 3 })
    @Column({ type: 'integer', nullable: false })
    set_count!: number;

    @ApiProperty({ example: 8 })
    @Column({ type: 'integer', nullable: false })
    rep_count!: number;

    @ApiPropertyOptional({ example: 80.5 })
    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, transformer: { to: (v) => v, from: (v) => v != null ? parseFloat(v) : null } })
    weight?: number;

    @ApiPropertyOptional({ example: 7 })
    @Column({ type: 'integer', nullable: true })
    rpe?: number;

    @ApiPropertyOptional({ example: 2 })
    @Column({ type: 'integer', nullable: true })
    rir?: number;

    @ApiPropertyOptional({ example: 75 })
    @Column({ type: 'integer', nullable: true })
    rm_perc?: number;

    @ApiProperty({ example: false })
    @Column({ nullable: false, default: false })
    amrap!: boolean;

    @ApiPropertyOptional({ example: 60 })
    @Column({ type: 'integer', nullable: true })
    amrap_time?: number;

    @ApiProperty({ example: false })
    @Column({ nullable: false, default: false })
    rm!: boolean;

    @ApiProperty()
    @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    created_at!: Date;

    @ApiProperty()
    @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updated_at!: Date;

    // JOIN RELATIONSHIPS
    @ManyToOne(() => RoutineExercise, routineExercise => routineExercise.exerciseSets, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'routine_exercise_id' })
    routineExercise!: RoutineExercise;
}

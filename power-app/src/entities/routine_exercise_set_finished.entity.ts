import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRoutine } from './user_routine.entity';
import { ExerciseSet } from './exercise_set.entity';

@Entity('Routine_Exercise_Set_Finished')
@Unique('uk_resf_user_routine_set', ['user_routine_id', 'routine_exercise_set_id'])
export class RoutineExerciseSetFinished {
    @ApiProperty({ example: 'uuid-1234' })
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ApiProperty({ example: 'uuid-1234' })
    @Column({ type: 'uuid', nullable: false })
    user_routine_id!: string;

    @ApiProperty({ example: 'uuid-1234' })
    @Column({ type: 'uuid', nullable: false })
    routine_exercise_set_id!: string;

    @ApiPropertyOptional({ example: 'Me costó la última serie', maxLength: 100 })
    @Column({ length: 100, nullable: true })
    user_note?: string;

    @ApiProperty()
    @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    created_at!: Date;

    @ApiProperty()
    @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updated_at!: Date;

    // JOIN RELATIONSHIPS
    @ManyToOne(() => UserRoutine, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_routine_id' })
    userRoutine!: UserRoutine;

    @ManyToOne(() => ExerciseSet, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'routine_exercise_set_id' })
    exerciseSet!: ExerciseSet;
}

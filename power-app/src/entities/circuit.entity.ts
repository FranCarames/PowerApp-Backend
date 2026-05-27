import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Routine } from './routine.entity';
import { RoutineExercise } from './routine_exercise.entity';

@Entity('Circuit')
export class Circuit {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'uuid', nullable: false })
    routine_id!: string;

    @Column({ length: 100, nullable: false })
    name!: string;

    @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    created_at!: Date;

    @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updated_at!: Date;

    // JOIN RELATIONSHIPS
    @ManyToOne(() => Routine, routine => routine.circuits, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'routine_id' })
    routine!: Routine;

    @OneToMany(() => RoutineExercise, routineExercise => routineExercise.circuit)
    routineExercises!: RoutineExercise[];
}

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

    // Acepta null explicito: al editar el circuito el entrenador tiene que poder borrar
    // una nota que ya no aplica, y TypeORM ignora las propiedades en undefined.
    // El type: 'varchar' es obligatorio con la union: TS emite design:type = Object
    // para string | null, y sin el tipo declarado TypeORM no sabe que columna crear
    @ApiPropertyOptional({ example: 'Bajar lento en 3 segundos', maxLength: 100 })
    @Column({ type: 'varchar', length: 100, nullable: true })
    coach_note?: string | null;

    // Baja logica: un ejercicio que sale del circuito pero que algun alumno ya completo
    // no se borra, se apaga. Mismo patron que Circuit, Routine y Planification
    @ApiProperty({ example: true })
    @Column({ nullable: false, default: true })
    active!: boolean;

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

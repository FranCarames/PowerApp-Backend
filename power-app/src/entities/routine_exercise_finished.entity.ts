import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRoutine } from './user_routine.entity';
import { RoutineExercise } from './routine_exercise.entity';

// La existencia de la fila = ese ejercicio esta hecho en esa instancia de rutina.
// El registro se crea al completar el ejercicio ENTERO: el tildado serie por serie
// es maquillaje del front y no toca la base
@Entity('Routine_Exercise_Finished')
@Unique('uk_ref_user_routine_exercise', ['user_routine_id', 'routine_exercise_id'])
export class RoutineExerciseFinished {
    @ApiProperty({ example: 'uuid-1234' })
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ApiProperty({ example: 'uuid-1234' })
    @Column({ type: 'uuid', nullable: false })
    user_routine_id!: string;

    @ApiProperty({ example: 'uuid-1234' })
    @Column({ type: 'uuid', nullable: false })
    routine_exercise_id!: string;

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

    // RESTRICT y no CASCADE, a proposito: la baja fisica de un Routine_Exercise solo pasa
    // cuando nadie lo completo, asi que si esta FK llega a frenar un delete es porque hay
    // un bug en la reconciliacion. Preferimos el error de la base antes que perder historial
    @ManyToOne(() => RoutineExercise, { onDelete: 'RESTRICT' })
    @JoinColumn({ name: 'routine_exercise_id' })
    routineExercise!: RoutineExercise;
}

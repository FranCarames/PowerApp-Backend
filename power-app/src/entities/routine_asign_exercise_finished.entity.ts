import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RoutineAsignationUser } from './routine_asignation_user.entity';
import { RoutineExercise } from './routine_exercise.entity';

// Gemela de Routine_Exercise_Finished para la via individual (D1, 17/10): la existencia de la
// fila = ese ejercicio esta hecho en esa asignacion. Misma logica y misma nota; lo unico que
// cambia es de que cuelga. El tildado serie por serie es del front y no toca la base
@Entity('Routine_Asign_Exercise_Finished')
@Unique('uk_raef_asign_exercise', ['user_routine_asign_id', 'routine_exercise_id'])
export class RoutineAsignExerciseFinished {
    @ApiProperty({ example: 'uuid-1234' })
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ApiProperty({ example: 'uuid-1234', description: 'Id de la Routine_Asignation_User' })
    @Column({ type: 'uuid', nullable: false })
    user_routine_asign_id!: string;

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
    // RESTRICT en las dos, a proposito (D4): una asignacion ya entrenada no se borra, y la baja
    // fisica de un Routine_Exercise solo pasa cuando nadie lo completo
    @ManyToOne(() => RoutineAsignationUser, { onDelete: 'RESTRICT' })
    @JoinColumn({ name: 'user_routine_asign_id' })
    routineAsignationUser!: RoutineAsignationUser;

    @ManyToOne(() => RoutineExercise, { onDelete: 'RESTRICT' })
    @JoinColumn({ name: 'routine_exercise_id' })
    routineExercise!: RoutineExercise;
}

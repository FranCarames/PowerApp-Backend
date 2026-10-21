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

    // Acepta null explicito: dejar la nota vacia la borra (U-13), y TypeORM ignora las propiedades
    // undefined. El type: 'varchar' es OBLIGATORIO con la union: TS emite design:type = Object para
    // string | null, y sin el tipo declarado TypeORM no sabe que columna crear. La columna no cambia:
    // sigue siendo VARCHAR(100) nullable, igual que en ddl.py
    @ApiPropertyOptional({ example: 'Me costó la última serie', maxLength: 100, nullable: true })
    @Column({ type: 'varchar', length: 100, nullable: true })
    user_note?: string | null;

    // El dia en que el alumno hizo el ejercicio (D25, 20/10), sin hora. Lo manda el cliente al
    // marcar (el servidor no calcula "hoy") y se puede corregir: permite marcar en diferido.
    // created_at sigue siendo cuando se registro la marca. TypeORM hidrata date como 'YYYY-MM-DD'
    @ApiProperty({ example: '2026-10-20', description: 'Día en que el alumno hizo el ejercicio (YYYY-MM-DD, sin hora)' })
    @Column({ type: 'date', nullable: false })
    finished_at!: string;

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

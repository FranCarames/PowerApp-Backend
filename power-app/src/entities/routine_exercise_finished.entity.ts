import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserPlanification } from './user_planification.entity';
import { RoutineAsignation } from './routine_asignation.entity';
import { RoutineExercise } from './routine_exercise.entity';

// Via de la planificacion. La existencia de la fila = ese ejercicio esta hecho en esa rutina
// (routine_asignation_id) de esa asignacion del plan al alumno (user_planification_id). Cuelga
// directo de las dos: no hay instancia intermedia (D11, 17/10).
// El registro se crea al completar el ejercicio ENTERO: el tildado serie por serie es
// maquillaje del front y no toca la base.
// Consistencia que la base NO garantiza: la Routine_Asignation tiene que ser de la misma
// planificacion que la User_Planification. Con dos FK simples no se puede expresar; la valida
// el service al marcar (bloque B)
@Entity('Routine_Exercise_Finished')
@Unique('uk_ref_plan_asignation_exercise', ['user_planification_id', 'routine_asignation_id', 'routine_exercise_id'])
export class RoutineExerciseFinished {
    @ApiProperty({ example: 'uuid-1234' })
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ApiProperty({ example: 'uuid-1234' })
    @Column({ type: 'uuid', nullable: false })
    user_planification_id!: string;

    @ApiProperty({ example: 'uuid-1234' })
    @Column({ type: 'uuid', nullable: false })
    routine_asignation_id!: string;

    @ApiProperty({ example: 'uuid-1234' })
    @Column({ type: 'uuid', nullable: false })
    routine_exercise_id!: string;

    // Acepta null explicito: dejar la nota vacia la borra (U-13), y TypeORM ignora las propiedades
    // undefined. El type: 'varchar' es OBLIGATORIO con la union: TS emite design:type = Object para
    // string | null, y sin el tipo declarado TypeORM no sabe que columna crear. La columna no cambia:
    // sigue siendo VARCHAR(100) nullable, igual que en ddl.py. Mismo caso que la gemela individual
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
    // RESTRICT en las tres, a proposito: el historial no se pierde por una cascada. La baja
    // fisica de un Routine_Exercise solo pasa cuando nadie lo completo, asi que si una de estas
    // FK llega a frenar un delete es porque hay un bug en la reconciliacion. Preferimos el error
    // de la base antes que perder historial
    @ManyToOne(() => UserPlanification, { onDelete: 'RESTRICT' })
    @JoinColumn({ name: 'user_planification_id' })
    userPlanification!: UserPlanification;

    @ManyToOne(() => RoutineAsignation, { onDelete: 'RESTRICT' })
    @JoinColumn({ name: 'routine_asignation_id' })
    routineAsignation!: RoutineAsignation;

    @ManyToOne(() => RoutineExercise, { onDelete: 'RESTRICT' })
    @JoinColumn({ name: 'routine_exercise_id' })
    routineExercise!: RoutineExercise;
}

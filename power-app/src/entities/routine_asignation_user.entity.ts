import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Routine } from './routine.entity';
import { User } from './user.entity';

// Asignacion individual: una rutina suelta para un alumno, un dia. Cada fila es una sesion
// con su propio registro de ejecucion (Routine_Asign_Exercise_Finished), asi que la misma
// rutina se puede asignar al mismo alumno en dias distintos, pero no dos veces el mismo dia
@Entity('Routine_Asignation_User')
@Unique('uk_rau_routine_user_date', ['routine_id', 'user_id', 'date'])
export class RoutineAsignationUser {
    @ApiProperty({ example: 'uuid-1234' })
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ApiProperty({ example: 'uuid-1234' })
    @Column({ type: 'uuid', nullable: false })
    routine_id!: string;

    @ApiProperty({ example: 'uuid-1234' })
    @Column({ type: 'uuid', nullable: false })
    user_id!: string;

    // Dia sin hora. La columna es date y TypeORM la hidrata como 'YYYY-MM-DD' (string), no
    // como Date: se tipa string para que el tipo diga lo que de verdad llega
    @ApiProperty({ example: '2026-10-20', description: 'Día en que el alumno hace la rutina (sin hora)' })
    @Column({ type: 'date', nullable: false })
    date!: string;

    @ApiProperty()
    @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    created_at!: Date;

    @ApiProperty()
    @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updated_at!: Date;

    // JOIN RELATIONSHIPS
    // CASCADE en las dos, aunque nunca se dispara: la baja de la rutina y la del alumno son
    // logicas. Si algun dia se borrara fisicamente, el RESTRICT de Routine_Asign_Exercise_Finished
    // frena el borrado de una asignacion ya entrenada
    @ManyToOne(() => Routine, routine => routine.routineAsignationUsers, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'routine_id' })
    routine!: Routine;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user!: User;
}

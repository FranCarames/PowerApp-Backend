import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Planification } from './planification.entity';
import { RoutineCircuit } from './routine_circuit.entity';
import { RoutineAsignation } from './routine_asignation.entity';
import { RoutineAsignationUser } from './routine_asignation_user.entity';

@Entity('Routine')
export class Routine {
    @ApiProperty({ example: 'uuid-1234' })
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ApiPropertyOptional({ example: 'uuid-1234' })
    @Column({ type: 'uuid', nullable: true })
    routine_plan_id?: string;

    @ApiProperty({ example: 'Día A - Pecho y tríceps', maxLength: 50 })
    @Column({ length: 50, nullable: false })
    name!: string;

    // Acepta null explicito: al editar la rutina, el entrenador tiene que poder borrar
    // una nota que ya no aplica, y TypeORM ignora las propiedades undefined.
    // El type: 'varchar' es OBLIGATORIO con la union: TS emite design:type = Object
    // para string | null, y sin el tipo declarado TypeORM no sabe que columna crear
    @ApiPropertyOptional({ example: 'Enfocarse en la contracción', maxLength: 100 })
    @Column({ type: 'varchar', length: 100, nullable: true })
    coach_note?: string | null;

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
    @ManyToOne(() => Planification, planification => planification.routines, { onDelete: 'SET NULL', nullable: true })
    @JoinColumn({ name: 'routine_plan_id' })
    planification?: Planification;

    @OneToMany(() => RoutineCircuit, routineCircuit => routineCircuit.routine)
    routineCircuits!: RoutineCircuit[];

    @OneToMany(() => RoutineAsignation, routineAsignation => routineAsignation.routine)
    routineAsignations!: RoutineAsignation[];

    @OneToMany(() => RoutineAsignationUser, routineAsignationUser => routineAsignationUser.routine)
    routineAsignationUsers!: RoutineAsignationUser[];
}

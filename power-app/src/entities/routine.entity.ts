import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Planification } from './planification.entity';
import { Circuit } from './circuit.entity';
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

    @ApiProperty({ example: 'Día A - Pecho', maxLength: 20 })
    @Column({ length: 20, nullable: false })
    name!: string;

    @ApiPropertyOptional({ example: 'Enfocarse en la contracción', maxLength: 100 })
    @Column({ length: 100, nullable: true })
    coach_note?: string;

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

    @OneToMany(() => Circuit, circuit => circuit.routine)
    circuits!: Circuit[];

    @OneToMany(() => RoutineAsignation, routineAsignation => routineAsignation.routine)
    routineAsignations!: RoutineAsignation[];

    @OneToMany(() => RoutineAsignationUser, routineAsignationUser => routineAsignationUser.routine)
    routineAsignationUsers!: RoutineAsignationUser[];
}

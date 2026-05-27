import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Planification } from './planification.entity';
import { Circuit } from './circuit.entity';
import { RoutineAsignation } from './routine_asignation.entity';
import { RoutineAsignationUser } from './routine_asignation_user.entity';

@Entity('Routine')
export class Routine {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'uuid', nullable: true })
    routine_plan_id?: string;

    @Column({ length: 20, nullable: false })
    name!: string;

    @Column({ length: 100, nullable: true })
    coach_note?: string;

    @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    created_at!: Date;

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

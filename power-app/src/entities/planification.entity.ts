import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Routine } from './routine.entity';
import { RoutineAsignation } from './routine_asignation.entity';
import { UserPlanification } from './user_planification.entity';

@Entity('Planification')
export class Planification {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ length: 50, nullable: true })
    name?: string;

    @Column({ type: 'text', nullable: true })
    description?: string;

    @Column({ type: 'integer', nullable: false })
    number_of_routines!: number;

    @Column({ length: 30, nullable: true })
    type?: string;

    @Column({ length: 50, nullable: true })
    duration?: string;

    @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    created_at!: Date;

    @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updated_at!: Date;

    // JOIN RELATIONSHIPS
    @OneToMany(() => Routine, routine => routine.planification)
    routines!: Routine[];

    @OneToMany(() => RoutineAsignation, routineAsignation => routineAsignation.planification)
    routineAsignations!: RoutineAsignation[];

    @OneToMany(() => UserPlanification, userPlanification => userPlanification.planification)
    userPlanifications!: UserPlanification[];
}

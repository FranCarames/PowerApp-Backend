import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Routine } from './routine.entity';
import { Planification } from './planification.entity';
import { RoutineAsignationUser } from './routine_asignation_user.entity';
import { UserRoutine } from './user_routine.entity';

@Entity('Routine_Asignation')
export class RoutineAsignation {
    @ApiProperty({ example: 'uuid-1234' })
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ApiProperty({ example: 'uuid-1234' })
    @Column({ type: 'uuid', nullable: false })
    routine_id!: string;

    @ApiProperty({ example: 'uuid-1234' })
    @Column({ type: 'uuid', nullable: false })
    routine_plan_id!: string;

    @ApiProperty({ example: 1 })
    @Column({ type: 'integer', nullable: false })
    order!: number;

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
    @ManyToOne(() => Routine, routine => routine.routineAsignations, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'routine_id' })
    routine!: Routine;

    @ManyToOne(() => Planification, planification => planification.routineAsignations, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'routine_plan_id' })
    planification!: Planification;

    @OneToMany(() => RoutineAsignationUser, routineAsignationUser => routineAsignationUser.routineAsignation)
    routineAsignationUsers!: RoutineAsignationUser[];

    @OneToMany(() => UserRoutine, userRoutine => userRoutine.routineAsignation)
    userRoutines!: UserRoutine[];
}

import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Routine } from './routine.entity';
import { RoutineAsignation } from './routine_asignation.entity';
import { UserPlanification } from './user_planification.entity';

@Entity('Planification')
export class Planification {
    @ApiProperty({ example: 'uuid-1234' })
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ApiPropertyOptional({ example: 'Plan fuerza 3 días', maxLength: 50 })
    @Column({ length: 50, nullable: true })
    name?: string;

    @ApiPropertyOptional({ example: 'Planificación orientada a fuerza máxima' })
    @Column({ type: 'text', nullable: true })
    description?: string;

    @ApiProperty({ example: 3 })
    @Column({ type: 'integer', nullable: false })
    number_of_routines!: number;

    @ApiPropertyOptional({ example: 'fuerza', maxLength: 30 })
    @Column({ length: 30, nullable: true })
    type?: string;

    @ApiPropertyOptional({ example: '12 semanas', maxLength: 50 })
    @Column({ length: 50, nullable: true })
    duration?: string;

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
    @OneToMany(() => Routine, routine => routine.planification)
    routines!: Routine[];

    @OneToMany(() => RoutineAsignation, routineAsignation => routineAsignation.planification)
    routineAsignations!: RoutineAsignation[];

    @OneToMany(() => UserPlanification, userPlanification => userPlanification.planification)
    userPlanifications!: UserPlanification[];
}

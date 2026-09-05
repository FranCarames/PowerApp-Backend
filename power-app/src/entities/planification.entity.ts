import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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

    // Aceptan null explicito: al editar la planificacion, el entrenador tiene que poder
    // borrar una descripcion que ya no aplica, y TypeORM ignora las propiedades undefined.
    // El type explicito es OBLIGATORIO con la union: TS emite design:type = Object para
    // string | null, y sin el tipo declarado TypeORM no sabe que columna crear.
    // Mismo caso que Routine.coach_note y Circuit.description
    @ApiPropertyOptional({ example: 'Planificación orientada a fuerza máxima' })
    @Column({ type: 'text', nullable: true })
    description?: string | null;

    @ApiProperty({ example: 3 })
    @Column({ type: 'integer', nullable: false })
    number_of_routines!: number;

    @ApiPropertyOptional({ example: 'fuerza', maxLength: 30 })
    @Column({ type: 'varchar', length: 30, nullable: true })
    type?: string | null;

    @ApiPropertyOptional({ example: '12 semanas', maxLength: 50 })
    @Column({ type: 'varchar', length: 50, nullable: true })
    duration?: string | null;

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
    @OneToMany(() => RoutineAsignation, routineAsignation => routineAsignation.planification)
    routineAsignations!: RoutineAsignation[];

    @OneToMany(() => UserPlanification, userPlanification => userPlanification.planification)
    userPlanifications!: UserPlanification[];
}

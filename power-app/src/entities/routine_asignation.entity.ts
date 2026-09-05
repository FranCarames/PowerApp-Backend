import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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
    planification_id!: string;

    // Nullable a proposito: la baja logica le borra la posicion (order = null) y NO se
    // renumera el resto, asi que la secuencia puede tener huecos. Y como el alta persiste
    // el order recibido tal cual, tambien puede tener duplicados: order es una etiqueta
    // de orden, no una secuencia canonica. El desempate lo pone la lectura, por created_at
    @ApiPropertyOptional({ example: 1 })
    @Column({ type: 'integer', nullable: true })
    order?: number | null;

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
    @JoinColumn({ name: 'planification_id' })
    planification!: Planification;

    @OneToMany(() => RoutineAsignationUser, routineAsignationUser => routineAsignationUser.routineAsignation)
    routineAsignationUsers!: RoutineAsignationUser[];

    @OneToMany(() => UserRoutine, userRoutine => userRoutine.routineAsignation)
    userRoutines!: UserRoutine[];
}

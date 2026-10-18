import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Routine } from './routine.entity';
import { Planification } from './planification.entity';

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

    // NOT NULL desde el 17/10 (D10): la baja logica solo apaga active y la rutina CONSERVA su
    // lugar, asi que ya no hay un order nulo que representar. Sigue siendo una etiqueta de
    // orden dentro de la semana, no una secuencia canonica: el alta persiste el order recibido
    // tal cual, asi que puede tener duplicados y huecos. El desempate lo pone la lectura, por
    // created_at
    @ApiProperty({ example: 1, description: 'Posición dentro de la semana. Etiqueta de orden: puede repetirse' })
    @Column({ type: 'integer', nullable: false })
    order!: number;

    // Semana del plan en la que va la rutina: 1..Planification.duration, o sin tope si la
    // duracion es 0. El rango lo valida el service
    @ApiProperty({ example: 1, minimum: 1, description: 'Semana del plan en la que va la rutina' })
    @Column({ type: 'integer', nullable: false })
    week!: number;

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
}

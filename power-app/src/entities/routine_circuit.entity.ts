import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Routine } from './routine.entity';
import { Circuit } from './circuit.entity';

@Entity('Routine_Circuit')
export class RoutineCircuit {
    @ApiProperty({ example: 'uuid-1234' })
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ApiProperty({ example: 'uuid-1234' })
    @Column({ type: 'uuid', nullable: false })
    routine_id!: string;

    @ApiProperty({ example: 'uuid-1234' })
    @Column({ type: 'uuid', nullable: false })
    circuit_id!: string;

    // Nullable a proposito: el order se normaliza a 1..N en cada escritura, asi que un
    // vinculo apagado no ocupa ninguna posicion. Dejarle el numero viejo haria que la
    // columna signifique dos cosas y repitiera posiciones que ya ocupa otro circuito
    @ApiPropertyOptional({ example: 1, description: 'null en los vinculos dados de baja' })
    @Column({ type: 'integer', nullable: true })
    order?: number | null;

    // Baja logica: un circuito que sale de la rutina no se borra, se apaga. Ninguna FK
    // apunta aca, asi que no es para proteger historial: es para conservar la traza de
    // que circuitos integraron la rutina, que es lo que el alumno efectivamente ejecuto
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
    @ManyToOne(() => Routine, routine => routine.routineCircuits, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'routine_id' })
    routine!: Routine;

    @ManyToOne(() => Circuit, circuit => circuit.routineCircuits, { onDelete: 'RESTRICT' })
    @JoinColumn({ name: 'circuit_id' })
    circuit!: Circuit;
}

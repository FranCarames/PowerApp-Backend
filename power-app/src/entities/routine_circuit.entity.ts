import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
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

    @ApiProperty({ example: 1 })
    @Column({ type: 'integer', nullable: false })
    order!: number;

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

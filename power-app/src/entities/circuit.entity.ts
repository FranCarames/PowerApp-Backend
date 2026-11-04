import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RoutineExercise } from './routine_exercise.entity';
import { RoutineCircuit } from './routine_circuit.entity';
import { CircuitType } from './circuit_type.entity';

@Entity('Circuit')
export class Circuit {
    @ApiProperty({ example: 'uuid-1234' })
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ApiProperty({ example: 'Entrada en calor - Tren superior', maxLength: 100 })
    @Column({ length: 100, nullable: false })
    name!: string;

    // Acepta null explicito: al editar el circuito hay que poder vaciar la descripcion,
    // y TypeORM ignora las propiedades en undefined. El type: 'varchar' es obligatorio
    // con la union: TS emite design:type = Object para string | null, y sin el tipo
    // declarado TypeORM no sabe que columna crear
    @ApiPropertyOptional({ example: 'Movilidad de hombro y activación de manguito', maxLength: 100 })
    @Column({ type: 'varchar', length: 100, nullable: true })
    description?: string | null;

    // El tipo dejo de ser texto libre (BE-44): referencia a un Circuit_Type del catalogo. Un
    // circuito conserva su tipo aunque el Admin lo de de baja (D61)
    @ApiProperty({ example: 'uuid-1234' })
    @Column({ type: 'uuid', nullable: false })
    circuit_type_id!: string;

    @ApiProperty({ example: true })
    @Column({ nullable: false, default: true })
    active!: boolean;

    @ApiProperty()
    @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    created_at!: Date;

    @ApiProperty()
    @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    updated_at!: Date;

    // JOIN RELATIONSHIPS
    @OneToMany(() => RoutineExercise, routineExercise => routineExercise.circuit)
    routineExercises!: RoutineExercise[];

    @OneToMany(() => RoutineCircuit, routineCircuit => routineCircuit.circuit)
    routineCircuits!: RoutineCircuit[];

    // RESTRICT: un tipo nunca se borra (D61); si alguien lo intentara a mano, la base lo frena
    @ManyToOne(() => CircuitType, circuitType => circuitType.circuits, { onDelete: 'RESTRICT' })
    @JoinColumn({ name: 'circuit_type_id' })
    circuitType!: CircuitType;
}

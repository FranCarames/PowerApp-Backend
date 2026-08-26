import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RoutineExercise } from './routine_exercise.entity';
import { RoutineCircuit } from './routine_circuit.entity';

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

    @ApiProperty({ example: 'entrada en calor', maxLength: 30 })
    @Column({ length: 30, nullable: false })
    type!: string;

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
    @OneToMany(() => RoutineExercise, routineExercise => routineExercise.circuit)
    routineExercises!: RoutineExercise[];

    @OneToMany(() => RoutineCircuit, routineCircuit => routineCircuit.circuit)
    routineCircuits!: RoutineCircuit[];
}

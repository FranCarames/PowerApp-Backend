import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn, OneToMany } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Circuit } from './circuit.entity';

// Catalogo cerrado de tipos de circuito (BE-44, CU-A-24 a CU-A-27). Lo administra el Admin y el
// Entrenador elige uno al armar cada circuito. Sin borrado fisico: baja logica y reactivar (D61).
// El nombre es unico sin mayusculas ni espacios de los bordes, contra activos e inactivos: lo
// controla el service, no la base (decision del 12/10)
@Entity('Circuit_Type')
export class CircuitType {
    @ApiProperty({ example: 'uuid-1234' })
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ApiProperty({ example: 'Principal', maxLength: 50 })
    @Column({ length: 50, nullable: false })
    type!: string;

    // Acepta null explicito: la edicion pisa la descripcion y no mandarla la borra, y TypeORM
    // ignora las propiedades en undefined. El type: 'varchar' es obligatorio con la union (como en
    // Circuit.description): TS emite design:type = Object para string | null
    @ApiPropertyOptional({ example: 'El bloque central de la sesión', maxLength: 100, nullable: true, type: String })
    @Column({ type: 'varchar', length: 100, nullable: true })
    description?: string | null;

    @ApiProperty({ example: true, description: 'Baja lógica: true = se ofrece para circuitos nuevos, false = dado de baja' })
    @Column({ nullable: false, default: true })
    active!: boolean;

    @ApiProperty()
    @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    created_at!: Date;

    @ApiProperty()
    @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    updated_at!: Date;

    // JOIN RELATIONSHIPS
    @OneToMany(() => Circuit, circuit => circuit.circuitType)
    circuits!: Circuit[];
}

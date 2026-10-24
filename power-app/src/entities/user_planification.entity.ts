import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { User } from './user.entity';
import { Coach } from './coach.entity';
import { Planification } from './planification.entity';

// Una planificacion asignada a un alumno. La cabecera del plan (nombre, descripcion, tipo,
// duracion) y sus rutinas se leen siempre de la plantilla: aca va solo lo propio de la
// asignacion (D18, 20/10)
@Entity('User_Planification')
export class UserPlanification {
    @ApiProperty({ example: 'uuid-1234' })
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ApiProperty({ example: 'uuid-1234' })
    @Column({ type: 'uuid', nullable: false })
    user_id!: string;

    // El coach que asigno: sale del token, y solo un coach asigna (D20). NOT NULL desde el
    // 20/10 (D19)
    @ApiProperty({ example: 'uuid-1234' })
    @Column({ type: 'uuid', nullable: false })
    coach_id!: string;

    // NOT NULL desde el 20/10 (D19): sin plantilla no hay rutinas ni nombre
    @ApiProperty({ example: 'uuid-1234' })
    @Column({ type: 'uuid', nullable: false })
    planification_id!: string;

    @ApiPropertyOptional({ example: 'Foco en técnica', maxLength: 100 })
    @Column({ length: 100, nullable: true })
    coach_note?: string;

    // Dias sin hora. Las columnas son date y TypeORM las hidrata como 'YYYY-MM-DD' (string), no
    // como Date: se tipan string para que el tipo diga lo que de verdad llega. La semana 1 del
    // plan es la de lunes a domingo que contiene start_date (D16)
    @ApiProperty({ example: '2026-10-22', description: 'Día de inicio (YYYY-MM-DD, sin hora)' })
    @Column({ type: 'date', nullable: false })
    start_date!: string;

    // Guardado desde el 20/10 (D17; antes se calculaba en vivo): en E-13 es opcional y por defecto
    // es el domingo de la semana Planification.duration. Editar la duracion de la plantilla NO lo mueve
    @ApiProperty({ example: '2026-11-15', description: 'Día de fin, inclusive (YYYY-MM-DD, sin hora)' })
    @Column({ type: 'date', nullable: false })
    end_date!: string;

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
    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user!: User;

    // RESTRICT en las dos (D19): las bajas de coach (A-19) y de plantilla (E-11) son logicas,
    // asi que nunca se dispara. Respalda desde la base que la asignacion tenga coach y plantilla
    @ManyToOne(() => Coach, { onDelete: 'RESTRICT' })
    @JoinColumn({ name: 'coach_id' })
    coach!: Coach;

    @ManyToOne(() => Planification, planification => planification.userPlanifications, { onDelete: 'RESTRICT' })
    @JoinColumn({ name: 'planification_id' })
    planification!: Planification;
}

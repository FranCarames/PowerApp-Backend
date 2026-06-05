import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { User } from './user.entity';
import { Coach } from './coach.entity';
import { Planification } from './planification.entity';

@Entity('User_Planification')
export class UserPlanification {
    @ApiProperty({ example: 'uuid-1234' })
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ApiProperty({ example: 'uuid-1234' })
    @Column({ type: 'uuid', nullable: false })
    user_id!: string;

    @ApiPropertyOptional({ example: 'uuid-1234' })
    @Column({ type: 'uuid', nullable: true })
    coach_id?: string;

    @ApiPropertyOptional({ example: 'uuid-1234' })
    @Column({ type: 'uuid', nullable: true })
    planification_id?: string;

    @ApiPropertyOptional({ example: 'Plan personalizado para el alumno' })
    @Column({ type: 'text', nullable: true })
    description?: string;

    @ApiPropertyOptional({ example: 3 })
    @Column({ type: 'integer', nullable: true })
    number_of_routines?: number;

    @ApiPropertyOptional({ example: 'fuerza', maxLength: 30 })
    @Column({ length: 30, nullable: true })
    type?: string;

    @ApiPropertyOptional({ example: 'Foco en técnica', maxLength: 100 })
    @Column({ length: 100, nullable: true })
    coach_note?: string;

    @ApiPropertyOptional({ example: '8 semanas', maxLength: 50 })
    @Column({ length: 50, nullable: true })
    duration?: string;

    @ApiProperty({ example: '2024-01-01' })
    @Column({ type: 'date', nullable: false })
    start_date!: Date;

    @ApiProperty({ example: '2024-03-01' })
    @Column({ type: 'date', nullable: false })
    end_date!: Date;

    @ApiProperty()
    @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    created_at!: Date;

    @ApiProperty()
    @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updated_at!: Date;

    // JOIN RELATIONSHIPS
    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user!: User;

    @ManyToOne(() => Coach, { onDelete: 'SET NULL', nullable: true })
    @JoinColumn({ name: 'coach_id' })
    coach?: Coach;

    @ManyToOne(() => Planification, planification => planification.userPlanifications, { onDelete: 'SET NULL', nullable: true })
    @JoinColumn({ name: 'planification_id' })
    planification?: Planification;
}

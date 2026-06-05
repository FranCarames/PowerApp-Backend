import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from './user.entity';
import { Exercise } from './exercise.entity';

@Entity('User_RM')
export class UserRM {
    @ApiProperty({ example: 'uuid-1234' })
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ApiProperty({ example: 'uuid-1234' })
    @Column({ type: 'uuid', nullable: false })
    user_id!: string;

    @ApiProperty({ example: 'uuid-1234' })
    @Column({ type: 'uuid', nullable: false })
    exercise_id!: string;

    @ApiProperty({ example: 100.5 })
    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
    weight!: number;

    @ApiProperty({ example: 5 })
    @Column({ type: 'int', nullable: false })
    reps!: number;

    @ApiProperty({ example: '2024-01-15' })
    @Column({ type: 'date', nullable: false })
    date!: Date;

    @ApiProperty()
    @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    created_at!: Date;

    @ApiProperty()
    @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updated_at!: Date;

    // JOIN RELATIONSHIPS
    @ManyToOne(() => User, user => user.userRMs)
    @JoinColumn({ name: 'user_id' })
    user!: User;

    @ManyToOne(() => Exercise, exercise => exercise.userRMs)
    @JoinColumn({ name: 'exercise_id' })
    exercise!: Exercise;
}

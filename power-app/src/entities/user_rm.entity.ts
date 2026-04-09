import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Exercise } from './exercise.entity';

@Entity()
export class UserRM {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid', nullable: false })
    user_id: string;

    @Column({ type: 'uuid', nullable: false })
    exercise_id: string;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
    weight: number;

    @Column({ type: 'int', nullable: false })
    reps: number;

    @Column({ type: 'date', nullable: false })
    date: Date;

    @Column({ type: 'datetime', nullable: false })
    created_at: Date;

    @Column({ type: 'datetime', nullable: false })
    updated_at: Date;

    // JOIN RELATIONSHIPS
    @ManyToOne(() => User, user => user.userRMs)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ManyToOne(() => Exercise, exercise => exercise.userRMs)
    @JoinColumn({ name: 'exercise_id' })
    exercise: Exercise;
}
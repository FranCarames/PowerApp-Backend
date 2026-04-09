import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class BodyWeight {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid', nullable: false })
    user_id: string;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
    weight: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    fat_perc: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    muscle_perc: number;

    @Column({ type: 'datetime', nullable: false })
    created_at: Date;

    @Column({ type: 'datetime', nullable: false })
    updated_at: Date;

    // JOIN RELATIONSHIPS
    @ManyToOne(() => User, user => user.bodyWeights)
    @JoinColumn({ name: 'user_id' })
    user: User;
}
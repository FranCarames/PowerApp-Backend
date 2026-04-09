import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class UserCron {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid', nullable: false })
    user_id: string;

    @Column({ length: 20, nullable: true })
    name: string;

    @Column({ type: 'int', nullable: false })
    duration: number;

    @Column({ type: 'datetime', nullable: false })
    created_at: Date;

    @Column({ type: 'datetime', nullable: false })
    updated_at: Date;

    // JOIN RELATIONSHIPS
    @ManyToOne(() => User, user => user.userCrons)
    @JoinColumn({ name: 'user_id' })
    user: User;
}
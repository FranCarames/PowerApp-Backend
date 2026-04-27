import { Entity, PrimaryColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('Coach')
export class Coach {
    @PrimaryColumn({ type: 'uuid' })
    id!: string;

    @Column({ length: 50, nullable: false, unique: true })
    coach_email!: string;

    @Column({ length: 20, nullable: false })
    cuil!: string;

    @Column({ nullable: false, default: true })
    active!: boolean;
    
    @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    created_at!: Date;

    @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updated_at!: Date;

    // JOIN RELATIONSHIPS
    @OneToOne(() => User, user => user.coach)
    @JoinColumn({ name: 'id' })
    user!: User;
}
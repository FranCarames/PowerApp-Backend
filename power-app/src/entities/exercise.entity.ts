import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn  } from 'typeorm';
import { UserRM } from './ParaValidar/user_rm.entity';

@Entity()
export class Exercise {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'uuid', nullable: true })
    category_id?: string;

    @Column({ length: 50, nullable: false })
    name!: string;

    @Column({ type: 'text', nullable: false })
    description!: string;

    @Column({ length: 500, nullable: true })
    safety_tips?: string;

    @Column({ length: 500, nullable: true })
    activation_tips?: string;

    @Column({ length: 150, nullable: true })
    video_url?: string;

    @Column({ length: 150, nullable: true })
    preview_image?: string;

    @Column({ length: 150, nullable: true })
    bg_image?: string;

    @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    created_at!: Date;

    @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updated_at!: Date;

    // JOIN RELATIONSHIPS
    // @OneToMany(() => UserRM, userRM => userRM.exercise)
    // userRMs: UserRM[];
}

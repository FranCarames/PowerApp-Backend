import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn  } from 'typeorm';
import { UserRM } from './user_rm.entity';
import { ExercisedMuscle } from './exercised_muscle.entity';

@Entity('Exercise')
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
    @OneToMany(() => UserRM, userRM => userRM.exercise)
    userRMs!: UserRM[];

    @OneToMany(() => ExercisedMuscle, exercisedMuscle => exercisedMuscle.exercise, { 
        cascade: true,
        eager: false   // Recomendado: no cargar automáticamente todos los músculos
    })
    exercisedMuscles!: ExercisedMuscle[];
}

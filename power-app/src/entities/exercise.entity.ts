import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn  } from 'typeorm';
import { FavoriteExercise } from './ParaValidar/favorite_exercise.entity';
import { UserRM } from './ParaValidar/user_rm.entity';
import { ExerciseCategory } from './ParaValidar/exercise_category.entity';

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
    // @ManyToOne(() => ExerciseCategory, category => category.exercises)
    // @JoinColumn({ name: 'category_id' })
    // exerciseCategory: ExerciseCategory;
    
    // @OneToMany(() => UserRM, userRM => userRM.exercise)
    // userRMs: UserRM[];

    // @OneToMany(() => FavoriteExercise, favoriteExercise => favoriteExercise.user)
    // favoriteExercises: FavoriteExercise[];
}

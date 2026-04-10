import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../user.entity';
import { Exercise } from '../exercise.entity';

@Entity()
export class FavoriteExercise {
    // @PrimaryGeneratedColumn('uuid')
    // id: string;

    // @Column({ type: 'uuid', nullable: false })
    // user_id: string;

    // @Column({ type: 'uuid', nullable: false })
    // exercise_id: string;

    // @Column({ type: 'datetime', nullable: false })
    // created_at: Date;

    // @Column({ type: 'datetime', nullable: false })
    // updated_at: Date;

    // // JOIN RELATIONSHIPS
    // @ManyToOne(() => User, user => user.favoriteExercises)
    // @JoinColumn({ name: 'user_id' })
    // user: User;

    // @ManyToOne(() => Exercise, exercise => exercise.favoriteExercises)
    // @JoinColumn({ name: 'exercise_id' })
    // exercise: Exercise;
}
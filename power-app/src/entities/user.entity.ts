import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { BodyWeight } from './body_weight.entity';
import { FavoriteExercise } from './favorite_exercise.entity';
import { UserCron } from './user_cron.entity';
import { UserRM } from './user_rm.entity';

@Entity()
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ length: 50, nullable: false })
    first_name: string;

    @Column({ length: 50, nullable: false })
    last_name: string;

    @Column({ length: 50, nullable: false, unique: true })
    email: string;

    @Column({ nullable: false })
    email_verified: boolean;

    @Column({ length: 255, nullable: false })
    password: string;

    @Column({ length: 20, nullable: false })
    role: string;

    @Column({ length: 150, nullable: true })
    profile_picture: string;

    @Column({ length: 10, nullable: true })
    phone_prefix: string;

    @Column({ length: 20, nullable: true })
    phone_number: string;

    @Column({ nullable: false })
    phone_verified: boolean;

    @Column({ type: 'datetime', nullable: false })
    created_at: Date;

    @Column({ type: 'datetime', nullable: false })
    updated_at: Date;

    // JOIN RELATIONSHIPS
    @OneToMany(() => BodyWeight, bodyWeight => bodyWeight.user)
    bodyWeights: BodyWeight[];

    @OneToMany(() => FavoriteExercise, favoriteExercise => favoriteExercise.user)
    favoriteExercises: FavoriteExercise[];

    @OneToMany(() => UserCron, userCron => userCron.user)
    userCrons: UserCron[];

    @OneToMany(() => UserRM, userRM => userRM.user)
    userRMs: UserRM[];
}
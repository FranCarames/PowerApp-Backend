import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Exercise } from '../exercise.entity';

@Entity()
export class ExerciseCategory {
    // @PrimaryGeneratedColumn('uuid')
    // id: string;

    // @Column({ length: 50, nullable: false })
    // name: string;

    // @Column({ type: 'text', nullable: false })
    // description: string;

    // @Column({ length: 150, nullable: true })
    // icon: string;

    // @Column({ type: 'datetime', nullable: false })
    // created_at: Date;

    // @Column({ type: 'datetime', nullable: false })
    // updated_at: Date;

    // @OneToMany(() => Exercise, exercise => exercise.exerciseCategory)
    // exercises: Exercise[];
}
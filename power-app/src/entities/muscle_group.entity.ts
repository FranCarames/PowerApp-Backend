import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Muscle } from './muscle.entity';

@Entity()
export class MuscleGroup {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ length: 50, nullable: false })
    name: string;

    @Column({ length: 150, nullable: true })
    image_url: string;

    @Column({ length: 150, nullable: true })
    preview_image: string;

    @Column({ type: 'datetime', nullable: false })
    created_at: Date;

    @Column({ type: 'datetime', nullable: false })
    updated_at: Date;

    // JOIN RELATIONSHIPS
    @OneToMany(() => Muscle, muscle => muscle.muscle_group)
    muscles: Muscle[];
}
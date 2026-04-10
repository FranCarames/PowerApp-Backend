import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Muscle } from './muscle.entity';

@Entity('Muscle_Group')
export class MuscleGroup {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ length: 50, nullable: false })
    name!: string;

    @Column({ length: 150, nullable: true })
    image_url?: string;

    @Column({ length: 150, nullable: true })
    preview_image?: string;

    @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    created_at!: Date;

    @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updated_at!: Date;

    // JOIN RELATIONSHIPS
    @OneToMany(() => Muscle, muscle => muscle.muscle_group)
    muscles!: Muscle[];
}
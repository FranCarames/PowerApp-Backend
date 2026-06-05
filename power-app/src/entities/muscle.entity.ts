import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MuscleGroup } from './muscle_group.entity';
import { ExercisedMuscle } from './exercised_muscle.entity';

@Entity('Muscle')
export class Muscle {
    @ApiProperty({ example: 'uuid-1234' })
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ApiProperty({ example: 'uuid-1234' })
    @Column({ type: 'uuid', nullable: false })
    muscle_group_id!: string;

    @ApiProperty({ example: 'Pectoral mayor', maxLength: 50 })
    @Column({ length: 50, nullable: false })
    name!: string;

    @ApiPropertyOptional({ example: 'Músculo principal del pecho' })
    @Column({ type: 'text', nullable: true })
    description?: string;

    @ApiPropertyOptional({ example: 'https://...', maxLength: 150 })
    @Column({ length: 150, nullable: true })
    image_url?: string;

    @ApiPropertyOptional({ example: 'https://...', maxLength: 150 })
    @Column({ length: 150, nullable: true })
    preview_image?: string;

    @ApiProperty()
    @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    created_at!: Date;

    @ApiProperty()
    @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updated_at!: Date;

    // JOIN RELATIONSHIPS
    @ManyToOne(() => MuscleGroup, muscleGroup => muscleGroup.muscles)
    @JoinColumn({ name: 'muscle_group_id' })
    muscle_group!: MuscleGroup;

    @OneToMany(() => ExercisedMuscle, exercisedMuscle => exercisedMuscle.muscle, { cascade: true })
    exercisedMuscles!: ExercisedMuscle[];
}

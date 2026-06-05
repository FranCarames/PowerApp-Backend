import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn  } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRM } from './user_rm.entity';
import { ExercisedMuscle } from './exercised_muscle.entity';

@Entity('Exercise')
export class Exercise {
    @ApiProperty({ example: 'uuid-1234' })
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ApiProperty({ example: 'Press de banca', maxLength: 50 })
    @Column({ length: 50, nullable: false })
    name!: string;

    @ApiProperty({ example: 'Ejercicio para el pecho...', maxLength: 2000 })
    @Column({ length: 2000, nullable: false })
    description!: string;

    @ApiPropertyOptional({ example: 'Mantener los codos a 45°', maxLength: 500 })
    @Column({ length: 500, nullable: true })
    safety_tips?: string;

    @ApiPropertyOptional({ example: 'Apretar el pecho al subir', maxLength: 500 })
    @Column({ length: 500, nullable: true })
    activation_tips?: string;

    @ApiPropertyOptional({ example: 'https://...', maxLength: 150 })
    @Column({ length: 150, nullable: true })
    video_url?: string;

    @ApiPropertyOptional({ example: 'https://...', maxLength: 150 })
    @Column({ length: 150, nullable: true })
    preview_image?: string;

    @ApiPropertyOptional({ example: 'https://...', maxLength: 150 })
    @Column({ length: 150, nullable: true })
    bg_image?: string;

    @ApiProperty()
    @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    created_at!: Date;

    @ApiProperty()
    @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updated_at!: Date;

    // JOIN RELATIONSHIPS
    @OneToMany(() => UserRM, userRM => userRM.exercise)
    userRMs!: UserRM[];

    @OneToMany(() => ExercisedMuscle, exercisedMuscle => exercisedMuscle.exercise, {
        cascade: true,
        eager: false,
    })
    exercisedMuscles!: ExercisedMuscle[];
}

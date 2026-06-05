import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Muscle } from './muscle.entity';

@Entity('Muscle_Group')
export class MuscleGroup {
    @ApiProperty({ example: 'uuid-1234' })
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ApiProperty({ example: 'Pecho', maxLength: 50 })
    @Column({ length: 50, nullable: false })
    name!: string;

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
    @OneToMany(() => Muscle, muscle => muscle.muscle_group)
    muscles!: Muscle[];
}

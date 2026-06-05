import { Entity, PrimaryColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from './user.entity';

@Entity('Coach')
export class Coach {
    @ApiProperty({ example: 'uuid-1234' })
    @PrimaryColumn({ type: 'uuid' })
    id!: string;

    @ApiProperty({ example: 'coach@example.com', maxLength: 50 })
    @Column({ length: 50, nullable: false, unique: true })
    coach_email!: string;

    @ApiProperty({ example: '20-12345678-9', maxLength: 20 })
    @Column({ length: 20, nullable: false })
    cuil!: string;

    @ApiProperty({ example: true })
    @Column({ nullable: false, default: true })
    active!: boolean;

    @ApiProperty()
    @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    created_at!: Date;

    @ApiProperty()
    @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updated_at!: Date;

    // JOIN RELATIONSHIPS
    @OneToOne(() => User, user => user.coach)
    @JoinColumn({ name: 'id' })
    user!: User;
}

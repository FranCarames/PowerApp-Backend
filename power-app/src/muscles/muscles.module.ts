import { Module } from '@nestjs/common';
import { MusclesController } from './muscles.controller';
import { MusclesService } from './muscles.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Muscle } from '../entities/muscle.entity';
import { MuscleGroup } from '../entities/muscle_group.entity';
import { AuthModule } from '../authentication/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Muscle, MuscleGroup]), AuthModule],
  controllers: [MusclesController],
  providers: [MusclesService]
})
export class MusclesModule {}
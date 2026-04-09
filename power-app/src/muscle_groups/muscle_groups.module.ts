import { Module } from '@nestjs/common';
import { MuscleGroupsController } from './muscle_groups.controller';
import { MuscleGroupsService } from './muscle_groups.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MuscleGroup } from 'src/entities/muscle_group.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MuscleGroup])],
  controllers: [MuscleGroupsController],
  providers: [MuscleGroupsService]
})
export class MuscleGroupsModule {}

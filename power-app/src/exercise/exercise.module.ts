import { Module } from '@nestjs/common';
import { ExerciseController } from './exercise.controller';
import { ExerciseService } from './exercise.service';

import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';
import { Exercise } from '../entities/exercise.entity';
import { ExercisedMuscle } from '../entities/exercised_muscle.entity';
import { Muscle } from '../entities/muscle.entity';
import { MuscleGroup } from '../entities/muscle_group.entity';
import { MusclesService } from '../muscles/muscles.service';

@Module({
  imports: [TypeOrmModule.forFeature([Exercise, ExercisedMuscle, Muscle, MuscleGroup])],
  controllers: [ExerciseController],
  providers: [ExerciseService, MusclesService]
})
export class ExerciseModule {}

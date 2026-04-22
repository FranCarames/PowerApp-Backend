import { Module } from '@nestjs/common';
import { ExerciseController } from './exercise.controller';
import { ExerciseService } from './exercise.service';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';
import { Exercise } from '../entities/exercise.entity';
import { ExercisedMuscle } from '../entities/exercised_muscle.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Exercise, ExercisedMuscle])],
  controllers: [ExerciseController],
  providers: [ExerciseService]
})
export class ExerciseModule {}

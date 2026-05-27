import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoutineController } from './routine.controller';
import { RoutineService } from './routine.service';
import { Routine } from '../entities/routine.entity';
import { Circuit } from '../entities/circuit.entity';
import { RoutineExercise } from '../entities/routine_exercise.entity';
import { ExerciseSet } from '../entities/exercise_set.entity';

@Module({
  imports: [TypeOrmModule.forFeature([
    Routine,
    Circuit,
    RoutineExercise,
    ExerciseSet,
  ])],
  controllers: [RoutineController],
  providers: [RoutineService]
})
export class RoutineModule {}

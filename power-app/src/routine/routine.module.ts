import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoutineController } from './routine.controller';
import { RoutineService } from './routine.service';
import { Routine } from '../entities/routine.entity';
import { Circuit } from '../entities/circuit.entity';
import { RoutineCircuit } from '../entities/routine_circuit.entity';
import { RoutineExercise } from '../entities/routine_exercise.entity';
import { ExerciseSet } from '../entities/exercise_set.entity';
import { RoutineExerciseSetFinished } from '../entities/routine_exercise_set_finished.entity';
import { UserRoutine } from '../entities/user_routine.entity';
import { AuthModule } from '../authentication/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([
    Routine,
    Circuit,
    RoutineCircuit,
    RoutineExercise,
    ExerciseSet,
    RoutineExerciseSetFinished,
    UserRoutine,
  ]), AuthModule],
  controllers: [RoutineController],
  providers: [RoutineService]
})
export class RoutineModule {}

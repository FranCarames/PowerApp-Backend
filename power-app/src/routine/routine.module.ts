import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoutineController } from './routine.controller';
import { RoutineService } from './routine.service';
import { Routine } from '../entities/routine.entity';
import { Circuit } from '../entities/circuit.entity';
import { RoutineCircuit } from '../entities/routine_circuit.entity';
import { RoutineExercise } from '../entities/routine_exercise.entity';
import { ExerciseSet } from '../entities/exercise_set.entity';
import { RoutineExerciseFinished } from '../entities/routine_exercise_finished.entity';
import { RoutineAsignExerciseFinished } from '../entities/routine_asign_exercise_finished.entity';
import { RoutineAsignationUser } from '../entities/routine_asignation_user.entity';
import { UserPlanification } from '../entities/user_planification.entity';
import { RoutineAsignation } from '../entities/routine_asignation.entity';
import { User } from '../entities/user.entity';
import { AuthModule } from '../authentication/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([
    Routine,
    Circuit,
    RoutineCircuit,
    RoutineExercise,
    ExerciseSet,
    RoutineExerciseFinished,
    RoutineAsignExerciseFinished,
    RoutineAsignationUser,
    UserPlanification,
    RoutineAsignation,
    User,
  ]), AuthModule],
  controllers: [RoutineController],
  providers: [RoutineService]
})
export class RoutineModule {}

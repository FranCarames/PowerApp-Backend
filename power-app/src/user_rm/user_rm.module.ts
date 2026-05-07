import { Module } from '@nestjs/common';
import { UserRmService } from './user_rm.service';
import { UserRmController } from './user_rm.controller';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';
import { UserRM } from '../entities/user_rm.entity';
import { User } from '../entities/user.entity';
import { Exercise } from '../entities/exercise.entity';
import { ExercisedMuscle } from '../entities/exercised_muscle.entity';
import { Muscle } from '../entities/muscle.entity';
import { MuscleGroup } from '../entities/muscle_group.entity';
import { UsersService } from '../users/users.service';
import { AuthService } from '../authentication/auth.service';
import { ExerciseService } from '../exercise/exercise.service';
import { MusclesService } from '../muscles/muscles.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserRM, User, Exercise, ExercisedMuscle, Muscle, MuscleGroup])],
  providers: [UserRmService, UsersService, AuthService, ExerciseService, MusclesService],
  controllers: [UserRmController]
})
export class UserRmModule {}

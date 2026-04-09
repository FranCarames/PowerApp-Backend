import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities imports
import { BodyWeight } from './entities/body_weight.entity';
import { ExerciseCategory } from './entities/exercise_category.entity';
import { Exercise } from './entities/exercise.entity';
import { ExercisedMuscle } from './entities/exercised_muscle.entity';
import { FavoriteExercise } from './entities/favorite_exercise.entity';
import { MuscleGroup } from './entities/muscle_group.entity';
import { Muscle } from './entities/muscle.entity';
import { SystemCron } from './entities/system_cron.entity';
import { UserCron } from './entities/user_cron.entity';
import { UserRM } from './entities/user_rm.entity';
import { User } from './entities/user.entity';

import { AuthenticationModule } from './authentication/authetication.module';
import { ExerciseModule } from './exercise/exercise.module';
import { UserRmModule } from './user_rm/user_rm.module';
import { UsersModule } from './users/users.module';
import { MusclesModule } from './muscles/muscles.module';
import { MuscleGroupsModule } from './muscle_groups/muscle_groups.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mssql',
        host: 'COMPU-DE-FRAN',
        port: 1433,
        username: 'sa',
        password: 'Admin123!',
        database: 'PowerAppDb',
        entities: [BodyWeight, ExerciseCategory, Exercise, ExercisedMuscle, FavoriteExercise, MuscleGroup, Muscle, SystemCron, UserCron, UserRM, User],
        synchronize: false,
        options: {
          instanceName: 'SQLEXPRESS',  // Maneja la instancia nombrada
          trustServerCertificate: true,  // Útil para certificados self-signed en dev local
          encrypt: false,  // Desactiva si no usas SSL (común en local)
        },
      }),
      inject: [ConfigService],
    }),
    AuthenticationModule, 
    ExerciseModule, 
    UserRmModule, 
    UsersModule, 
    MusclesModule, 
    MuscleGroupsModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
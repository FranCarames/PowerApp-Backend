import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities imports
import { User } from './entities/user.entity';
import { UserRM } from './entities/user_rm.entity';
import { Exercise } from './entities/exercise.entity';
import { ExercisedMuscle } from './entities/exercised_muscle.entity';
import { MuscleGroup } from './entities/muscle_group.entity';
import { Muscle } from './entities/muscle.entity';
import { SystemCron } from './entities/ParaValidar/system_cron.entity';
import { UserCron } from './entities/ParaValidar/user_cron.entity';


import { UsersModule } from './users/users.module';
import { AuthenticationModule } from './authentication/authetication.module';
import { ExerciseModule } from './exercise/exercise.module';
import { UserRmModule } from './user_rm/user_rm.module';
import { MusclesModule } from './muscles/muscles.module';
import { MuscleGroupsModule } from './muscle_groups/muscle_groups.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('POSTGRES_HOST'),
        port: configService.get<number>('POSTGRES_PORT'),
        username: configService.get<string>('POSTGRES_USER'),
        password: configService.get<string>('POSTGRES_PASSWORD'),
        database: configService.get<string>('POSTGRES_DB'),
        entities: [User, UserRM, Muscle, MuscleGroup, Exercise, ExercisedMuscle],
        ssl: {
          rejectUnauthorized: false,
        },
        logging: true,                 
        synchronize: true, // Solo en desarrollo! (cuidado en producción)
        autoLoadEntities: true, // Muy útil en NestJS + TypeORM
      }),
      inject: [ConfigService],
    }),
    // TypeOrmModule.forRootAsync({
    //   imports: [ConfigModule],
    //   useFactory: (configService: ConfigService) => ({
    //     type: 'mssql',
    //     host: 'COMPU-DE-FRAN',
    //     port: 1433,
    //     username: 'sa',
    //     password: 'Admin123!',
    //     database: 'PowerAppDb',
    //     entities: [Exercise, ExercisedMuscle, MuscleGroup, Muscle, SystemCron, UserCron, UserRM, User],
    //     synchronize: false,
    //     options: {
    //       instanceName: 'SQLEXPRESS',  // Maneja la instancia nombrada
    //       trustServerCertificate: true,  // Útil para certificados self-signed en dev local
    //       encrypt: false,  // Desactiva si no usas SSL (común en local)
    //     },
    //   }),
    //   inject: [ConfigService],
    // }),
    // AuthenticationModule, 
    // ExerciseModule, 
    // UserRmModule, 
    UsersModule, 
    // MusclesModule, 
    // MuscleGroupsModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
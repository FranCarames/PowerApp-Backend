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
      name: 'postgresql',
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: "dpg-d7bf5geuk2gs738pg1cg-a.virginia-postgres.render.com",//configService.get<string>('POSTGRES_HOST'),
        port: 5432,//configService.get<number>('POSTGRES_PORT'),
        username: "power_app_user",//configService.get<string>('POSTGRES_USER'),
        password: "bXeRFcp8tYKWY8ZyEFQJ43vYA9cajrul",//configService.get<string>('POSTGRES_PASSWORD'),
        database: "powerappdb",//configService.get<string>('POSTGRES_DB'),
        // entities: [Estudiante, Libro, Reserva],
        // synchronize: true,

        ssl: {
          rejectUnauthorized: false,   // Necesario porque Render usa certificados que Node no verifica por defecto
        },

        // Opcional pero recomendado:
        logging: true,                 // Para ver las consultas y posibles errores
        synchronize: true,             // Solo en desarrollo! (cuidado en producción)
        autoLoadEntities: true,        // Muy útil en NestJS + TypeORM
      }),
      inject: [ConfigService],
    }),


    // TypeOrmModule.forRootAsync({
    //   name: 'postgresql',
    //   imports: [ConfigModule],
    //   useFactory: (configService: ConfigService) => ({
    //     type: 'postgres',
    //     host: "postgresql://power_app_user:bXeRFcp8tYKWY8ZyEFQJ43vYA9cajrul@dpg-d7bf5geuk2gs738pg1cg-a/powerappdb",
    //     port: 5432,
    //     username: "power_app_user",
    //     password: "bXeRFcp8tYKWY8ZyEFQJ43vYA9cajrul",
    //     database: "powerappdb",
    //     // entities: [Estudiante, Libro, Reserva],
    //     synchronize: true,
    //   }),
    //   inject: [ConfigService],
    // }),
    // TypeOrmModule.forRootAsync({
    //   imports: [ConfigModule],
    //   useFactory: (configService: ConfigService) => ({
    //     type: 'mssql',
    //     host: 'COMPU-DE-FRAN',
    //     port: 1433,
    //     username: 'sa',
    //     password: 'Admin123!',
    //     database: 'PowerAppDb',
    //     entities: [BodyWeight, ExerciseCategory, Exercise, ExercisedMuscle, FavoriteExercise, MuscleGroup, Muscle, SystemCron, UserCron, UserRM, User],
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
    // UsersModule, 
    // MusclesModule, 
    // MuscleGroupsModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
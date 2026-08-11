import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt/dist/jwt.module';

import { UsersModule } from './users/users.module';
import { MembershipModule } from './membership/membership.module';
import { CoachModule } from './coach/coach.module';
import { MusclesModule } from './muscles/muscles.module';
import { ExerciseModule } from './exercise/exercise.module';
import { PlanificationModule } from './planification/planification.module';
import { RoutineModule } from './routine/routine.module';
import { UserRmModule } from './user_rm/user_rm.module';

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
        ssl: {
          rejectUnauthorized: false,
        },
        logging: true,
        autoLoadEntities: true, // Muy útil en NestJS + TypeORM
      }),
      inject: [ConfigService],
    }),
    JwtModule.registerAsync({
      global: true,                            
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { 
          expiresIn: '365d',
        },
      }),
      inject: [ConfigService],
    }),
    UsersModule, 
    MembershipModule,
    CoachModule,
    MusclesModule,
    ExerciseModule,
    PlanificationModule,
    RoutineModule,
    UserRmModule    
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
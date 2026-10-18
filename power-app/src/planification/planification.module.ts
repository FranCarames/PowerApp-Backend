import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlanificationController } from './planification.controller';
import { PlanificationService } from './planification.service';
import { Planification } from '../entities/planification.entity';
import { Routine } from '../entities/routine.entity';
import { RoutineAsignation } from '../entities/routine_asignation.entity';
import { UserPlanification } from '../entities/user_planification.entity';
import { RoutineAsignationUser } from '../entities/routine_asignation_user.entity';
import { AuthModule } from '../authentication/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([
    Planification,
    Routine,
    RoutineAsignation,
    UserPlanification,
    RoutineAsignationUser,
  ]), AuthModule],
  controllers: [PlanificationController],
  providers: [PlanificationService]
})
export class PlanificationModule {}

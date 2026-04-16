import { Module } from '@nestjs/common';
import { PlanificationController } from './planification.controller';
import { PlanificationService } from './planification.service';

@Module({
  controllers: [PlanificationController],
  providers: [PlanificationService]
})
export class PlanificationModule {}

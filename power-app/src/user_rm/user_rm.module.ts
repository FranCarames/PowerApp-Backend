import { Module } from '@nestjs/common';
import { UserRmService } from './user_rm.service';
import { UserRmController } from './user_rm.controller';

@Module({
  providers: [UserRmService],
  controllers: [UserRmController]
})
export class UserRmModule {}

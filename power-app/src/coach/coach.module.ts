import { Module } from '@nestjs/common';
import { CoachController } from './coach.controller';
import { CoachService } from './coach.service';

import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';
import { Coach } from '../entities/coach.entity';
import { User } from '../entities/user.entity';
import { UsersService } from '../users/users.service';
import { AuthModule } from '../authentication/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Coach, User]), AuthModule],
  controllers: [CoachController],
  providers: [CoachService, UsersService]
})
export class CoachModule {}

import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { MuscleGroupsService } from './muscle_groups.service';

@Controller('muscle-groups')
export class MuscleGroupsController {
    constructor(private muscleGroupsService: MuscleGroupsService) { }

    @Get('/all')
    async getAllMuscleGroups(
        @Res() res: Response
    ) {
        this.muscleGroupsService.getAllMuscleGroups(res);
    }
}

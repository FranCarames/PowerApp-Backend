import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Res,
} from '@nestjs/common';
import { MusclesService } from './muscles.service';
import { Response } from 'express';
import { ParameterIdDto } from '../dtos/parameter_id.dto';
import { CreateMuscleGroupDto } from '../dtos/muscle_groups/create_muscle_group.dto';

@Controller('muscles')
export class MusclesController {
    constructor(private musclesService: MusclesService) { }

    @Get('/all')
    async getAllMuscles(
        @Res() res: Response
    ) {
        this.musclesService.getAllMuscles(res);
    }

    @Get('/get/:id')
    async getMuscleById(@Param() muscleId: ParameterIdDto, @Res() res: Response) {
        this.musclesService.getMuscleById(muscleId.id, res);
    }

    @Get('muscle-groups/all')
    async getAllMuscleGroups(
        @Res() res: Response
    ) {
        this.musclesService.getAllMuscleGroups(res);
    }

    @Get('muscle-groups/get/:id')
    async getMuscleGroupId(@Param() idMuscleGroup: ParameterIdDto, @Res() res: Response) {
        this.musclesService.getMuscleGroupId(idMuscleGroup.id, res);
    }

    @Post('muscle-groups/create')
    async createMuscleGroup(
        @Body() createMuscleGroupDto: CreateMuscleGroupDto,
        @Res() res: Response,
    ) {
        this.musclesService.createMuscleGroup(createMuscleGroupDto, res);
    }
}

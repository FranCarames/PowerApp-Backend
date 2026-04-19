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
import { EditMuscleGroupDto } from '../dtos/muscle_groups/edit_muscle_group.dto';

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

    @Get('mg/all')
    async getAllMuscleGroups(
        @Res() res: Response
    ) {
        this.musclesService.getAllMuscleGroups(res);
    }

    @Get('mg/get/:id')
    async getMuscleGroupId(@Param() idMuscleGroup: ParameterIdDto, @Res() res: Response) {
        this.musclesService.getMuscleGroupId(idMuscleGroup.id, res);
    }

    @Post('mg/create')
    async createMuscleGroup(
        @Body() createMuscleGroupDto: CreateMuscleGroupDto,
        @Res() res: Response,
    ) {
        this.musclesService.createMuscleGroup(createMuscleGroupDto, res);
    }

    @Post('mg/edit/:id')
    async editMuscleGroup(
        @Param() idMuscleGroup: ParameterIdDto,
        @Body() editMuscleGroupDto: EditMuscleGroupDto,
        @Res() res: Response,
    ) {
        this.musclesService.editMuscleGroup(idMuscleGroup.id, editMuscleGroupDto, res);
    }

    @Delete('mg/:id')
    async deleteMuscleGroup(
        @Param() idMuscleGroup: ParameterIdDto,
        @Res() res: Response,
    ) {
        this.musclesService.deleteMuscleGroup(idMuscleGroup.id, res);
    }
}

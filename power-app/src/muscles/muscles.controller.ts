import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Res,
} from '@nestjs/common';
import { ApiTags, ApiResponse } from '@nestjs/swagger';
import { MusclesService } from './muscles.service';
import { Response } from 'express';
import { ParameterIdDto } from '../dtos/parameter_id.dto';
import { CreateMuscleDto } from '../dtos/muscles/create_muscle.dto';
import { EditMuscleDto } from '../dtos/muscles/edit_muscle.dto';
import { CreateMuscleGroupDto } from '../dtos/muscle_groups/create_muscle_group.dto';
import { EditMuscleGroupDto } from '../dtos/muscle_groups/edit_muscle_group.dto';
import { Muscle } from '../entities/muscle.entity';
import { MuscleGroup } from '../entities/muscle_group.entity';

@ApiTags('Muscles')
@Controller('muscles')
export class MusclesController {
    constructor(private musclesService: MusclesService) { }

    @Get('/all')
    @ApiResponse({ status: 200, type: [Muscle] })
    async getAllMuscles(
        @Res() res: Response
    ) {
        this.musclesService.getAllMuscles(res);
    }

    @Get('/get/:id')
    @ApiResponse({ status: 200, type: Muscle })
    async getMuscleById(@Param() muscleId: ParameterIdDto, @Res() res: Response) {
        this.musclesService.getMuscleById(muscleId.id, res);
    }

    @Post('create')
    @ApiResponse({ status: 201, type: Muscle })
    async createMuscle(
        @Body() createMuscleDto: CreateMuscleDto,
        @Res() res: Response,
    ) {
        this.musclesService.createMuscle(createMuscleDto, res);
    }

    @Post('edit/:id')
    @ApiResponse({ status: 200, type: Muscle })
    async editMuscle(
        @Param() idMuscle: ParameterIdDto,
        @Body() editMuscleDto: EditMuscleDto,
        @Res() res: Response,
    ) {
        this.musclesService.editMuscle(idMuscle.id, editMuscleDto, res);
    }

    @Delete(':id')
    @ApiResponse({ status: 200 })
    async deleteMuscle(
        @Param() idMuscle: ParameterIdDto,
        @Res() res: Response,
    ) {
        this.musclesService.deleteMuscle(idMuscle.id, res);
    }

    @Get('mg/all')
    @ApiResponse({ status: 200, type: [MuscleGroup] })
    async getAllMuscleGroups(
        @Res() res: Response
    ) {
        this.musclesService.getAllMuscleGroups(res);
    }

    @Get('mg/get/:id')
    @ApiResponse({ status: 200, type: MuscleGroup })
    async getMuscleGroupId(@Param() idMuscleGroup: ParameterIdDto, @Res() res: Response) {
        this.musclesService.getMuscleGroupId(idMuscleGroup.id, res);
    }

    @Post('mg/create')
    @ApiResponse({ status: 201, type: MuscleGroup })
    async createMuscleGroup(
        @Body() createMuscleGroupDto: CreateMuscleGroupDto,
        @Res() res: Response,
    ) {
        this.musclesService.createMuscleGroup(createMuscleGroupDto, res);
    }

    @Post('mg/edit/:id')
    @ApiResponse({ status: 200, type: MuscleGroup })
    async editMuscleGroup(
        @Param() idMuscleGroup: ParameterIdDto,
        @Body() editMuscleGroupDto: EditMuscleGroupDto,
        @Res() res: Response,
    ) {
        this.musclesService.editMuscleGroup(idMuscleGroup.id, editMuscleGroupDto, res);
    }

    @Delete('mg/:id')
    @ApiResponse({ status: 200 })
    async deleteMuscleGroup(
        @Param() idMuscleGroup: ParameterIdDto,
        @Res() res: Response,
    ) {
        this.musclesService.deleteMuscleGroup(idMuscleGroup.id, res);
    }
}

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
import { ParameterIdDto } from '../dtos/parameter_id.dto';
import { CreateMuscleGroupDto } from '../dtos/muscle_groups/create_muscle_group.dto';

@Controller('muscle-groups')
export class MuscleGroupsController {
    constructor(private muscleGroupsService: MuscleGroupsService) { }

    @Get('/all')
    async getAllMuscleGroups(
        @Res() res: Response
    ) {
        this.muscleGroupsService.getAllMuscleGroups(res);
    }

    @Get('/get/:id')
    async getMuscleGroupId(@Param() idMuscleGroup: ParameterIdDto, @Res() res: Response) {
        this.muscleGroupsService.getMuscleGroupId(idMuscleGroup.id, res);
    }

    @Post('/create')
    async createMuscleGroup(
        @Body() createMuscleGroupDto: CreateMuscleGroupDto,
        @Res() res: Response,
    ) {
        this.muscleGroupsService.createMuscleGroup(createMuscleGroupDto, res);
    }

    // @Post('/login')
    // async loginUser(
    //     @Body() loginUserDto: LoginUserDto,
    //     @Res() res: Response,
    // ) {
    //     this.usersService.loginUser(loginUserDto, res);
    // }
}

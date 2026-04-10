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
}

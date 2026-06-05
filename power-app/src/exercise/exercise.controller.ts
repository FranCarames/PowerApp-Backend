import {
  Controller,
  Get,
  Post,
  Param,
  Delete,
  Body,
  Res,
} from '@nestjs/common';
import { ApiTags, ApiResponse } from '@nestjs/swagger';
import { ExerciseService } from './exercise.service';
import { Response } from 'express';
import { ParameterIdDto } from '../dtos/parameter_id.dto';
import { CreateExerciseDto } from '../dtos/exercise/create_exercise.dto';
import { EditExerciseDto } from '../dtos/exercise/edit_exercise.dto';
import { Exercise } from '../entities/exercise.entity';
import { ExercisedMuscle } from '../entities/exercised_muscle.entity';

@ApiTags('Exercise')
@Controller('exercise')
export class ExerciseController {
    constructor(private exerciseService: ExerciseService) {}

    @Get('/all')
    @ApiResponse({ status: 200, type: [Exercise] })
    async getAllExercises(
        @Res() res: Response
    ) {
        this.exerciseService.getAllExercises(res);
    }

    @Post('create')
    @ApiResponse({ status: 201, type: Exercise })
    async createExercise(
        @Body() createExerciseDto: CreateExerciseDto,
        @Res() res: Response,
    ) {
        this.exerciseService.createExercise(createExerciseDto, res);
    }

    @Post('edit/:id')
    @ApiResponse({ status: 200, type: Exercise })
    async editExercise(
        @Param() idExercise: ParameterIdDto,
        @Body() editExerciseDto: EditExerciseDto,
        @Res() res: Response,
    ) {
        this.exerciseService.editExercise(idExercise.id, editExerciseDto, res);
    }

    @Delete(':id')
    @ApiResponse({ status: 200 })
    async deleteExercise(
        @Param() idMuscle: ParameterIdDto,
        @Res() res: Response,
    ) {
        this.exerciseService.deleteExercise(idMuscle.id, res);
    }

    @Get('ExMuscles/all')
    @ApiResponse({ status: 200, type: [ExercisedMuscle] })
    async getAllExercisedMuscles(
        @Res() res: Response
    ) {
        this.exerciseService.getAllExercisedMuscles(res);
    }
}

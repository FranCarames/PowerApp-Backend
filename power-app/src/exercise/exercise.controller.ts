import {
  Controller,
  Get,
  Post,
  Param,
  Delete,
  Body,
  Headers,
  Query,
  Res,
} from '@nestjs/common';
import { ExerciseService } from './exercise.service';
import { Response } from 'express';
import { ParameterIdDto } from '../dtos/parameter_id.dto';
import { CreateExerciseDto } from '../dtos/exercise/create_exercise.dto';
import { EditExerciseDto } from '../dtos/exercise/edit_exercise.dto';

@Controller('exercise')
export class ExerciseController {
    constructor(private exerciseService: ExerciseService) {}

    @Get('/all')
    async getAllExercises(
        @Res() res: Response
    ) {
        this.exerciseService.getAllExercises(res);
    }

    @Post('create')
    async createExercise(
        @Body() createExerciseDto: CreateExerciseDto,
        @Res() res: Response,
    ) {
        this.exerciseService.createExercise(createExerciseDto, res);
    }

    @Post('edit/:id')
    async editExercise(
        @Param() idExercise: ParameterIdDto,
        @Body() editExerciseDto: EditExerciseDto,
        @Res() res: Response,
    ) {
        this.exerciseService.editExercise(idExercise.id, editExerciseDto, res);
    }

    @Delete(':id')
    async deleteExercise(
        @Param() idMuscle: ParameterIdDto,
        @Res() res: Response,
    ) {
        this.exerciseService.deleteExercise(idMuscle.id, res);
    }

    @Get('ExMuscles/all')
    async getAllExercisedMuscles(
        @Res() res: Response
    ) {
        this.exerciseService.getAllExercisedMuscles(res);
    }
}
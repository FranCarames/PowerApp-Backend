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
import { UserRole } from '../entities/user.entity';
import { Auth } from '../authentication/decorators/auth.decorator';

@ApiTags('Exercise')
@Controller('exercise')
export class ExerciseController {
    constructor(private exerciseService: ExerciseService) {}

    @Get('/all')
    @ApiResponse({ status: 200, type: [Exercise] })
    async getAllExercises(
        @Res() res: Response
    ) {
        await this.exerciseService.getAllExercises(res);
    }

    @Post('create')
    @Auth(UserRole.admin)
    @ApiResponse({ status: 201, type: Exercise })
    @ApiResponse({ status: 409, description: 'Ya existe un ejercicio con ese nombre' })
    async createExercise(
        @Body() createExerciseDto: CreateExerciseDto,
        @Res() res: Response,
    ) {
        await this.exerciseService.createExercise(createExerciseDto, res);
    }

    @Post('edit/:id')
    @Auth(UserRole.admin)
    @ApiResponse({ status: 200, type: Exercise })
    @ApiResponse({ status: 409, description: 'Otro ejercicio ya tiene ese nombre' })
    async editExercise(
        @Param() idExercise: ParameterIdDto,
        @Body() editExerciseDto: EditExerciseDto,
        @Res() res: Response,
    ) {
        await this.exerciseService.editExercise(idExercise.id, editExerciseDto, res);
    }

    @Delete(':id')
    @Auth(UserRole.admin)
    @ApiResponse({ status: 200 })
    @ApiResponse({ status: 404, description: 'Ejercicio no encontrado' })
    @ApiResponse({ status: 409, description: 'El ejercicio está en uso (en circuitos, ya se entrenó con él o hay RMs registrados) y no se puede eliminar' })
    async deleteExercise(
        @Param() idMuscle: ParameterIdDto,
        @Res() res: Response,
    ) {
        await this.exerciseService.deleteExercise(idMuscle.id, res);
    }

    @Get('ExMuscles/all')
    @ApiResponse({ status: 200, type: [ExercisedMuscle] })
    async getAllExercisedMuscles(
        @Res() res: Response
    ) {
        await this.exerciseService.getAllExercisedMuscles(res);
    }

    @Get(':id')
    @Auth()
    @ApiResponse({ status: 200, type: Exercise })
    @ApiResponse({ status: 404, description: 'Ejercicio no encontrado' })
    async getExerciseById(
        @Param() idExercise: ParameterIdDto,
        @Res() res: Response,
    ) {
        await this.exerciseService.getExerciseById(idExercise.id, res);
    }
}

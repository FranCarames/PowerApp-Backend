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
import { UserRmService } from './user_rm.service';
import { Response } from 'express';
import { ParameterIdDto } from '../dtos/parameter_id.dto';
import { CreateUserRmDto } from '../dtos/user_rm/create_user_rm.dto';
import { EditUserRmDto } from '../dtos/user_rm/edit_user_rm.dto';
import { UserExerciseParamsDto } from '../dtos/user_rm/user_exercise_params.dto';
import { CalculatePotentialRmDto } from '../dtos/user_rm/calculate_potential_rm.dto';
import { PotentialRmResponseDto } from '../dtos/user_rm/potential_rm_response.dto';
import { UserRmDetailDto } from '../dtos/user_rm/user_rm_detail.dto';
import { UserRole } from '../entities/user.entity';
import { Auth } from '../authentication/decorators/auth.decorator';
import { Owner } from '../authentication/decorators/owner.decorator';
import { CurrentUser } from '../authentication/decorators/current-user.decorator';
import { AuthUser } from '../authentication/auth-user.interface';

@ApiTags('User RM')
@Controller('user_rm')
export class UserRmController {
    constructor(private userRmService: UserRmService) {}

    @Get('/all')
    @Auth(UserRole.coach, UserRole.admin)
    @ApiResponse({ status: 200, type: [UserRmDetailDto] })
    async getAllUserRms(
        @Res() res: Response
    ) {
        await this.userRmService.getAllUserRms(res);
    }

    @Get(':id')
    @Auth(UserRole.coach, UserRole.admin)
    @ApiResponse({ status: 200, type: [UserRmDetailDto], description: 'Hoy devuelve un array (vacío si no existe); BE-32 lo pasa a objeto y 404' })
    async getUserRmById(
        @Param() idUserRm: ParameterIdDto,
        @Res() res: Response
    ) {
        await this.userRmService.getUserRmById(idUserRm.id, res);
    }

    @Get('/user/:id')
    @Auth(UserRole.user, UserRole.coach, UserRole.admin)
    @Owner('id')
    @ApiResponse({ status: 200, type: [UserRmDetailDto] })
    async getAllUserRmsByUserId(
        @Param() idUser: ParameterIdDto,
        @Res() res: Response
    ) {
        await this.userRmService.getAllUserRmsByUserId(idUser.id, res);
    }

    @Get('/user/:idUser/exercise/:idExercise')
    @Auth(UserRole.user, UserRole.coach, UserRole.admin)
    @Owner('idUser')
    @ApiResponse({ status: 200, type: [UserRmDetailDto] })
    async getUserRmsByUserAndExercise(
        @Param() params: UserExerciseParamsDto,
        @Res() res: Response
    ) {
        await this.userRmService.getUserRmsByUserAndExercise(params.idUser, params.idExercise, res);
    }

    @Get('/exercise/:id')
    @Auth(UserRole.coach, UserRole.admin)
    @ApiResponse({ status: 200, type: [UserRmDetailDto] })
    async getAllUserRmsByExerciseId(
        @Param() idExercise: ParameterIdDto,
        @Res() res: Response
    ) {
        await this.userRmService.getAllUserRmsByExerciseId(idExercise.id, res);
    }

    @Post('potential')
    @Auth()
    @ApiResponse({ status: 200, type: PotentialRmResponseDto })
    @ApiResponse({ status: 404, description: 'Ejercicio no encontrado' })
    async calculatePotentialRms(
        @Body() calculatePotentialRmDto: CalculatePotentialRmDto,
        @Res() res: Response,
    ) {
        await this.userRmService.calculatePotentialRms(calculatePotentialRmDto, res);
    }

    @Post('create')
    @Auth(UserRole.user)
    @ApiResponse({ status: 201, type: UserRmDetailDto })
    async createUserRm(
        @CurrentUser() user: AuthUser,
        @Body() createUserRmDto: CreateUserRmDto,
        @Res() res: Response,
    ) {
        await this.userRmService.createUserRm(user.id, createUserRmDto, res);
    }

    @Post('edit/:id')
    @Auth(UserRole.user)
    @ApiResponse({ status: 201, type: UserRmDetailDto })
    async editUserRm(
        @CurrentUser() user: AuthUser,
        @Param() idUserRm: ParameterIdDto,
        @Body() editUserRmDto: EditUserRmDto,
        @Res() res: Response,
    ) {
        await this.userRmService.editUserRm(user.id, idUserRm.id, editUserRmDto, res);
    }

    @Delete(':id')
    @Auth(UserRole.user)
    @ApiResponse({ status: 200 })
    async deleteUserRm(
        @CurrentUser() user: AuthUser,
        @Param() idUserRm: ParameterIdDto,
        @Res() res: Response,
    ) {
        await this.userRmService.deleteUserRm(user.id, idUserRm.id, res);
    }
}

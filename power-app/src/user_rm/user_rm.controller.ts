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
import { UserRM } from '../entities/user_rm.entity';
import { UserRole } from '../entities/user.entity';
import { Auth } from '../authentication/decorators/auth.decorator';
import { CurrentUser } from '../authentication/decorators/current-user.decorator';
import { AuthUser } from '../authentication/auth-user.interface';

@ApiTags('User RM')
@Controller('user_rm')
export class UserRmController {
    constructor(private userRmService: UserRmService) {}

    @Get('/all')
    @Auth(UserRole.coach, UserRole.admin)
    @ApiResponse({ status: 200, type: [UserRM] })
    async getAllUserRms(
        @Res() res: Response
    ) {
        this.userRmService.getAllUserRms(res);
    }

    @Get(':id')
    @Auth(UserRole.coach, UserRole.admin)
    @ApiResponse({ status: 200, type: UserRM })
    async getUserRmById(
        @Param() idUserRm: ParameterIdDto,
        @Res() res: Response
    ) {
        this.userRmService.getUserRmById(idUserRm.id, res);
    }

    @Get('/user/:id')
    @Auth(UserRole.user, UserRole.coach, UserRole.admin)
    @ApiResponse({ status: 200, type: [UserRM] })
    async getAllUserRmsByUserId(
        @Param() idUser: ParameterIdDto,
        @Res() res: Response
    ) {
        this.userRmService.getAllUserRmsByUserId(idUser.id, res);
    }

    @Get('/user/:idUser/exercise/:idExercise')
    @Auth(UserRole.user, UserRole.coach, UserRole.admin)
    @ApiResponse({ status: 200, type: [UserRM] })
    @ApiResponse({ status: 403, description: 'Un alumno sólo puede consultar sus propios RMs' })
    async getUserRmsByUserAndExercise(
        @CurrentUser() user: AuthUser,
        @Param() params: UserExerciseParamsDto,
        @Res() res: Response
    ) {
        this.userRmService.getUserRmsByUserAndExercise(user, params.idUser, params.idExercise, res);
    }

    @Get('/exercise/:id')
    @Auth(UserRole.user, UserRole.coach, UserRole.admin)
    @ApiResponse({ status: 200, type: [UserRM] })
    async getAllUserRmsByExerciseId(
        @Param() idExercise: ParameterIdDto,
        @Res() res: Response
    ) {
        this.userRmService.getAllUserRmsByExerciseId(idExercise.id, res);
    }

    @Post('create')
    @Auth(UserRole.user)
    @ApiResponse({ status: 201, type: UserRM })
    async createUserRm(
        @CurrentUser() user: AuthUser,
        @Body() createUserRmDto: CreateUserRmDto,
        @Res() res: Response,
    ) {
        this.userRmService.createUserRm(user.id, createUserRmDto, res);
    }

    @Post('edit/:id')
    @Auth(UserRole.user)
    @ApiResponse({ status: 200, type: UserRM })
    async editUserRm(
        @CurrentUser() user: AuthUser,
        @Param() idUserRm: ParameterIdDto,
        @Body() editUserRmDto: EditUserRmDto,
        @Res() res: Response,
    ) {
        this.userRmService.editUserRm(user.id, idUserRm.id, editUserRmDto, res);
    }

    @Delete(':id')
    @Auth(UserRole.user)
    @ApiResponse({ status: 200 })
    async deleteUserRm(
        @CurrentUser() user: AuthUser,
        @Param() idUserRm: ParameterIdDto,
        @Res() res: Response,
    ) {
        this.userRmService.deleteUserRm(user.id, idUserRm.id, res);
    }
}

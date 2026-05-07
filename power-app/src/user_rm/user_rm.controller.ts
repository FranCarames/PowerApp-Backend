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
import { UserRmService } from './user_rm.service';
import { Response } from 'express';
import { ParameterIdDto } from '../dtos/parameter_id.dto';
import { CreateUserRmDto } from '../dtos/user_rm/create_user_rm.dto';
import { EditUserRmDto } from '../dtos/user_rm/edit_user_rm.dto';

@Controller('user_rm')
export class UserRmController {
    constructor(private userRmService: UserRmService) {}

    @Get('/all')
    async getAllUserRms(
        @Res() res: Response
    ) {
        this.userRmService.getAllUserRms(res);
    }

    @Get(':id')
    async getUserRmById(
        @Param() idUserRm: ParameterIdDto,
        @Res() res: Response
    ) {
        this.userRmService.getUserRmById(idUserRm.id, res);
    }

    @Get('/user/:id')
    async getAllUserRmsByUserId(
        @Param() idUser: ParameterIdDto,
        @Res() res: Response
    ) {
        this.userRmService.getAllUserRmsByUserId(idUser.id, res);
    }

    @Get('/exercise/:id')
    async getAllUserRmsByExerciseId(
        @Param() idExercise: ParameterIdDto,
        @Res() res: Response
    ) {
        this.userRmService.getAllUserRmsByExerciseId(idExercise.id, res);
    }

    @Post('create')
    async createUserRm(
        @Body() createUserRmDto: CreateUserRmDto,
        @Res() res: Response,
    ) {
        this.userRmService.createUserRm(createUserRmDto, res);
    }

    @Post('edit/:id')
    async editUserRm(
        @Param() idUserRm: ParameterIdDto,
        @Body() editUserRmDto: EditUserRmDto,
        @Res() res: Response,
    ) {
        this.userRmService.editUserRm(idUserRm.id, editUserRmDto, res);
    }

    @Delete(':id')
    async deleteUserRm(
        @Param() idUserRm: ParameterIdDto,
        @Res() res: Response,
    ) {
        this.userRmService.deleteUserRm(idUserRm.id, res);
    }
}

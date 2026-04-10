import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Res,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { Response } from 'express';
import { ParameterIdDto } from '../dtos/parameter_id.dto';
import { CreateUserDto } from '../dtos/user/create_user.dto';
import { LoginUserDto } from '../dtos/user/login_user.dto';
// import { EditEstudianteDto } from 'src/Dtos/Estudiantes/edit_estudiante.dto';

@Controller('users')
export class UsersController {

    constructor(private usersService: UsersService) { }

    @Get('/all')
    async getAllUsers(
        @Res() res: Response
    ) {
        this.usersService.getAllUsers(res);
    }

    @Get('/get/:id')
    async getUserId(@Param() idUser: ParameterIdDto, @Res() res: Response) {
        this.usersService.getUserId(idUser.id, res);
    }

    @Post('/register')
    async createUser(
        @Body() createUserDto: CreateUserDto,
        @Res() res: Response,
    ) {
        this.usersService.createUser(createUserDto, res);
    }

    @Post('/login')
    async loginUser(
        @Body() loginUserDto: LoginUserDto,
        @Res() res: Response,
    ) {
        this.usersService.loginUser(loginUserDto, res);
    }
}

//     @Post('/edit')
//     async editEstudiante(
//         @Body() editEstudianteDto: EditEstudianteDto,
//         @Res() res: Response,
//     ) {
//         this.sqlEstudianteService.editEstudiante(editEstudianteDto, res);
//     }

//     @Delete('/delete/:id')
//     async deleteEstudiante(
//         @Param() idEstudiante: ParameterIdDto,
//         @Res() res: Response,
//     ) {
//         this.sqlEstudianteService.deleteEstudiante(idEstudiante.id, res);
//     }
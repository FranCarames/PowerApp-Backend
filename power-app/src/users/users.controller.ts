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
// import { ParameterIdDto } from 'src/Dtos/parameter_id.dto';
// import { CreateEstudianteDto } from 'src/Dtos/Estudiantes/create_estudiante.dto';
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
}



// import { SqlEstudianteService } from './sql_estudiante.service';


// @Controller('mysql/estudiante')
// export class SqlEstudianteController {

    

//     @Get('/get/:id')
//     async getEstudianteId(@Param() idEstudiante: ParameterIdDto, @Res() res: Response) {
//         this.sqlEstudianteService.getEstudianteId(idEstudiante.id, res);
//     }

//     @Get('/get/:id/reservas')
//     async getEstudianteIdReservas(@Param() idEstudiante: ParameterIdDto, @Res() res: Response) {
//         this.sqlEstudianteService.getEstudianteIdReservas(idEstudiante.id, res);
//     }

//     @Post('/create')
//     async createEstudiante(
//         @Body() createEstudianteDto: CreateEstudianteDto,
//         @Res() res: Response,
//     ) {
//         this.sqlEstudianteService.createEstudiante(createEstudianteDto, res);
//     }

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
// }
import {
    Controller,
    Get,
    Post,
    Delete,
    Body,
    Param,
    Headers,
    Res,
} from '@nestjs/common';
import { ApiTags, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { RoutineService } from './routine.service';
import { Response } from 'express';
import { ParameterIdDto } from '../dtos/parameter_id.dto';
import { AuthenticableDTO } from '../dtos/authenticable.dto';
import { Routine } from '../entities/routine.entity';
// TODO: crear los siguientes DTOs en src/dtos/routine/
// import { CreateRoutineDto } from '../dtos/routine/create_routine.dto';
// import { EditRoutineDto } from '../dtos/routine/edit_routine.dto';

@ApiTags('Routine')
@ApiBearerAuth()
@Controller('routine')
export class RoutineController {

    constructor(private routineService: RoutineService) {}

    @Get('/all')
    @ApiResponse({ status: 200, type: [Routine] })
    async getAllRoutines(
        @Headers() header: AuthenticableDTO,
        @Res() res: Response,
    ) {
        const accessToken = header.authorization;
        if (!accessToken) return res.status(401).send({ error: 'Access Token no encontrado.' });
        // this.routineService.getAllRoutines(accessToken, res);
    }

    @Get('/:id')
    @ApiResponse({ status: 200, type: Routine })
    async getRoutineById(
        @Headers() header: AuthenticableDTO,
        @Param() idRoutine: ParameterIdDto,
        @Res() res: Response,
    ) {
        const accessToken = header.authorization;
        if (!accessToken) return res.status(401).send({ error: 'Access Token no encontrado.' });
        // this.routineService.getRoutineById(accessToken, idRoutine.id, res);
    }

    @Post('/create')
    @ApiResponse({ status: 201, type: Routine })
    async createRoutine(
        @Headers() header: AuthenticableDTO,
        @Body() createRoutineDto: any,
        @Res() res: Response,
    ) {
        const accessToken = header.authorization;
        if (!accessToken) return res.status(401).send({ error: 'Access Token no encontrado.' });
        // this.routineService.createRoutine(accessToken, createRoutineDto, res);
    }

    @Post('/edit/:id')
    @ApiResponse({ status: 200, type: Routine })
    async editRoutine(
        @Headers() header: AuthenticableDTO,
        @Param() idRoutine: ParameterIdDto,
        @Body() editRoutineDto: any,
        @Res() res: Response,
    ) {
        const accessToken = header.authorization;
        if (!accessToken) return res.status(401).send({ error: 'Access Token no encontrado.' });
        // this.routineService.editRoutine(accessToken, idRoutine.id, editRoutineDto, res);
    }

    @Delete('/:id')
    @ApiResponse({ status: 200 })
    async deleteRoutine(
        @Headers() header: AuthenticableDTO,
        @Param() idRoutine: ParameterIdDto,
        @Res() res: Response,
    ) {
        const accessToken = header.authorization;
        if (!accessToken) return res.status(401).send({ error: 'Access Token no encontrado.' });
        // this.routineService.deleteRoutine(accessToken, idRoutine.id, res);
    }
}

import {
    Controller,
    Get,
    Post,
    Delete,
    Body,
    Param,
    Res,
} from '@nestjs/common';
import { ApiTags, ApiResponse } from '@nestjs/swagger';
import { RoutineService } from './routine.service';
import { Response } from 'express';
import { ParameterIdDto } from '../dtos/parameter_id.dto';
import { Routine } from '../entities/routine.entity';
import { UserRole } from '../entities/user.entity';
import { Auth } from '../authentication/decorators/auth.decorator';
// TODO: crear los siguientes DTOs en src/dtos/routine/
// import { CreateRoutineDto } from '../dtos/routine/create_routine.dto';
// import { EditRoutineDto } from '../dtos/routine/edit_routine.dto';

@ApiTags('Routine')
@Controller('routine')
export class RoutineController {

    constructor(private routineService: RoutineService) {}

    @Get('/all')
    @Auth(UserRole.coach, UserRole.admin)
    @ApiResponse({ status: 200, type: [Routine] })
    async getAllRoutines(
        @Res() res: Response,
    ) {
        // this.routineService.getAllRoutines(res);
    }

    @Get('/:id')
    @Auth(UserRole.user, UserRole.coach, UserRole.admin)
    @ApiResponse({ status: 200, type: Routine })
    async getRoutineById(
        @Param() idRoutine: ParameterIdDto,
        @Res() res: Response,
    ) {
        // this.routineService.getRoutineById(idRoutine.id, res);
    }

    @Post('/create')
    @Auth(UserRole.coach, UserRole.admin)
    @ApiResponse({ status: 201, type: Routine })
    async createRoutine(
        @Body() createRoutineDto: any,
        @Res() res: Response,
    ) {
        // this.routineService.createRoutine(createRoutineDto, res);
    }

    @Post('/edit/:id')
    @Auth(UserRole.coach, UserRole.admin)
    @ApiResponse({ status: 200, type: Routine })
    async editRoutine(
        @Param() idRoutine: ParameterIdDto,
        @Body() editRoutineDto: any,
        @Res() res: Response,
    ) {
        // this.routineService.editRoutine(idRoutine.id, editRoutineDto, res);
    }

    @Delete('/:id')
    @Auth(UserRole.coach, UserRole.admin)
    @ApiResponse({ status: 200 })
    async deleteRoutine(
        @Param() idRoutine: ParameterIdDto,
        @Res() res: Response,
    ) {
        // this.routineService.deleteRoutine(idRoutine.id, res);
    }
}

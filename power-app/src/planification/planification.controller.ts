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
import { PlanificationService } from './planification.service';
import { Response } from 'express';
import { ParameterIdDto } from '../dtos/parameter_id.dto';
import { AuthenticableDTO } from '../dtos/authenticable.dto';
import { Planification } from '../entities/planification.entity';
import { UserPlanification } from '../entities/user_planification.entity';
import { RoutineAsignation } from '../entities/routine_asignation.entity';
import { RoutineAsignationUser } from '../entities/routine_asignation_user.entity';
// TODO: crear los siguientes DTOs en src/dtos/planification/
// import { CreatePlanificationDto } from '../dtos/planification/create_planification.dto';
// import { EditPlanificationDto } from '../dtos/planification/edit_planification.dto';
// import { AssignRoutineToPlanificationDto } from '../dtos/planification/assign_routine_to_planification.dto';
// import { AssignPlanificationToUserDto } from '../dtos/planification/assign_planification_to_user.dto';
// import { EditUserPlanificationDto } from '../dtos/planification/edit_user_planification.dto';
// import { AssignRoutineToUserDto } from '../dtos/planification/assign_routine_to_user.dto';

@ApiTags('Planification')
@ApiBearerAuth()
@Controller('planification')
export class PlanificationController {

    constructor(private planificationService: PlanificationService) {}

    @Get('/all')
    @ApiResponse({ status: 200, type: [Planification] })
    async getAllPlanifications(
        @Headers() header: AuthenticableDTO,
        @Res() res: Response,
    ) {
        const accessToken = header.authorization;
        if (!accessToken) return res.status(401).send({ error: 'Access Token no encontrado.' });
        // this.planificationService.getAllPlanifications(accessToken, res);
    }

    @Get('/:id')
    @ApiResponse({ status: 200, type: Planification })
    async getPlanificationById(
        @Headers() header: AuthenticableDTO,
        @Param() idPlanification: ParameterIdDto,
        @Res() res: Response,
    ) {
        const accessToken = header.authorization;
        if (!accessToken) return res.status(401).send({ error: 'Access Token no encontrado.' });
        // this.planificationService.getPlanificationById(accessToken, idPlanification.id, res);
    }

    @Post('/create')
    @ApiResponse({ status: 201, type: Planification })
    async createPlanification(
        @Headers() header: AuthenticableDTO,
        @Body() createPlanificationDto: any,
        @Res() res: Response,
    ) {
        const accessToken = header.authorization;
        if (!accessToken) return res.status(401).send({ error: 'Access Token no encontrado.' });
        // this.planificationService.createPlanification(accessToken, createPlanificationDto, res);
    }

    @Post('/edit/:id')
    @ApiResponse({ status: 200, type: Planification })
    async editPlanification(
        @Headers() header: AuthenticableDTO,
        @Param() idPlanification: ParameterIdDto,
        @Body() editPlanificationDto: any,
        @Res() res: Response,
    ) {
        const accessToken = header.authorization;
        if (!accessToken) return res.status(401).send({ error: 'Access Token no encontrado.' });
        // this.planificationService.editPlanification(accessToken, idPlanification.id, editPlanificationDto, res);
    }

    @Delete('/:id')
    @ApiResponse({ status: 200 })
    async deletePlanification(
        @Headers() header: AuthenticableDTO,
        @Param() idPlanification: ParameterIdDto,
        @Res() res: Response,
    ) {
        const accessToken = header.authorization;
        if (!accessToken) return res.status(401).send({ error: 'Access Token no encontrado.' });
        // this.planificationService.deletePlanification(accessToken, idPlanification.id, res);
    }

    @Post('/routine/assign')
    @ApiResponse({ status: 201, type: RoutineAsignation })
    async assignRoutineToPlanification(
        @Headers() header: AuthenticableDTO,
        @Body() assignRoutineDto: any,
        @Res() res: Response,
    ) {
        const accessToken = header.authorization;
        if (!accessToken) return res.status(401).send({ error: 'Access Token no encontrado.' });
        // this.planificationService.assignRoutineToPlanification(accessToken, assignRoutineDto, res);
    }

    @Delete('/routine/:id')
    @ApiResponse({ status: 200 })
    async removeRoutineFromPlanification(
        @Headers() header: AuthenticableDTO,
        @Param() idRoutineAsignation: ParameterIdDto,
        @Res() res: Response,
    ) {
        const accessToken = header.authorization;
        if (!accessToken) return res.status(401).send({ error: 'Access Token no encontrado.' });
        // this.planificationService.removeRoutineFromPlanification(accessToken, idRoutineAsignation.id, res);
    }

    @Post('/user/assign')
    @ApiResponse({ status: 201, type: UserPlanification })
    async assignPlanificationToUser(
        @Headers() header: AuthenticableDTO,
        @Body() assignPlanificationToUserDto: any,
        @Res() res: Response,
    ) {
        const accessToken = header.authorization;
        if (!accessToken) return res.status(401).send({ error: 'Access Token no encontrado.' });
        // this.planificationService.assignPlanificationToUser(accessToken, assignPlanificationToUserDto, res);
    }

    @Get('/user/:id')
    @ApiResponse({ status: 200, type: [UserPlanification] })
    async getUserPlanifications(
        @Headers() header: AuthenticableDTO,
        @Param() idUser: ParameterIdDto,
        @Res() res: Response,
    ) {
        const accessToken = header.authorization;
        if (!accessToken) return res.status(401).send({ error: 'Access Token no encontrado.' });
        // this.planificationService.getUserPlanifications(accessToken, idUser.id, res);
    }

    @Get('/user/:id/active')
    @ApiResponse({ status: 200, type: UserPlanification })
    async getActiveUserPlanification(
        @Headers() header: AuthenticableDTO,
        @Param() idUser: ParameterIdDto,
        @Res() res: Response,
    ) {
        const accessToken = header.authorization;
        if (!accessToken) return res.status(401).send({ error: 'Access Token no encontrado.' });
        // this.planificationService.getActiveUserPlanification(accessToken, idUser.id, res);
    }

    @Post('/user/edit/:id')
    @ApiResponse({ status: 200, type: UserPlanification })
    async editUserPlanification(
        @Headers() header: AuthenticableDTO,
        @Param() idUserPlanification: ParameterIdDto,
        @Body() editUserPlanificationDto: any,
        @Res() res: Response,
    ) {
        const accessToken = header.authorization;
        if (!accessToken) return res.status(401).send({ error: 'Access Token no encontrado.' });
        // this.planificationService.editUserPlanification(accessToken, idUserPlanification.id, editUserPlanificationDto, res);
    }

    @Delete('/user/:id')
    @ApiResponse({ status: 200 })
    async deleteUserPlanification(
        @Headers() header: AuthenticableDTO,
        @Param() idUserPlanification: ParameterIdDto,
        @Res() res: Response,
    ) {
        const accessToken = header.authorization;
        if (!accessToken) return res.status(401).send({ error: 'Access Token no encontrado.' });
        // this.planificationService.deleteUserPlanification(accessToken, idUserPlanification.id, res);
    }

    @Post('/routine/assign-user')
    @ApiResponse({ status: 201, type: RoutineAsignationUser })
    async assignRoutineToUser(
        @Headers() header: AuthenticableDTO,
        @Body() assignRoutineToUserDto: any,
        @Res() res: Response,
    ) {
        const accessToken = header.authorization;
        if (!accessToken) return res.status(401).send({ error: 'Access Token no encontrado.' });
        // this.planificationService.assignRoutineToUser(accessToken, assignRoutineToUserDto, res);
    }

    @Get('/user/:id/routines')
    @ApiResponse({ status: 200, type: [RoutineAsignationUser] })
    async getUserRoutines(
        @Headers() header: AuthenticableDTO,
        @Param() idUser: ParameterIdDto,
        @Res() res: Response,
    ) {
        const accessToken = header.authorization;
        if (!accessToken) return res.status(401).send({ error: 'Access Token no encontrado.' });
        // this.planificationService.getUserRoutines(accessToken, idUser.id, res);
    }
}

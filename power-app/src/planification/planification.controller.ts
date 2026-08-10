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
import { PlanificationService } from './planification.service';
import { Response } from 'express';
import { ParameterIdDto } from '../dtos/parameter_id.dto';
import { Planification } from '../entities/planification.entity';
import { UserPlanification } from '../entities/user_planification.entity';
import { RoutineAsignation } from '../entities/routine_asignation.entity';
import { RoutineAsignationUser } from '../entities/routine_asignation_user.entity';
import { UserRole } from '../entities/user.entity';
import { Auth } from '../authentication/decorators/auth.decorator';
// TODO: crear los siguientes DTOs en src/dtos/planification/
// import { CreatePlanificationDto } from '../dtos/planification/create_planification.dto';
// import { EditPlanificationDto } from '../dtos/planification/edit_planification.dto';
// import { AssignRoutineToPlanificationDto } from '../dtos/planification/assign_routine_to_planification.dto';
// import { AssignPlanificationToUserDto } from '../dtos/planification/assign_planification_to_user.dto';
// import { EditUserPlanificationDto } from '../dtos/planification/edit_user_planification.dto';
// import { AssignRoutineToUserDto } from '../dtos/planification/assign_routine_to_user.dto';

@ApiTags('Planification')
@Controller('planification')
export class PlanificationController {

    constructor(private planificationService: PlanificationService) {}

    @Get('/all')
    @Auth(UserRole.coach, UserRole.admin)
    @ApiResponse({ status: 200, type: [Planification] })
    async getAllPlanifications(
        @Res() res: Response,
    ) {
        // this.planificationService.getAllPlanifications(res);
    }

    @Get('/:id')
    @Auth(UserRole.coach, UserRole.admin)
    @ApiResponse({ status: 200, type: Planification })
    async getPlanificationById(
        @Param() idPlanification: ParameterIdDto,
        @Res() res: Response,
    ) {
        // this.planificationService.getPlanificationById(idPlanification.id, res);
    }

    @Post('/create')
    @Auth(UserRole.coach, UserRole.admin)
    @ApiResponse({ status: 201, type: Planification })
    async createPlanification(
        @Body() createPlanificationDto: any,
        @Res() res: Response,
    ) {
        // this.planificationService.createPlanification(createPlanificationDto, res);
    }

    @Post('/edit/:id')
    @Auth(UserRole.coach, UserRole.admin)
    @ApiResponse({ status: 200, type: Planification })
    async editPlanification(
        @Param() idPlanification: ParameterIdDto,
        @Body() editPlanificationDto: any,
        @Res() res: Response,
    ) {
        // this.planificationService.editPlanification(idPlanification.id, editPlanificationDto, res);
    }

    @Delete('/:id')
    @Auth(UserRole.coach, UserRole.admin)
    @ApiResponse({ status: 200 })
    async deletePlanification(
        @Param() idPlanification: ParameterIdDto,
        @Res() res: Response,
    ) {
        // this.planificationService.deletePlanification(idPlanification.id, res);
    }

    @Post('/routine/assign')
    @Auth(UserRole.coach, UserRole.admin)
    @ApiResponse({ status: 201, type: RoutineAsignation })
    async assignRoutineToPlanification(
        @Body() assignRoutineDto: any,
        @Res() res: Response,
    ) {
        // this.planificationService.assignRoutineToPlanification(assignRoutineDto, res);
    }

    @Delete('/routine/:id')
    @Auth(UserRole.coach, UserRole.admin)
    @ApiResponse({ status: 200 })
    async removeRoutineFromPlanification(
        @Param() idRoutineAsignation: ParameterIdDto,
        @Res() res: Response,
    ) {
        // this.planificationService.removeRoutineFromPlanification(idRoutineAsignation.id, res);
    }

    @Post('/user/assign')
    @Auth(UserRole.coach, UserRole.admin)
    @ApiResponse({ status: 201, type: UserPlanification })
    async assignPlanificationToUser(
        @Body() assignPlanificationToUserDto: any,
        @Res() res: Response,
    ) {
        // this.planificationService.assignPlanificationToUser(assignPlanificationToUserDto, res);
    }

    @Get('/user/:id')
    @Auth(UserRole.user, UserRole.coach, UserRole.admin)
    @ApiResponse({ status: 200, type: [UserPlanification] })
    async getUserPlanifications(
        @Param() idUser: ParameterIdDto,
        @Res() res: Response,
    ) {
        // this.planificationService.getUserPlanifications(idUser.id, res);
    }

    @Get('/user/:id/active')
    @Auth(UserRole.user, UserRole.coach, UserRole.admin)
    @ApiResponse({ status: 200, type: UserPlanification })
    async getActiveUserPlanification(
        @Param() idUser: ParameterIdDto,
        @Res() res: Response,
    ) {
        // this.planificationService.getActiveUserPlanification(idUser.id, res);
    }

    @Post('/user/edit/:id')
    @Auth(UserRole.coach, UserRole.admin)
    @ApiResponse({ status: 200, type: UserPlanification })
    async editUserPlanification(
        @Param() idUserPlanification: ParameterIdDto,
        @Body() editUserPlanificationDto: any,
        @Res() res: Response,
    ) {
        // this.planificationService.editUserPlanification(idUserPlanification.id, editUserPlanificationDto, res);
    }

    @Delete('/user/:id')
    @Auth(UserRole.coach, UserRole.admin)
    @ApiResponse({ status: 200 })
    async deleteUserPlanification(
        @Param() idUserPlanification: ParameterIdDto,
        @Res() res: Response,
    ) {
        // this.planificationService.deleteUserPlanification(idUserPlanification.id, res);
    }

    @Post('/routine/assign-user')
    @Auth(UserRole.coach, UserRole.admin)
    @ApiResponse({ status: 201, type: RoutineAsignationUser })
    async assignRoutineToUser(
        @Body() assignRoutineToUserDto: any,
        @Res() res: Response,
    ) {
        // this.planificationService.assignRoutineToUser(assignRoutineToUserDto, res);
    }

    @Get('/user/:id/routines')
    @Auth(UserRole.user, UserRole.coach, UserRole.admin)
    @ApiResponse({ status: 200, type: [RoutineAsignationUser] })
    async getUserRoutines(
        @Param() idUser: ParameterIdDto,
        @Res() res: Response,
    ) {
        // this.planificationService.getUserRoutines(idUser.id, res);
    }
}

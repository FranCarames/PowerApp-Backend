import {
    Controller,
    Get,
    Post,
    Delete,
    Body,
    Param,
    Query,
    Res,
} from '@nestjs/common';
import { ApiTags, ApiResponse } from '@nestjs/swagger';
import { PlanificationService } from './planification.service';
import { Response } from 'express';
import { ParameterIdDto } from '../dtos/parameter_id.dto';
import { Planification } from '../entities/planification.entity';
import { UserPlanification } from '../entities/user_planification.entity';
import { RoutineAsignation } from '../entities/routine_asignation.entity';
import { UserRole } from '../entities/user.entity';
import { Auth } from '../authentication/decorators/auth.decorator';
import { GetPlanificationsQueryDto } from '../dtos/planification/get_planifications_query.dto';
import { CreatePlanificationDto } from '../dtos/planification/create_planification.dto';
import { EditPlanificationDto } from '../dtos/planification/edit_planification.dto';
import { SetPlanificationActiveDto } from '../dtos/planification/set_planification_active.dto';
import { PlanificationListItemResponseDto } from '../dtos/planification/planification_list_item_response.dto';
import { PlanificationDetailResponseDto } from '../dtos/planification/planification_detail_response.dto';
import { AssignRoutineToPlanificationDto } from '../dtos/planification/assign_routine_to_planification.dto';
import { AssignRoutinesToPlanificationDto } from '../dtos/planification/assign_routines_to_planification.dto';
import { SetRoutineAsignationActiveDto } from '../dtos/planification/set_routine_asignation_active.dto';
import { SetRoutineAsignationsActiveDto } from '../dtos/planification/set_routine_asignations_active.dto';
// TODO: crear los siguientes DTOs en src/dtos/planification/ (CU-E-13 y E-14)
// import { AssignPlanificationToUserDto } from '../dtos/planification/assign_planification_to_user.dto';
// import { EditUserPlanificationDto } from '../dtos/planification/edit_user_planification.dto';
// CU-E-19 y CU-E-20 (asignar/quitar rutina individual a un alumno) salieron de aca el 27/8:
// son del paquete "Administrar Rutinas" y viven en routine/ (POST /routine/assign-user y
// DELETE /routine/assign-user/:id, desde BE-11). El listado GET /routine/assigned/:userId
// es BE-12

@ApiTags('Planification')
@Controller('planification')
export class PlanificationController {

    constructor(private planificationService: PlanificationService) {}

    // ===================== PLANIFICACIONES SISTEMICAS (CU-E-08 a CU-E-11) =====================

    @Get('/all')
    @Auth(UserRole.coach, UserRole.admin)
    @ApiResponse({ status: 200, type: [PlanificationListItemResponseDto] })
    async getAllPlanifications(
        @Query() query: GetPlanificationsQueryDto,
        @Res() res: Response,
    ) {
        await this.planificationService.getAllPlanifications(query, res);
    }

    // Va declarado ANTES de /:id: es de un solo segmento y si no la request cae en el
    // :id y devuelve 400 por UUID invalido. Mismo caso que circuit/all-plus y routine/all-plus
    @Get('/all-plus')
    @Auth(UserRole.coach, UserRole.admin)
    @ApiResponse({ status: 200, type: [PlanificationDetailResponseDto] })
    async getAllPlanificationsPlus(
        @Query() query: GetPlanificationsQueryDto,
        @Res() res: Response,
    ) {
        await this.planificationService.getAllPlanificationsPlus(query, res);
    }

    @Get('/:id')
    @Auth(UserRole.coach, UserRole.admin)
    @ApiResponse({ status: 200, type: PlanificationDetailResponseDto })
    async getPlanificationById(
        @Param() idPlanification: ParameterIdDto,
        @Res() res: Response,
    ) {
        await this.planificationService.getPlanificationById(idPlanification.id, res);
    }

    @Post('/create')
    @Auth(UserRole.coach, UserRole.admin)
    @ApiResponse({ status: 201, type: PlanificationDetailResponseDto })
    @ApiResponse({ status: 400, description: 'Datos inválidos (duration obligatoria, entero ≥ 0)' })
    async createPlanification(
        @Body() createPlanificationDto: CreatePlanificationDto,
        @Res() res: Response,
    ) {
        await this.planificationService.createPlanification(createPlanificationDto, res);
    }

    @Post('/edit/:id')
    @Auth(UserRole.coach, UserRole.admin)
    @ApiResponse({ status: 200, type: PlanificationDetailResponseDto })
    @ApiResponse({ status: 400, description: 'Datos inválidos, planificación de baja, o duración menor que la semana más alta usada por una rutina vigente' })
    @ApiResponse({ status: 404, description: 'Planificación no encontrada' })
    async editPlanification(
        @Param() idPlanification: ParameterIdDto,
        @Body() editPlanificationDto: EditPlanificationDto,
        @Res() res: Response,
    ) {
        await this.planificationService.editPlanification(idPlanification.id, editPlanificationDto, res);
    }

    // Baja logica: reemplaza al DELETE /:id del andamiaje. Se elige POST con body porque
    // no es un borrado y porque reactivar necesita el mismo camino.
    // Espejo exacto de POST /routine/set-active/:id
    @Post('/set-active/:id')
    @Auth(UserRole.coach, UserRole.admin)
    @ApiResponse({ status: 200, type: Planification })
    async setPlanificationActive(
        @Param() idPlanification: ParameterIdDto,
        @Body() setPlanificationActiveDto: SetPlanificationActiveDto,
        @Res() res: Response,
    ) {
        await this.planificationService.setPlanificationActive(idPlanification.id, setPlanificationActiveDto, res);
    }

    // ===================== ASIGNACION DE RUTINAS AL PLAN (CU-E-12) =====================

    @Post('/routine/assign')
    @Auth(UserRole.coach, UserRole.admin)
    @ApiResponse({ status: 201, type: PlanificationDetailResponseDto })
    @ApiResponse({ status: 400, description: 'Datos inválidos, planificación o rutina de baja, o semana mayor que la duración del plan' })
    @ApiResponse({ status: 404, description: 'Planificación o rutina no encontrada' })
    async assignRoutineToPlanification(
        @Body() assignRoutineDto: AssignRoutineToPlanificationDto,
        @Res() res: Response,
    ) {
        await this.planificationService.assignRoutineToPlanification(assignRoutineDto, res);
    }

    @Post('/routine/assign-bulk')
    @Auth(UserRole.coach, UserRole.admin)
    @ApiResponse({ status: 201, type: PlanificationDetailResponseDto })
    @ApiResponse({ status: 400, description: 'Datos inválidos, planificación o alguna rutina de baja, o semana mayor que la duración del plan (no se crea ninguna asignación)' })
    @ApiResponse({ status: 404, description: 'Planificación o alguna rutina no encontrada' })
    async assignRoutinesToPlanification(
        @Body() assignRoutinesDto: AssignRoutinesToPlanificationDto,
        @Res() res: Response,
    ) {
        await this.planificationService.assignRoutinesToPlanification(assignRoutinesDto, res);
    }

    // Reemplaza al DELETE /planification/routine/:id del andamiaje: la baja del vinculo
    // es logica desde el 31/8, y el mismo endpoint reactiva
    @Post('/routine/set-active/:id')
    @Auth(UserRole.coach, UserRole.admin)
    @ApiResponse({ status: 200, type: RoutineAsignation })
    @ApiResponse({ status: 400, description: 'week u order junto con active = false, o semana fuera de la duración actual del plan' })
    @ApiResponse({ status: 404, description: 'Asignación no encontrada' })
    async setRoutineAsignationActive(
        @Param() idRoutineAsignation: ParameterIdDto,
        @Body() setActiveDto: SetRoutineAsignationActiveDto,
        @Res() res: Response,
    ) {
        await this.planificationService.setRoutineAsignationActive(idRoutineAsignation.id, setActiveDto, res);
    }

    @Post('/routine/set-active-bulk')
    @Auth(UserRole.coach, UserRole.admin)
    @ApiResponse({ status: 200, type: [RoutineAsignation] })
    @ApiResponse({ status: 400, description: 'Ids repetidos, o alguna asignación quedaría fuera de la duración actual de su plan (no se aplica ninguna)' })
    @ApiResponse({ status: 404, description: 'Alguna asignación no fue encontrada' })
    async setRoutineAsignationsActive(
        @Body() setActiveDto: SetRoutineAsignationsActiveDto,
        @Res() res: Response,
    ) {
        await this.planificationService.setRoutineAsignationsActive(setActiveDto, res);
    }

    // ===================== ASIGNACIONES A ALUMNOS (CU-E-13, E-14, U-08) =====================

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

}

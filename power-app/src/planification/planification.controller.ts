import {
    Controller,
    Get,
    Post,
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
import { AssignPlanificationToUserDto } from '../dtos/planification/assign_planification_to_user.dto';
import { UserPlanificationResponseDto, AssignPlanificationOverlapResponseDto } from '../dtos/planification/user_planification_response.dto';
import { CurrentUser } from '../authentication/decorators/current-user.decorator';
import { AuthUser } from '../authentication/auth-user.interface';
import { Owner } from '../authentication/decorators/owner.decorator';
import { SetUserPlanificationActiveDto } from '../dtos/planification/set_user_planification_active.dto';
import { GetUserPlanificationsQueryDto } from '../dtos/planification/get_user_planifications_query.dto';
import { AssignedRoutinesParamsDto } from '../dtos/routine/assigned_routines_params.dto';
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

    // ===================== ASIGNACIONES A ALUMNOS (CU-E-13 y CU-E-14) =====================

    // Solo el coach (D20): coach_id sale del token, y el admin no tiene fila en Coach
    @Post('/user/assign')
    @Auth(UserRole.coach)
    @ApiResponse({ status: 201, type: UserPlanificationResponseDto, description: 'La asignación creada. Sin end_date en el body, el fin es el domingo de la semana duration de la plantilla' })
    @ApiResponse({ status: 400, description: 'Datos inválidos, end_date anterior a start_date, planificación dada de baja o sin rutinas vigentes, planificación de duración 0 sin end_date, fin calculado fuera del calendario, o el destinatario no es un alumno o tiene la cuenta cerrada' })
    @ApiResponse({ status: 403, description: 'El usuario no es coach, o no tiene una fila activa en Coach (Tu usuario no está registrado como entrenador.)' })
    @ApiResponse({ status: 404, description: 'Planificación o usuario no encontrado' })
    @ApiResponse({ status: 409, type: AssignPlanificationOverlapResponseDto, description: 'El alumno tiene otra planificación activa que se pisa con esas fechas (los dos extremos inclusivos). Reenviando con confirm_overlap: true se crea igual' })
    async assignPlanificationToUser(
        @Body() assignPlanificationToUserDto: AssignPlanificationToUserDto,
        @CurrentUser() user: AuthUser,
        @Res() res: Response,
    ) {
        await this.planificationService.assignPlanificationToUser(assignPlanificationToUserDto, user, res);
    }

    // Quitar o reincorporar (D23). Coach y admin: a diferencia de E-13 no se guarda quien lo hizo, y
    // el gimnasio es compartido (D6). Reemplaza al DELETE /user/:id del andamiaje
    @Post('/user/set-active/:id')
    @Auth(UserRole.coach, UserRole.admin)
    @ApiResponse({ status: 200, type: UserPlanificationResponseDto, description: 'La asignación con su nuevo estado. Quitar sólo apaga active; reincorporar no vuelve a chequear el solapamiento' })
    @ApiResponse({ status: 400, description: 'Datos inválidos, o la asignación ya está en ese estado (La planificación del alumno ya está dada de baja. / ya está activa.)' })
    @ApiResponse({ status: 404, description: 'Asignación no encontrada' })
    async setUserPlanificationActive(
        @Param() idUserPlanification: ParameterIdDto,
        @Body() setUserPlanificationActiveDto: SetUserPlanificationActiveDto,
        @Res() res: Response,
    ) {
        await this.planificationService.setUserPlanificationActive(idUserPlanification.id, setUserPlanificationActiveDto, res);
    }

    // Con el rol user, @Owner exige que :userId sea el propio id (403); coach y admin ven los de
    // cualquier alumno (D6). Reemplaza al GET /user/:id del andamiaje, que tomaba el param id
    @Get('/user/:userId')
    @Auth(UserRole.user, UserRole.coach, UserRole.admin)
    @Owner('userId')
    @ApiResponse({ status: 200, type: [UserPlanificationResponseDto], description: 'Las asignaciones del alumno, de la más nueva a la más vieja (inicio y alta, descendentes). Por defecto sólo las activas. Sin asignaciones, un array vacío' })
    @ApiResponse({ status: 400, description: 'El id del alumno no es un UUID válido, o include_inactive no es true ni false' })
    @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
    async getUserPlanifications(
        @Param() params: AssignedRoutinesParamsDto,
        @Query() query: GetUserPlanificationsQueryDto,
        @Res() res: Response,
    ) {
        await this.planificationService.getUserPlanifications(params.userId, query, res);
    }

}

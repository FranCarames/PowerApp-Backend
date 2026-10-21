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
import { RoutineService } from './routine.service';
import { Response } from 'express';
import { ParameterIdDto } from '../dtos/parameter_id.dto';
import { Routine } from '../entities/routine.entity';
import { Circuit } from '../entities/circuit.entity';
import { UserRole } from '../entities/user.entity';
import { Auth } from '../authentication/decorators/auth.decorator';
import { CreateCircuitDto } from '../dtos/circuit/create_circuit.dto';
import { EditCircuitDto } from '../dtos/circuit/edit_circuit.dto';
import { GetCircuitsQueryDto } from '../dtos/circuit/get_circuits_query.dto';
import { SetCircuitActiveDto } from '../dtos/circuit/set_circuit_active.dto';
import { CircuitListItemResponseDto } from '../dtos/circuit/circuit_list_item_response.dto';
import { CircuitListItemPlusResponseDto } from '../dtos/circuit/circuit_list_item_plus_response.dto';
import { GetRoutinesQueryDto } from '../dtos/routine/get_routines_query.dto';
import { RoutineListItemResponseDto } from '../dtos/routine/routine_list_item_response.dto';
import { RoutineListItemPlusResponseDto } from '../dtos/routine/routine_list_item_plus_response.dto';
import { RoutineDetailResponseDto } from '../dtos/routine/routine_detail_response.dto';
import { CircuitDetailResponseDto } from '../dtos/circuit/circuit_detail_response.dto';
import { CreateRoutineDto } from '../dtos/routine/create_routine.dto';
import { EditRoutineDto } from '../dtos/routine/edit_routine.dto';
import { SetRoutineActiveDto } from '../dtos/routine/set_routine_active.dto';
import { Owner } from '../authentication/decorators/owner.decorator';
import { CurrentUser } from '../authentication/decorators/current-user.decorator';
import { AuthUser } from '../authentication/auth-user.interface';
import { AssignRoutineToUserDto } from '../dtos/routine/assign_routine_to_user.dto';
import { RoutineAssignUserResponseDto } from '../dtos/routine/routine_assign_user_response.dto';
import { AssignedRoutinesParamsDto } from '../dtos/routine/assigned_routines_params.dto';
import { GetAssignedRoutinesQueryDto } from '../dtos/routine/get_assigned_routines_query.dto';
import { RoutineAssignedListItemResponseDto } from '../dtos/routine/routine_assigned_list_item_response.dto';
import { RoutineAssignedDetailResponseDto, RoutineAssignedFinishedDto } from '../dtos/routine/routine_assigned_detail_response.dto';
import { MarkExerciseFinishedDto } from '../dtos/routine/mark_exercise_finished.dto';
import { AssignedFinishedParamsDto } from '../dtos/routine/assigned_finished_params.dto';
import { RoutineAssignedUnfinishedResponseDto } from '../dtos/routine/routine_assigned_unfinished_response.dto';
import { GetTrainingHistoryQueryDto } from '../dtos/routine/get_training_history_query.dto';
import { RoutineHistorySessionDto } from '../dtos/routine/routine_history_response.dto';

@ApiTags('Routine')
@Controller('routine')
export class RoutineController {

    constructor(private routineService: RoutineService) {}

    @Get('/all')
    @Auth(UserRole.coach, UserRole.admin)
    @ApiResponse({ status: 200, type: [RoutineListItemResponseDto] })
    async getAllRoutines(
        @Query() query: GetRoutinesQueryDto,
        @Res() res: Response,
    ) {
        await this.routineService.getAllRoutines(query, res);
    }

    // Va antes de '/:id': al ser un solo segmento tambien matchea ese patron,
    // y si quedara declarado despues caeria ahi y devolveria 400 por UUID invalido
    @Get('/all-plus')
    @Auth(UserRole.coach, UserRole.admin)
    @ApiResponse({ status: 200, type: [RoutineListItemPlusResponseDto] })
    async getAllRoutinesPlus(
        @Query() query: GetRoutinesQueryDto,
        @Res() res: Response,
    ) {
        await this.routineService.getAllRoutinesPlus(query, res);
    }

    // Sin el rol user, a proposito (D8, 17/10): el alumno lee la rutina POR SU ASIGNACION,
    // GET /routine/assign-user/:id, que es la unidad de trabajo del dia. Habilitarlo aca
    // obligaria a chequear "la tiene asignada" y cambiaria el contrato de este endpoint
    @Get('/:id')
    @Auth(UserRole.coach, UserRole.admin)
    @ApiResponse({ status: 200, type: RoutineDetailResponseDto })
    async getRoutineById(
        @Param() idRoutine: ParameterIdDto,
        @Res() res: Response,
    ) {
        await this.routineService.getRoutineById(idRoutine.id, res);
    }

    @Post('/create')
    @Auth(UserRole.coach, UserRole.admin)
    @ApiResponse({ status: 201, type: RoutineDetailResponseDto })
    async createRoutine(
        @Body() createRoutineDto: CreateRoutineDto,
        @Res() res: Response,
    ) {
        await this.routineService.createRoutine(createRoutineDto, res);
    }

    @Post('/edit/:id')
    @Auth(UserRole.coach, UserRole.admin)
    @ApiResponse({ status: 200, type: RoutineDetailResponseDto })
    async editRoutine(
        @Param() idRoutine: ParameterIdDto,
        @Body() editRoutineDto: EditRoutineDto,
        @Res() res: Response,
    ) {
        await this.routineService.editRoutine(idRoutine.id, editRoutineDto, res);
    }

    // Reemplaza al DELETE /:id del andamiaje: desde el 22/8 la rutina tiene baja logica,
    // asi que no hay ningun caso en que se borre fisicamente. Es POST con body y no DELETE
    // porque el mismo endpoint tambien reactiva. Espejo de circuit/set-active/:id
    @Post('/set-active/:id')
    @Auth(UserRole.coach, UserRole.admin)
    @ApiResponse({ status: 200, type: Routine })
    async setRoutineActive(
        @Param() idRoutine: ParameterIdDto,
        @Body() setRoutineActiveDto: SetRoutineActiveDto,
        @Res() res: Response,
    ) {
        await this.routineService.setRoutineActive(idRoutine.id, setRoutineActiveDto, res);
    }

    // ===================== CIRCUITOS (CU-E-21, CU-E-22, CU-E-23, CU-E-24) =====================

    @Post('circuit/create')
    @Auth(UserRole.coach, UserRole.admin)
    @ApiResponse({ status: 201, type: CircuitDetailResponseDto })
    async createCircuit(
        @Body() createCircuitDto: CreateCircuitDto,
        @Res() res: Response,
    ) {
        await this.routineService.createCircuit(createCircuitDto, res);
    }

    // No hace falta cuidar el orden como con 'circuit/all-plus': 'circuit/edit/:id' tiene
    // dos segmentos despues de circuit, asi que no matchea el patron 'circuit/:id'
    @Post('circuit/edit/:id')
    @Auth(UserRole.coach, UserRole.admin)
    @ApiResponse({ status: 200, type: CircuitDetailResponseDto })
    async editCircuit(
        @Param() idCircuit: ParameterIdDto,
        @Body() editCircuitDto: EditCircuitDto,
        @Res() res: Response,
    ) {
        await this.routineService.editCircuit(idCircuit.id, editCircuitDto, res);
    }

    @Get('circuit/all')
    @Auth(UserRole.coach, UserRole.admin)
    @ApiResponse({ status: 200, type: [CircuitListItemResponseDto] })
    async getAllCircuits(
        @Query() query: GetCircuitsQueryDto,
        @Res() res: Response,
    ) {
        await this.routineService.getAllCircuits(query, res);
    }

    // Va antes de 'circuit/:id': al ser un solo segmento tambien matchea ese patron,
    // y si quedara declarado despues caeria ahi y devolveria 400 por UUID invalido
    @Get('circuit/all-plus')
    @Auth(UserRole.coach, UserRole.admin)
    @ApiResponse({ status: 200, type: [CircuitListItemPlusResponseDto] })
    async getAllCircuitsPlus(
        @Query() query: GetCircuitsQueryDto,
        @Res() res: Response,
    ) {
        await this.routineService.getAllCircuitsPlus(query, res);
    }

    @Get('circuit/:id')
    @Auth(UserRole.coach, UserRole.admin)
    @ApiResponse({ status: 200, type: CircuitDetailResponseDto })
    async getCircuitById(
        @Param() idCircuit: ParameterIdDto,
        @Res() res: Response,
    ) {
        await this.routineService.getCircuitById(idCircuit.id, res);
    }

    @Post('circuit/set-active/:id')
    @Auth(UserRole.coach, UserRole.admin)
    @ApiResponse({ status: 200, type: Circuit })
    async setCircuitActive(
        @Param() idCircuit: ParameterIdDto,
        @Body() setCircuitActiveDto: SetCircuitActiveDto,
        @Res() res: Response,
    ) {
        await this.routineService.setCircuitActive(idCircuit.id, setCircuitActiveDto, res);
    }

    // ===================== ASIGNACION INDIVIDUAL A UN ALUMNO (CU-E-19, CU-E-20) =====================

    // Rutas de dos segmentos: no compiten con 'GET /:id'
    @Post('assign-user')
    @Auth(UserRole.coach, UserRole.admin)
    @ApiResponse({ status: 201, type: RoutineAssignUserResponseDto })
    @ApiResponse({ status: 400, description: 'Datos inválidos, rutina dada de baja, o el destinatario no es un alumno o tiene la cuenta cerrada' })
    @ApiResponse({ status: 404, description: 'Rutina o usuario no encontrado' })
    @ApiResponse({ status: 409, description: 'El alumno ya tiene esa rutina asignada ese día' })
    async assignRoutineToUser(
        @Body() assignRoutineToUserDto: AssignRoutineToUserDto,
        @Res() res: Response,
    ) {
        await this.routineService.assignRoutineToUser(assignRoutineToUserDto, res);
    }

    @Delete('assign-user/:id')
    @Auth(UserRole.coach, UserRole.admin)
    @ApiResponse({ status: 200, type: RoutineAssignUserResponseDto, description: 'La asignación que se borró (borrado físico)' })
    @ApiResponse({ status: 400, description: 'El id no es un UUID válido' })
    @ApiResponse({ status: 404, description: 'Asignación no encontrada' })
    @ApiResponse({ status: 409, description: 'El alumno ya entrenó esta rutina: no se puede quitar' })
    async removeRoutineFromUser(
        @Param() idAssignment: ParameterIdDto,
        @Res() res: Response,
    ) {
        await this.routineService.removeRoutineFromUser(idAssignment.id, res);
    }

    // El dueño se chequea en el service y no con @Owner: el path trae el id de la asignacion y no
    // el del alumno. Con el rol user, 403 si la asignacion es de otro; coach y admin abren la de
    // cualquiera. Cubre U-09 y U-10: el detalle de cada ejercicio (series y notas) viene en el arbol
    @Get('assign-user/:id')
    @Auth(UserRole.user, UserRole.coach, UserRole.admin)
    @ApiResponse({ status: 200, type: RoutineAssignedDetailResponseDto })
    @ApiResponse({ status: 400, description: 'El id no es un UUID válido' })
    @ApiResponse({ status: 403, description: 'La asignación es de otro alumno' })
    @ApiResponse({ status: 404, description: 'Asignación no encontrada' })
    async getAssignedRoutineById(
        @Param() idAssignment: ParameterIdDto,
        @CurrentUser() user: AuthUser,
        @Res() res: Response,
    ) {
        await this.routineService.getAssignedRoutineById(idAssignment.id, user, res);
    }

    // Marcar, dejar o editar la nota (U-12, con U-13 incluido). Solo el alumno dueño: el dueño se
    // chequea en el service porque el path trae el id de la asignacion y no el del alumno. El
    // hecho es POR EJERCICIO, no por serie: el tildado serie por serie es de la interfaz
    @Post('assign-user/:id/finished')
    @Auth(UserRole.user)
    @ApiResponse({ status: 201, type: RoutineAssignedFinishedDto, description: 'El ejercicio no estaba marcado: se creó la marca (con la nota, si vino)' })
    @ApiResponse({ status: 200, type: RoutineAssignedFinishedDto, description: 'Ya estaba marcado (también si dos marcas chocaron): idempotente. Si vinieron user_note o finished_at y cambiaron, se actualizaron; la cadena vacía borra la nota' })
    @ApiResponse({ status: 400, description: 'Datos inválidos, falta finished_at al marcar un ejercicio que no estaba marcado, el ejercicio no pertenece a la rutina de la asignación, o el coach lo sacó de la rutina y todavía no estaba marcado' })
    @ApiResponse({ status: 403, description: 'La asignación es de otro alumno' })
    @ApiResponse({ status: 404, description: 'Asignación no encontrada' })
    async markExerciseFinished(
        @Param() idAssignment: ParameterIdDto,
        @Body() markExerciseFinishedDto: MarkExerciseFinishedDto,
        @CurrentUser() user: AuthUser,
        @Res() res: Response,
    ) {
        await this.routineService.markExerciseFinished(idAssignment.id, markExerciseFinishedDto, user, res);
    }

    // Borra la marca y su nota. Idempotente: 200 también si el ejercicio no estaba marcado. Se
    // puede desmarcar un ejercicio que el coach sacó de la rutina después
    @Delete('assign-user/:id/finished/:routineExerciseId')
    @Auth(UserRole.user)
    @ApiResponse({ status: 200, type: RoutineAssignedUnfinishedResponseDto })
    @ApiResponse({ status: 400, description: 'Alguno de los ids no es un UUID válido' })
    @ApiResponse({ status: 403, description: 'La asignación es de otro alumno' })
    @ApiResponse({ status: 404, description: 'Asignación no encontrada' })
    async unmarkExerciseFinished(
        @Param() params: AssignedFinishedParamsDto,
        @CurrentUser() user: AuthUser,
        @Res() res: Response,
    ) {
        await this.routineService.unmarkExerciseFinished(params.id, params.routineExerciseId, user, res);
    }

    // Con el rol user, @Owner exige que :userId sea el propio id (403); coach y admin ven el de
    // cualquier alumno (gimnasio compartido, D6). El home del alumno manda from = lunes y
    // to = domingo; el entrenador, sin filtro
    @Get('assigned/:userId')
    @Auth(UserRole.user, UserRole.coach, UserRole.admin)
    @Owner('userId')
    @ApiResponse({ status: 200, type: [RoutineAssignedListItemResponseDto], description: 'Ordenado por día y nombre de rutina. Sin asignaciones, un array vacío' })
    @ApiResponse({ status: 400, description: 'Id o fecha inválidos, o from posterior a to' })
    @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
    async getAssignedRoutines(
        @Param() params: AssignedRoutinesParamsDto,
        @Query() query: GetAssignedRoutinesQueryDto,
        @Res() res: Response,
    ) {
        await this.routineService.getAssignedRoutines(params.userId, query, res);
    }

    // Historial de entrenamientos del alumno (E-06) y su filtro por ejercicio (E-07). Solo coach y
    // admin: gimnasio compartido (D6), cualquiera ve el de cualquier alumno. Las dos rutas de dos
    // segmentos no compiten con 'GET /:id'
    @Get('history/:userId')
    @Auth(UserRole.coach, UserRole.admin)
    @ApiResponse({ status: 200, type: [RoutineHistorySessionDto], description: 'Las sesiones con al menos un ejercicio hecho, de la más nueva a la más vieja (día descendente y nombre de rutina). Sin historial, un array vacío' })
    @ApiResponse({ status: 400, description: 'El id del alumno o el exercise_id no son UUID válidos' })
    @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
    async getTrainingHistory(
        @Param() params: AssignedRoutinesParamsDto,
        @Query() query: GetTrainingHistoryQueryDto,
        @Res() res: Response,
    ) {
        await this.routineService.getTrainingHistory(params.userId, query, res);
    }
}

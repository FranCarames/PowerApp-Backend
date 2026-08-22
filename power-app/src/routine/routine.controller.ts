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
import { GetCircuitsQueryDto } from '../dtos/circuit/get_circuits_query.dto';
import { SetCircuitActiveDto } from '../dtos/circuit/set_circuit_active.dto';
import { CircuitListItemResponseDto } from '../dtos/circuit/circuit_list_item_response.dto';
import { CircuitListItemPlusResponseDto } from '../dtos/circuit/circuit_list_item_plus_response.dto';
import { CircuitDetailResponseDto } from '../dtos/circuit/circuit_detail_response.dto';
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

    // ===================== CIRCUITOS (CU-E-21, CU-E-24) =====================

    @Post('circuit/create')
    @Auth(UserRole.coach, UserRole.admin)
    @ApiResponse({ status: 201, type: CircuitDetailResponseDto })
    async createCircuit(
        @Body() createCircuitDto: CreateCircuitDto,
        @Res() res: Response,
    ) {
        this.routineService.createCircuit(createCircuitDto, res);
    }

    @Get('circuit/all')
    @Auth(UserRole.coach, UserRole.admin)
    @ApiResponse({ status: 200, type: [CircuitListItemResponseDto] })
    async getAllCircuits(
        @Query() query: GetCircuitsQueryDto,
        @Res() res: Response,
    ) {
        this.routineService.getAllCircuits(query, res);
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
        this.routineService.getAllCircuitsPlus(query, res);
    }

    @Get('circuit/:id')
    @Auth(UserRole.coach, UserRole.admin)
    @ApiResponse({ status: 200, type: CircuitDetailResponseDto })
    async getCircuitById(
        @Param() idCircuit: ParameterIdDto,
        @Res() res: Response,
    ) {
        this.routineService.getCircuitById(idCircuit.id, res);
    }

    @Post('circuit/set-active/:id')
    @Auth(UserRole.coach, UserRole.admin)
    @ApiResponse({ status: 200, type: Circuit })
    async setCircuitActive(
        @Param() idCircuit: ParameterIdDto,
        @Body() setCircuitActiveDto: SetCircuitActiveDto,
        @Res() res: Response,
    ) {
        this.routineService.setCircuitActive(idCircuit.id, setCircuitActiveDto, res);
    }
}

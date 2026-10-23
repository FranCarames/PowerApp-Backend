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
import { MusclesService } from './muscles.service';
import { Response } from 'express';
import { ParameterIdDto } from '../dtos/parameter_id.dto';
import { CreateMuscleDto } from '../dtos/muscles/create_muscle.dto';
import { EditMuscleDto } from '../dtos/muscles/edit_muscle.dto';
import { CreateMuscleGroupDto } from '../dtos/muscle_groups/create_muscle_group.dto';
import { EditMuscleGroupDto } from '../dtos/muscle_groups/edit_muscle_group.dto';
import { Muscle } from '../entities/muscle.entity';
import { MuscleGroup } from '../entities/muscle_group.entity';
import { UserRole } from '../entities/user.entity';
import { Auth } from '../authentication/decorators/auth.decorator';

@ApiTags('Muscles')
@Controller('muscles')
export class MusclesController {
    constructor(private musclesService: MusclesService) { }

    @Get('/all')
    @ApiResponse({ status: 200, type: [Muscle] })
    async getAllMuscles(
        @Res() res: Response
    ) {
        await this.musclesService.getAllMuscles(res);
    }

    @Get('/get/:id')
    @ApiResponse({ status: 200, type: Muscle })
    async getMuscleById(@Param() muscleId: ParameterIdDto, @Res() res: Response) {
        await this.musclesService.getMuscleById(muscleId.id, res);
    }

    @Post('create')
    @Auth(UserRole.admin)
    @ApiResponse({ status: 201, type: Muscle })
    async createMuscle(
        @Body() createMuscleDto: CreateMuscleDto,
        @Res() res: Response,
    ) {
        await this.musclesService.createMuscle(createMuscleDto, res);
    }

    @Post('edit/:id')
    @Auth(UserRole.admin)
    @ApiResponse({ status: 200, type: Muscle })
    async editMuscle(
        @Param() idMuscle: ParameterIdDto,
        @Body() editMuscleDto: EditMuscleDto,
        @Res() res: Response,
    ) {
        await this.musclesService.editMuscle(idMuscle.id, editMuscleDto, res);
    }

    @Delete(':id')
    @Auth(UserRole.admin)
    @ApiResponse({ status: 200 })
    @ApiResponse({ status: 404, description: 'Músculo no encontrado' })
    @ApiResponse({ status: 409, description: 'El músculo está asociado a ejercicios y no se puede eliminar' })
    async deleteMuscle(
        @Param() idMuscle: ParameterIdDto,
        @Res() res: Response,
    ) {
        await this.musclesService.deleteMuscle(idMuscle.id, res);
    }

    @Get('mg/all')
    @ApiResponse({ status: 200, type: [MuscleGroup] })
    async getAllMuscleGroups(
        @Res() res: Response
    ) {
        await this.musclesService.getAllMuscleGroups(res);
    }

    @Get('mg/get/:id')
    @ApiResponse({ status: 200, type: MuscleGroup })
    async getMuscleGroupId(@Param() idMuscleGroup: ParameterIdDto, @Res() res: Response) {
        await this.musclesService.getMuscleGroupId(idMuscleGroup.id, res);
    }

    @Post('mg/create')
    @Auth(UserRole.admin)
    @ApiResponse({ status: 201, type: MuscleGroup })
    @ApiResponse({ status: 409, description: 'Ya existe un grupo muscular con ese nombre' })
    async createMuscleGroup(
        @Body() createMuscleGroupDto: CreateMuscleGroupDto,
        @Res() res: Response,
    ) {
        await this.musclesService.createMuscleGroup(createMuscleGroupDto, res);
    }

    @Post('mg/edit/:id')
    @Auth(UserRole.admin)
    @ApiResponse({ status: 200, type: MuscleGroup })
    @ApiResponse({ status: 404, description: 'Grupo muscular no encontrado' })
    @ApiResponse({ status: 409, description: 'Otro grupo muscular ya tiene ese nombre' })
    async editMuscleGroup(
        @Param() idMuscleGroup: ParameterIdDto,
        @Body() editMuscleGroupDto: EditMuscleGroupDto,
        @Res() res: Response,
    ) {
        await this.musclesService.editMuscleGroup(idMuscleGroup.id, editMuscleGroupDto, res);
    }

    @Delete('mg/:id')
    @Auth(UserRole.admin)
    @ApiResponse({ status: 200 })
    @ApiResponse({ status: 404, description: 'Grupo muscular no encontrado' })
    @ApiResponse({ status: 409, description: 'El grupo muscular todavía tiene músculos y no se puede eliminar' })
    async deleteMuscleGroup(
        @Param() idMuscleGroup: ParameterIdDto,
        @Res() res: Response,
    ) {
        await this.musclesService.deleteMuscleGroup(idMuscleGroup.id, res);
    }
}

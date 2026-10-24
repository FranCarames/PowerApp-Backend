import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Res,
} from '@nestjs/common';
import { ApiTags, ApiResponse, ApiExtraModels, getSchemaPath } from '@nestjs/swagger';
import { CoachService } from './coach.service';
import { Response } from 'express';
import { ParameterIdDto } from '../dtos/parameter_id.dto';
import { PromoteCoachDto } from '../dtos/coach/promote_coach.dto';
import { Coach } from '../entities/coach.entity';
import { User, UserRole } from '../entities/user.entity';
import { Auth } from '../authentication/decorators/auth.decorator';

@ApiTags('Coach')
@ApiExtraModels(User, Coach)
@Controller('coach')
export class CoachController {

    constructor(private coachService: CoachService) { }

    @Get('/all')
    @Auth(UserRole.admin)
    @ApiResponse({ status: 200, type: [Coach] })
    async getAllCoaches(
        @Res() res: Response
    ) {
        await this.coachService.getAllCoaches(res);
    }

    @Get('/get/:id')
    @Auth(UserRole.admin)
    @ApiResponse({ status: 200, type: Coach })
    async getUserId(@Param() idUser: ParameterIdDto, @Res() res: Response) {
        await this.coachService.getCoachId(idUser.id, res);
    }

    // CU-A-17, y CU-A-18 sobre un entrenador que ya existe: reactiva y edita sus datos profesionales
    @Post('/promote_user')
    @Auth(UserRole.admin)
    @ApiResponse({ status: 200, type: User, description: 'El alumno quedó como entrenador. Sobre un entrenador dado de baja lo reactiva, y sobre uno activo edita su email profesional y su CUIL' })
    @ApiResponse({ status: 400, description: 'Datos inválidos, o el usuario es un administrador (no se convierte en entrenador)' })
    @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
    @ApiResponse({ status: 409, description: 'El email profesional o el CUIL ya son de otro entrenador (también de uno dado de baja)' })
    async promoteUserToCoach(
        @Body() promoteCoachDto: PromoteCoachDto,
        @Res() res: Response,
    ) {
        await this.coachService.promoteUserToCoach(promoteCoachDto, res);
    }

    @Post('/delete_coach/:id')
    @Auth(UserRole.admin)
    @ApiResponse({
        status: 200,
        schema: {
            allOf: [
                { $ref: getSchemaPath(User) },
                {
                    properties: {
                        coach: {
                            allOf: [
                                { $ref: getSchemaPath(Coach) },
                                { properties: { active: { type: 'boolean', example: false } } }
                            ]
                        }
                    }
                }
            ]
        }
    })
    async deleteCoach(
        @Param() idCoach: ParameterIdDto,
        @Res() res: Response,
    ) {
        await this.coachService.deleteCoach(idCoach.id, res);
    }
}

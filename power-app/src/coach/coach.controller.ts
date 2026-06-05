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
import { CoachService } from './coach.service';
import { Response } from 'express';
import { ParameterIdDto } from '../dtos/parameter_id.dto';
import { PromoteCoachDto } from '../dtos/coach/promote_coach.dto';
import { AuthenticableDTO } from '../dtos/authenticable.dto';
import { Coach } from '../entities/coach.entity';

@ApiTags('Coach')
@ApiBearerAuth()
@Controller('coach')
export class CoachController {

    constructor(private coachService: CoachService) { }

    @Get('/all')
    @ApiResponse({ status: 200, type: [Coach] })
    async getAllCoaches(
        @Res() res: Response
    ) {
        this.coachService.getAllCoaches(res);
    }

    @Get('/get/:id')
    @ApiResponse({ status: 200, type: Coach })
    async getUserId(@Param() idUser: ParameterIdDto, @Res() res: Response) {
        this.coachService.getCoachId(idUser.id, res);
    }

    @Post('/promote_user')
    @ApiResponse({ status: 201, type: Coach })
    async promoteUserToCoach(
        @Headers() header: AuthenticableDTO,
        @Body() promoteCoachDto: PromoteCoachDto,
        @Res() res: Response,
    ) {
        const accessToken = header.authorization;

        if (accessToken) {
            this.coachService.promoteUserToCoach(accessToken, promoteCoachDto, res);
        } else {
            res.status(401).send({ error: 'Access Token no encontrado.' });
        }
    }

    @Post('/delete_coach/:id')
    @ApiResponse({ status: 200 })
    async deleteCoach(
        @Headers() header: AuthenticableDTO,
        @Param() idCoach: ParameterIdDto,
        @Res() res: Response,
    ) {
        const accessToken = header.authorization;

        if (accessToken) {
            this.coachService.deleteCoach(accessToken, idCoach.id, res);
        } else {
            res.status(401).send({ error: 'Access Token no encontrado.' });
        }
    }
}

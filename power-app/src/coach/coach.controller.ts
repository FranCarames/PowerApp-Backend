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
import { CoachService } from './coach.service';
import { Response } from 'express';
import { ParameterIdDto } from '../dtos/parameter_id.dto';
import { PromoteCoachDto } from '../dtos/coach/promote_coach.dto';
import { AuthenticableDTO } from '../dtos/authenticable.dto';

@Controller('coach')
export class CoachController {

    constructor(private coachService: CoachService) { }
    @Get('/all')
    async getAllCoaches(
        @Res() res: Response
    ) {
        this.coachService.getAllCoaches(res);
    }

    @Get('/get/:id')
    async getUserId(@Param() idUser: ParameterIdDto, @Res() res: Response) {
        this.coachService.getCoachId(idUser.id, res);
    }

    @Post('/promote_user')
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
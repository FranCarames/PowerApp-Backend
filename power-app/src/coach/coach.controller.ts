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
    @Auth(UserRole.admin)
    @ApiResponse({ status: 200, type: User })
    async promoteUserToCoach(
        @Body() promoteCoachDto: PromoteCoachDto,
        @Res() res: Response,
    ) {
        this.coachService.promoteUserToCoach(promoteCoachDto, res);
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
        this.coachService.deleteCoach(idCoach.id, res);
    }
}

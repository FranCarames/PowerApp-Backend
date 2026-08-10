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
import { MembershipService } from './membership.service';
import { Response } from 'express';
import { ParameterIdDto } from '../dtos/parameter_id.dto';
import { CreateMembershipDto } from '../dtos/membership/create_membership.dto';
import { EditMembershipDto } from '../dtos/membership/edit_membership.dto';
import { RegisterMembershipPaymentDto } from '../dtos/membership/register_membership_payment.dto';
import { SetMembershipActiveDto } from '../dtos/membership/set_membership_active.dto';
import { Membership } from '../entities/membership.entity';
import { MembershipPayment } from '../entities/membership_payment.entity';
import { UserRole } from '../entities/user.entity';
import { Auth } from '../authentication/decorators/auth.decorator';

@ApiTags('Membership')
@Controller('membership')
export class MembershipController {
    constructor(private membershipService: MembershipService) { }

    @Get('/all')
    @ApiResponse({ status: 200, type: [Membership] })
    async getAllMemberships(
        @Res() res: Response
    ) {
        this.membershipService.getAllMemberships(res);
    }

    @Get('/get/:id')
    @ApiResponse({ status: 200, type: Membership })
    async getMembershipById(@Param() membershipId: ParameterIdDto, @Res() res: Response) {
        this.membershipService.getMembershipById(membershipId.id, res);
    }

    @Post('create')
    @Auth(UserRole.admin)
    @ApiResponse({ status: 201, type: Membership })
    async createMembership(
        @Body() createMembershipDto: CreateMembershipDto,
        @Res() res: Response,
    ) {
        this.membershipService.createMembership(createMembershipDto, res);
    }

    @Post('edit/:id')
    @Auth(UserRole.admin)
    @ApiResponse({ status: 200, type: Membership })
    async editMembership(
        @Param() idMembership: ParameterIdDto,
        @Body() editMembershipDto: EditMembershipDto,
        @Res() res: Response,
    ) {
        this.membershipService.editMembership(idMembership.id, editMembershipDto, res);
    }

    @Post('set-active/:id')
    @Auth(UserRole.admin)
    @ApiResponse({ status: 200, type: Membership })
    async setMembershipActive(
        @Param() idMembership: ParameterIdDto,
        @Body() setMembershipActiveDto: SetMembershipActiveDto,
        @Res() res: Response,
    ) {
        this.membershipService.setMembershipActive(idMembership.id, setMembershipActiveDto, res);
    }

    @Get('payment/user/:id')
    @Auth(UserRole.user, UserRole.coach, UserRole.admin)
    @ApiResponse({ status: 200, type: [MembershipPayment] })
    async getUserMembershipPayments(
        @Param() userId: ParameterIdDto,
        @Res() res: Response,
    ) {
        this.membershipService.getUserMembershipPayments(userId.id, res);
    }

    @Post('payment/register')
    @Auth(UserRole.coach, UserRole.admin)
    @ApiResponse({ status: 201, type: MembershipPayment })
    async registerMembershipPayment(
        @Body() registerMembershipPaymentDto: RegisterMembershipPaymentDto,
        @Res() res: Response,
    ) {
        this.membershipService.registerMembershipPayment(registerMembershipPaymentDto, res);
    }
}

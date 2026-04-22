import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Res,
} from '@nestjs/common';
import { MembershipService } from './membership.service';
import { Response } from 'express';
import { ParameterIdDto } from '../dtos/parameter_id.dto';
import { CreateMembershipDto } from '../dtos/membership/create_membership.dto';
import { EditMembershipDto } from '../dtos/membership/edit_membership.dto';
import { RegisterMembershipPaymentDto } from '../dtos/membership/register_membership_payment.dto';

@Controller('membership')
export class MembershipController {
    constructor(private membershipService: MembershipService) { }

    @Get('/all')
    async getAllMemberships(
        @Res() res: Response
    ) {
        this.membershipService.getAllMemberships(res);
    }

    @Get('/get/:id')
    async getMembershipById(@Param() membershipId: ParameterIdDto, @Res() res: Response) {
        this.membershipService.getMembershipById(membershipId.id, res);
    }

    @Post('create')
    async createMembership(
        @Body() createMembershipDto: CreateMembershipDto,
        @Res() res: Response,
    ) {
        this.membershipService.createMembership(createMembershipDto, res);
    }

    @Post('edit/:id')
    async editMembership(
        @Param() idMembership: ParameterIdDto,
        @Body() editMembershipDto: EditMembershipDto,
        @Res() res: Response,
    ) {
        this.membershipService.editMembership(idMembership.id, editMembershipDto, res);
    }

    @Post('register-payment')
    async registerMembershipPayment(
        @Body() registerMembershipPaymentDto: RegisterMembershipPaymentDto,
        @Res() res: Response,
    ) {
        this.membershipService.registerMembershipPayment(registerMembershipPaymentDto, res);
    }
}

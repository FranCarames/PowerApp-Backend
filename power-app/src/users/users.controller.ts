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
import { ApiTags, ApiResponse, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { Response } from 'express';
import { ParameterIdDto } from '../dtos/parameter_id.dto';
import { CreateUserDto } from '../dtos/user/create_user.dto';
import { LoginUserDto } from '../dtos/user/login_user.dto';
import { GetUsersQueryDto } from '../dtos/user/get_users_query.dto';
import { PaginatedUsersResponseDto } from '../dtos/user/paginated_users_response.dto';
import { SetUserActiveDto } from '../dtos/user/set_user_active.dto';
import { User } from '../entities/user.entity';

@ApiTags('Users')
@Controller('users')
export class UsersController {

    constructor(private usersService: UsersService) { }

    @Get('/all')
    @ApiResponse({ status: 200, type: PaginatedUsersResponseDto })
    async getAllUsers(
        @Query() query: GetUsersQueryDto,
        @Res() res: Response
    ) {
        this.usersService.getAllUsers(query, res);
    }

    @Get('/get/:id')
    @ApiResponse({ status: 200, type: User })
    async getUserId(@Param() idUser: ParameterIdDto, @Res() res: Response) {
        this.usersService.getUserId(idUser.id, res);
    }

    @Post('/register')
    @ApiResponse({ status: 201, type: User, headers: { Authorization: { description: 'Bearer JWT token', schema: { type: 'string' } } } })
    async createUser(
        @Body() createUserDto: CreateUserDto,
        @Res() res: Response,
    ) {
        this.usersService.createUser(createUserDto, res);
    }

    @Post('/login')
    @ApiResponse({ status: 200, type: User, headers: { Authorization: { description: 'Bearer JWT token', schema: { type: 'string' } } } })
    async loginUser(
        @Body() loginUserDto: LoginUserDto,
        @Res() res: Response,
    ) {
        this.usersService.loginUser(loginUserDto, res);
    }

    @Post('/set-active/:id')
    @ApiResponse({ status: 200, type: User })
    async setUserActive(
        @Param() idUser: ParameterIdDto,
        @Body() setUserActiveDto: SetUserActiveDto,
        @Res() res: Response,
    ) {
        this.usersService.setUserActive(idUser.id, setUserActiveDto, res);
    }
}

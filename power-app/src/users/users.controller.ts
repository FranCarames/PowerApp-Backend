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
import { RecoverPasswordDto } from '../dtos/user/recover_password.dto';
import { ChangePasswordDto } from '../dtos/user/change_password.dto';
import { EditUserDto } from '../dtos/user/edit_user.dto';
import { User, UserRole } from '../entities/user.entity';
import { Auth } from '../authentication/decorators/auth.decorator';
import { CurrentUser } from '../authentication/decorators/current-user.decorator';
import { AuthUser } from '../authentication/auth-user.interface';

@ApiTags('Users')
@Controller('users')
export class UsersController {

    constructor(private usersService: UsersService) { }

    @Get('/all')
    @Auth()
    @ApiResponse({ status: 200, type: PaginatedUsersResponseDto })
    async getAllUsers(
        @Query() query: GetUsersQueryDto,
        @Res() res: Response
    ) {
        this.usersService.getAllUsers(query, res);
    }

    @Get('/get/:id')
    @Auth(UserRole.user, UserRole.coach, UserRole.admin)
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

    @Post('/logout')
    @ApiResponse({ status: 200 })
    async logout(@Res() res: Response) {
        this.usersService.logout(res);
    }

    @Post('/recover-password')
    @ApiResponse({ status: 200 })
    async recoverPassword(
        @Body() recoverPasswordDto: RecoverPasswordDto,
        @Res() res: Response,
    ) {
        this.usersService.recoverPassword(recoverPasswordDto, res);
    }

    @Post('/set-active/:id')
    @Auth(UserRole.coach, UserRole.admin)
    @ApiResponse({ status: 200, type: User })
    async setUserActive(
        @Param() idUser: ParameterIdDto,
        @Body() setUserActiveDto: SetUserActiveDto,
        @Res() res: Response,
    ) {
        this.usersService.setUserActive(idUser.id, setUserActiveDto, res);
    }

    @Post('/change-password')
    @Auth()
    @ApiResponse({ status: 200, description: 'Contraseña actualizada' })
    @ApiResponse({ status: 401, description: 'La contraseña actual es incorrecta' })
    async changePassword(
        @CurrentUser() user: AuthUser,
        @Body() changePasswordDto: ChangePasswordDto,
        @Res() res: Response,
    ) {
        this.usersService.changePassword(user.id, changePasswordDto, res);
    }

    @Post('/edit')
    @Auth()
    @ApiResponse({ status: 200, type: User })
    @ApiResponse({ status: 409, description: 'El email ya está en uso por otro usuario' })
    async editUser(
        @CurrentUser() user: AuthUser,
        @Body() editUserDto: EditUserDto,
        @Res() res: Response,
    ) {
        this.usersService.editUser(user.id, editUserDto, res);
    }
}

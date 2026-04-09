import {
  Controller,
  Post,
  Body,
  Headers,
  Res,
  ValidationPipe,
} from '@nestjs/common';
import { AutheticationService } from './authetication.service';
import { Response } from 'express';

// import { AppleDTO, FacebookDTO, GoogleDTO, RegisterUserDto } from 'src/dtos/auth/register.dto';
// import { PrelaunchRegisterUserDto } from 'src/dtos/auth/prelaunch_register.dto';
// import { LoginUserDto } from 'src/dtos/auth/login.dto';
// import { ForgotPasswordDto } from 'src/dtos/auth/forgot_password.dto';
// import { AuthenticableDTO } from 'src/dtos/auth/authenticable.dto';
// import { ErrorCodes, getErrorObject } from 'src/schemas/error_code.schema';

@Controller('auth')
export class AutheticationController {
  constructor(private authService: AutheticationService) { }

//   @Post('email_available')
//   async emailAvailable(@Body('email') email: string, @Res() res: Response) {
//     if (email) {
//       return this.authService.emailAvailable(email, res);
//     } else {
//       const error = {
//         message: ['No se recibio el email'],
//         statusCode: 400,
//         error: 'Bad Request',
//         code: 'EMAIL_NOT_RECEIVED',
//       };
//       res.status(401).send(error);
//     }
//   }

//   @Post('register')
//   async register(
//     @Body(new ValidationPipe({ transform: true })) newUser: RegisterUserDto,
//     @Res() res: Response,
//   ) {
//     return this.authService.register(newUser, res);
//   }

//   @Post('login')
//   async login(
//     @Body(new ValidationPipe({ transform: true })) loginUser: LoginUserDto,
//     @Res() res: Response,
//   ) {
//     return this.authService.login(loginUser, res);
//   }

//   @Post('forgot_password')
//   async forgot_password(
//     @Body() forgotUser: ForgotPasswordDto,
//     @Res() res: Response,
//   ) {
//     return this.authService.forgotPassword(forgotUser, res);
//   }

//   @Post('logout')
//   async logout(@Res() res: Response, @Headers() header: AuthenticableDTO) {
//     const access_token = header.authorization;

//     if (access_token) {
//       return this.authService.logout(access_token, res);
//     } else {
//       res.status(401).send(getErrorObject(ErrorCodes.noAccessTokenInput));
//     }
//   }

//   @Post('/register_google')
//   async googleRegister(
//     @Body()
//     googleDTO: GoogleDTO,
//     @Res() res: Response,
//   ) {
//     return this.authService.googleRegister(googleDTO, res);
//   }

//   @Post('/register_fb')
//   async facebookRegister(
//     @Body()
//     facebookDTO: FacebookDTO,
//     @Res() res: Response,
//   ) {
//     return this.authService.facebookRegister(facebookDTO, res);
//   }

//   @Post('/register_apple')
//   async appleRegister(
//     @Body()
//     appleDTO: AppleDTO,
//     @Res() res: Response,
//   ) {
//     // return this.authService.appleRegister(appleDTO, res);
//   }
}

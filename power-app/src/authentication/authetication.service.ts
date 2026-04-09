import { Injectable, Res } from '@nestjs/common';
// import { InjectModel } from '@nestjs/mongoose';
// import { Model } from 'mongoose';
// import { Response } from 'express';
// import { AuthService } from './auth/auth.service';
// import { User } from 'src/schemas/users/user.schema';
// import { PrelaunchUser } from 'src/schemas/users/prelaunch_user.schema';
// import { AppleDTO, FacebookDTO, GoogleDTO, RegisterUserDto } from 'src/dtos/auth/register.dto';
// import { LoginUserDto } from 'src/dtos/auth/login.dto';
// import { ForgotPasswordDto } from 'src/dtos/auth/forgot_password.dto';
// import { PrelaunchRegisterUserDto } from 'src/dtos/auth/prelaunch_register.dto';
// import { TransporterNodemail } from 'src/resources/components/transporter.nodemail';
// import { ErrorCodes, getErrorObject } from 'src/schemas/error_code.schema';
// import { UserResponse } from 'src/responses/users/user.response';
// import { PasswordGenerator } from 'src/resources/functions/password_generator';
// import { PaymentService } from 'src/payment/payment.service';
// import * as bcrypt from 'bcrypt';
// import { Notification, createNotificationInstance } from 'src/schemas/notification.schema';

@Injectable()
export class AutheticationService {
//   constructor(
//     @InjectModel(User.name) private userModel: Model<User>,
//     @InjectModel(PrelaunchUser.name) private prelaunchUserModel: Model<PrelaunchUser>,
//     @InjectModel(Notification.name) private notificationModel: Model<Notification>,
//     private authService: AuthService,
//     private paymentService: PaymentService,
//   ) { }

//   async pre_register(user: PrelaunchRegisterUserDto, @Res() res: Response) {
//     const userExistent = await this.prelaunchUserModel.findOne({
//       email: user.email.toLowerCase(),
//     });

//     if (userExistent) {
//       res.status(409).send(getErrorObject(ErrorCodes.emailAlreadyInUse));
//     } else {
//       const createdUser = new this.prelaunchUserModel(user);

//       const emailSender = new TransporterNodemail();
//       emailSender.sendPreregisterEmail(user.email, user.first_name);

//       const currentDate = new Date();

//       createdUser.created_at = currentDate.getTime();
//       createdUser.updated_at = currentDate.getTime();

//       createdUser.save();

//       res.status(201).send(createdUser);
//     }
//   }

//   async isUserEmailPreRegistered(email: string): Promise<boolean> {
//     const userExistent = await this.prelaunchUserModel
//       .findOne({ email: email.toLowerCase() })
//       .exec();

//     if (userExistent) {
//       return true
//     } else {
//       return false
//     }
//   }

//   async emailAvailable(email: string, @Res() res: Response) {
//     const userExistent = await this.userModel
//       .findOne({ email: email.toLowerCase() })
//       .exec();

//     if (userExistent) {
//       res.status(201).send({ email_available: false });
//     } else {
//       res.status(201).send({ email_available: true });
//     }
//   }

//   async register(user: RegisterUserDto, @Res() res: Response) {
//     const userExistent = await this.userModel
//       .findOne({ email: user.email.toLowerCase() })
//       .exec();

//     if (userExistent) {
//       res.status(409).send(getErrorObject(ErrorCodes.emailAlreadyInUse));
//     } else {
//       const hashedPassword = await this.authService.hashPassword(user.password);

//       const registeredUser = new this.userModel(user);

//       const stripeCustomerId = await this.paymentService.createCustomer(user.first_name, user.last_name, user.email)
//       const stripeAccountId = await this.paymentService.createAccount(registeredUser._id.toString(), user.first_name, user.last_name, user.email)

//       const currentDate = new Date();

//       registeredUser.id = registeredUser._id;
//       registeredUser.password = hashedPassword;
//       registeredUser.created_at = currentDate.getTime();
//       registeredUser.updated_at = currentDate.getTime();
//       registeredUser.should_change_password = false;

//       registeredUser.stripe_customer_id = stripeCustomerId;
//       registeredUser.stripe_account_id = stripeAccountId;
//       registeredUser.stripe_account_completed = false;

//       registeredUser.is_pre_registered = await this.isUserEmailPreRegistered(registeredUser.email);

//       await registeredUser.save();

//       this.sendEmailAndNotification(registeredUser)

//       const token = await this.authService.generateJwtToken(registeredUser.id);
//       const response = new UserResponse(registeredUser);

//       response.addAccessToken(token);

//       res.status(201).send(response);
//     }
//   }

//   async sendEmailAndNotification(registeredUser: User) {
//     const newNotificationInstance = createNotificationInstance(
//       registeredUser.id,
//       "Welcome to BagChatter!",
//       "The BagChatter team gives you the warmest welcome and is excited to have you on board as part of our community. Get ready to dive into the world of golf, shared experiences, and the joy of connecting with fellow BagChatter enthusiasts. Let the fun begin!",
//       "WELCOME_MESSAGE"
//     )
//     const notification = new this.notificationModel(newNotificationInstance);
//     notification.is_read = false;
//     notification.save();

//     const emailSender = new TransporterNodemail();
//     emailSender.sendNotificationEmail(registeredUser.email, registeredUser.email, notification.title, notification.description);
//   }

//   async login(user: LoginUserDto, @Res() res: Response) {
//     try {
//       const authenticatedUser = await this.authService.authenticateUser(user);

//       if (authenticatedUser) {
//         const token = await this.authService.generateJwtToken(
//           authenticatedUser.id,
//         );
//         const response = new UserResponse(authenticatedUser);

//         response.addAccessToken(token);

//         res.status(201).send(response);
//       } else {
//         try {
//           const authenticatedUser =
//             await this.authService.authenticateTemporaryPassword(user);

//           if (authenticatedUser) {
//             const token = await this.authService.generateJwtToken(
//               authenticatedUser.id,
//             );
//             const response = new UserResponse(authenticatedUser);

//             response.addAccessToken(token);

//             res.status(201).send(response);
//           } else {
//             res.status(404).send(getErrorObject(ErrorCodes.emailNotRegistered));
//           }
//         } catch {
//           res.status(409).send(getErrorObject(ErrorCodes.wrongCredentials));
//         }
//       }
//     } catch (error) {
//       res.status(409).send(getErrorObject(ErrorCodes.wrongCredentials));
//     }
//   }

//   async forgotPassword(forgotUser: ForgotPasswordDto, @Res() res: Response) {
//     const recoverUser = await this.userModel.findOne({
//       email: forgotUser.email,
//     });

//     if (recoverUser) {
//       const passGenerator = new PasswordGenerator();
//       const newPassword = passGenerator.generateRandomPassword();

//       const hashedPassword = await this.authService.hashPassword(newPassword);

//       recoverUser.should_change_password = true;
//       recoverUser.password_recovery = hashedPassword;
//       recoverUser.updated_at = new Date().getTime();
//       recoverUser.save();

//       const emailSender = new TransporterNodemail();
//       emailSender.sendRecoveryEmail(
//         forgotUser.email,
//         recoverUser.first_name ?? 'User',
//         newPassword,
//       );

//       res
//         .status(201)
//         .send(getErrorObject(ErrorCodes.forgotPasswordEmailSentSuccessfully));
//     } else {
//       res.status(401).send(getErrorObject(ErrorCodes.emailNotRegistered));
//     }
//   }

//   async logout(accessToken: string, @Res() res: Response) {
//     const userId = await this.authService.verifyJwtToken(accessToken);

//     if (userId) {
//       const userToUpdate = await this.userModel.findOne({ _id: userId });

//       if (userToUpdate) {
//         /// realizar logout borrar device token
//         res
//           .status(200)
//           .send(getErrorObject(ErrorCodes.userLoggedOutSuccessfully));
//       } else {
//         res.status(401).send(getErrorObject(ErrorCodes.userUnauthorized));
//       }

//       return userId;
//     } else {
//       res.status(401).send(getErrorObject(ErrorCodes.userUnauthorized));
//     }
//   }

//   async googleRegister(googleDTO: GoogleDTO, @Res() res: Response) {
//     const data = await this.getGoogleData(googleDTO);
//     return await this.mediaRegister(res, data);
//   }

//   async getGoogleData(googleDTO: GoogleDTO): Promise<RegisterUserDto | null> {
//     return new Promise((resolve, reject) => {
//       const https = require('https');
//       const endpoint = '/tokeninfo?id_token=';
//       const options = {
//         host: 'oauth2.googleapis.com',
//         port: 443,
//         path: endpoint + googleDTO.google_token,
//         method: 'GET',
//       };

//       const req = https.request(options, (response) => {
//         const chunks: Buffer[] = [];

//         response.on('data', (chunk) => {
//           chunks.push(chunk);
//         });

//         response.on('end', () => {
//           const responseBody = Buffer.concat(chunks).toString();
//           console.log('BODY:', responseBody);

//           try {
//             const data = JSON.parse(responseBody);
//             if (!data.email) {
//               resolve(null);
//             }
//             const registerInstance = new RegisterUserDto();
//             registerInstance.first_name = data.given_name;
//             registerInstance.last_name = data.family_name;
//             registerInstance.email = data.email;
//             registerInstance.profile_picture = data.picture;
//             registerInstance.google_id = data.sub;
//             resolve(registerInstance);
//           } catch (error) {
//             console.error('Error parsing JSON:', error);
//             resolve(null);
//           }
//         });
//       });

//       req.on('error', function (e) {
//         console.log('problem with request: ' + e.message);
//         resolve(null);
//       });

//       req.end();
//     });
//   }

//   async facebookRegister(facebookDTO: FacebookDTO, @Res() res: Response) {
//     const data = await this.getFacebookData(facebookDTO);
//     return await this.mediaRegister(res, data);
//   }

//   async getFacebookData(
//     facebookDTO: FacebookDTO,
//   ): Promise<RegisterUserDto | null> {
//     return new Promise((resolve, reject) => {
//       const https = require('https');
//       const endpoint = '?fields=id,name,email,picture&access_token=';
//       const options = {
//         host: 'graph.facebook.com',
//         port: 443,
//         path: '/' + facebookDTO.fb_id + endpoint + facebookDTO.fb_token,
//         method: 'GET',
//       };

//       const req = https.request(options, (response) => {
//         const chunks: Buffer[] = [];

//         response.on('data', (chunk) => {
//           chunks.push(chunk);
//         });

//         response.on('end', () => {
//           const responseBody = Buffer.concat(chunks).toString();
//           console.log('BODY:', responseBody);

//           try {
//             const data = JSON.parse(responseBody);
//             if (!data.email) {
//               resolve(null);
//             }
//             const registerInstance = new RegisterUserDto();
//             registerInstance.first_name = data.first_name;
//             registerInstance.last_name = data.last_name;
//             registerInstance.email = data.email;
//             registerInstance.profile_picture = `https://graph.facebook.com/${data.id}/picture?type=large&redirect=true&width=500&height=500`;
//             registerInstance.facebook_id = data.id;
//             resolve(registerInstance);
//           } catch (error) {
//             console.error('Error parsing JSON:', error);
//             resolve(null);
//           }
//         });
//       });

//       req.on('error', function (e) {
//         console.log('problem with request: ' + e.message);
//         resolve(null);
//       });

//       req.end();
//     });
//   }

//   async appleRegister(
//     appleDto: AppleDTO,
//     @Res() res: Response
//   ) {
//   }

//   // async getAppleData(
//   //   facebookDTO: AppleDTO,
//   // ): Promise<RegisterUserDto | null> {
//   //   return new Promise((resolve, reject) => {
//   //     const https = require('https');
//   //     const endpoint = '?fields=id,name,email,picture&access_token=';
//   //     const options = {
//   //       host: 'graph.facebook.com',
//   //       port: 443,
//   //       // path: '/' + facebookDTO.fb_id + endpoint + facebookDTO.fb_token,
//   //       method: 'GET',
//   //     };

//   //     const req = https.request(options, (response) => {
//   //       const chunks: Buffer[] = [];

//   //       response.on('data', (chunk) => {
//   //         chunks.push(chunk);
//   //       });

//   //       response.on('end', () => {
//   //         const responseBody = Buffer.concat(chunks).toString();
//   //         console.log('BODY:', responseBody);

//   //         try {
//   //           const data = JSON.parse(responseBody);
//   //           if (!data.email) {
//   //             resolve(null);
//   //           }
//   //           const registerInstance = new RegisterUserDto();
//   //           registerInstance.first_name = data.first_name;
//   //           registerInstance.last_name = data.last_name;
//   //           registerInstance.email = data.email;
//   //           registerInstance.profile_picture = `https://graph.facebook.com/${data.id}/picture?type=large&redirect=true&width=500&height=500`;
//   //           registerInstance.facebook_id = data.id;
//   //           resolve(registerInstance);
//   //         } catch (error) {
//   //           console.error('Error parsing JSON:', error);
//   //           resolve(null);
//   //         }
//   //       });
//   //     });

//   //     req.on('error', function (e) {
//   //       console.log('problem with request: ' + e.message);
//   //       resolve(null);
//   //     });

//   //     req.end();
//   //   });
//   // }

//   async mediaRegister(
//     @Res() res: Response,
//     data: RegisterUserDto,
//   ) {
//     if (!data) {
//       res.status(500).send(getErrorObject(ErrorCodes.genericError));
//       return;
//     }

//     const userExistent = await this.userModel
//       .findOne({
//         email: data.email.toLowerCase(),
//       });
//     if (userExistent) {
//       userExistent.first_name = data.first_name
//       userExistent.last_name = data.last_name
//       userExistent.profile_picture = data.profile_picture
//       userExistent.save()
//       const token = await this.authService.generateJwtToken(userExistent.id);
//       const response = new UserResponse(userExistent);
//       response.access_token = token;
//       res.status(200).send(response);
//       return;
//     }

//     const saltRounds = 10;
//     const passGenerator = new PasswordGenerator();
//     const newPassword = passGenerator.generateRandomPassword();
//     const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

//     const currentDate = new Date().getTime();
//     const registeredUser = new this.userModel(data);

//     const stripeCustomerId = await this.paymentService.createCustomer(registeredUser.first_name, registeredUser.last_name, registeredUser.email)
//     const stripeAccountId = await this.paymentService.createAccount(registeredUser._id.toString(), registeredUser.first_name, registeredUser.last_name, registeredUser.email)

//     registeredUser.id = registeredUser._id;
//     registeredUser.email = registeredUser.email.toLowerCase();

//     registeredUser.created_at = currentDate;
//     registeredUser.updated_at = currentDate;
//     registeredUser.password = hashedPassword;
//     registeredUser.should_change_password = false;

//     registeredUser.stripe_customer_id = stripeCustomerId;
//     registeredUser.stripe_account_id = stripeAccountId;
//     registeredUser.stripe_account_completed = false;

//     registeredUser.is_pre_registered = await this.isUserEmailPreRegistered(registeredUser.email);

//     registeredUser.save();

//     this.sendEmailAndNotification(registeredUser)

//     const token = await this.authService.generateJwtToken(registeredUser.id);
//     const response = new UserResponse(registeredUser);
//     response.access_token = token;
//     res.status(201).send(response);
//     return;
//   }
}

import { Injectable } from '@nestjs/common';
// import * as jwt from 'jsonwebtoken';
// import { jwtConstants } from 'config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LoginUserDto } from '../dtos/user/login_user.dto';
import { User } from '../entities/user.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt/dist/jwt.service';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
        private readonly jwtService: JwtService,
    ) {
    }

  async generateJwtToken(userId: string): Promise<string> {
    const payload = { sub: userId };
    // return jwt.sign(payload, jwtConstants.secret, { expiresIn: '7d' });
    return this.jwtService.sign(payload)
    
  }

//   async verifyJwtToken(token: string): Promise<string | null> {
//     try {
//       const decoded = jwt.verify(token, jwtConstants.secret, {
//         ignoreExpiration: false,
//       });

//       const userId = decoded.sub;

//       if (typeof userId === 'string') {
//         // console.log(userId)
//         return userId; // Token válido
//       } else {
//         console.error('Token decodificado no contiene el userId.');
//       }
//     } catch (error) {
//       if (error instanceof jwt.TokenExpiredError) {
//         console.error('Token expirado:', error);
//       } else if (error instanceof jwt.JsonWebTokenError) {
//         console.error('Error en el token JWT:', error);
//       } else {
//         console.error('Error al verificar el token:', error);
//       }
//       throw error;
//     }

//     return null;
//   }

//   // TODO revisar validacion
//   async verifyAdminJwtToken(token: string): Promise<string | null> {
//     const userId = await this.verifyJwtToken(token);

//     const user = await this.userModel.findById(userId).select(['_id', 'type']).exec();

//     if(user.type == 'admin') {
//       return userId;
//     } else {
//       return null;
//     }
//   }

  async authenticateUser(userCredentials: LoginUserDto): Promise<User | null> {
    const { email, password } = userCredentials;

    // Buscar al usuario por su correo electrónico
    const user = await this.usersRepository.findOne({ where: { email } });

    if (!user) {
      return null; // No se encontró un usuario con el correo electrónico proporcionado
    }

    // Verificar la contraseña utilizando bcrypt
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (passwordMatch) {
      return user; // Las credenciales son válidas, se devuelve el usuario
    } else {
      return null; // Las credenciales no son válidas
    }
  }

  async authenticateTemporaryPassword(
    userCredentials: LoginUserDto,
  ): Promise<User | null> {
    const { email, password } = userCredentials;

    // Buscar al usuario por su correo electrónico
    const user = await this.usersRepository.findOne({ where: { email } });

    if (!user) {
      return null; // No se encontró un usuario con el correo electrónico proporcionado
    }

    // Verificar la contraseña utilizando bcrypt
    const passwordMatch = await bcrypt.compare(
      password,
      user.temp_password,
    );

    if (passwordMatch) {
      return user; // Las credenciales son válidas, se devuelve el usuario
    } else {
      return null; // Las credenciales no son válidas
    }
  }

  async hashPassword(password: string): Promise<string> {
        const saltRounds = 10; // Número de rondas de sal para el hashing
        // Hashea la contraseña antes de almacenarla
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        return hashedPassword;
    }
}



// import { Injectable } from '@nestjs/common';
// import * as jwt from 'jsonwebtoken';
// import { jwtConstants } from 'config';
// import { LoginUserDto } from 'src/dtos/auth/login.dto';
// import { User } from 'src/schemas/users/user.schema';
// import { InjectModel } from '@nestjs/mongoose';
// import { Model } from 'mongoose';
// import * as bcrypt from 'bcrypt';

// @Injectable()
// export class AuthService {
//   constructor(@InjectModel(User.name) private userModel: Model<User>) {}

//   async generateJwtToken(userId: string): Promise<string> {
//     const payload = { sub: userId };
//     return jwt.sign(payload, jwtConstants.secret, { expiresIn: '7d' });
//   }

//   async verifyJwtToken(token: string): Promise<string | null> {
//     try {
//       const decoded = jwt.verify(token, jwtConstants.secret, {
//         ignoreExpiration: false,
//       });

//       const userId = decoded.sub;

//       if (typeof userId === 'string') {
//         // console.log(userId)
//         return userId; // Token válido
//       } else {
//         console.error('Token decodificado no contiene el userId.');
//       }
//     } catch (error) {
//       if (error instanceof jwt.TokenExpiredError) {
//         console.error('Token expirado:', error);
//       } else if (error instanceof jwt.JsonWebTokenError) {
//         console.error('Error en el token JWT:', error);
//       } else {
//         console.error('Error al verificar el token:', error);
//       }
//       throw error;
//     }

//     return null;
//   }

//   // TODO revisar validacion
//   async verifyAdminJwtToken(token: string): Promise<string | null> {
//     const userId = await this.verifyJwtToken(token);

//     const user = await this.userModel.findById(userId).select(['_id', 'type']).exec();

//     if(user.type == 'admin') {
//       return userId;
//     } else {
//       return null;
//     }
//   }

//   async authenticateUser(userCredentials: LoginUserDto): Promise<User | null> {
//     const { email, password } = userCredentials;

//     // Buscar al usuario por su correo electrónico
//     const user = await this.userModel.findOne({ email }).exec();
//     user.id = user._id;

//     if (!user) {
//       return null; // No se encontró un usuario con el correo electrónico proporcionado
//     }

//     // Verificar la contraseña utilizando bcrypt
//     const passwordMatch = await bcrypt.compare(password, user.password);

//     if (passwordMatch) {
//       return user; // Las credenciales son válidas, se devuelve el usuario
//     } else {
//       return null; // Las credenciales no son válidas
//     }
//   }

//   async authenticateTemporaryPassword(
//     userCredentials: LoginUserDto,
//   ): Promise<User | null> {
//     const { email, password } = userCredentials;

//     // Buscar al usuario por su correo electrónico
//     const user = await this.userModel.findOne({ email }).exec();
//     user.id = user._id;

//     if (!user) {
//       return null; // No se encontró un usuario con el correo electrónico proporcionado
//     }

//     // Verificar la contraseña utilizando bcrypt
//     const passwordMatch = await bcrypt.compare(
//       password,
//       user.password_recovery,
//     );

//     if (passwordMatch) {
//       return user; // Las credenciales son válidas, se devuelve el usuario
//     } else {
//       return null; // Las credenciales no son válidas
//     }
//   }

//   async hashPassword(password: string): Promise<string> {
//     const saltRounds = 10; // Número de rondas de sal para el hashing
//     // Hashea la contraseña antes de almacenarla
//     const hashedPassword = await bcrypt.hash(password, saltRounds);

//     return hashedPassword;
//   }
// }
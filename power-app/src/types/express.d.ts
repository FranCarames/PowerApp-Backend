import { AuthUser } from '../authentication/auth-user.interface';

// Declaration merging: agrega `user` (el que setea JwtAuthGuard) al Request de Express.
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export {};

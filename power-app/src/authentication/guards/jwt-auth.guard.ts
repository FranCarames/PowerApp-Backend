import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from '../auth.service';

/**
 * Autentica la request: extrae el token del header Authorization
 * (tolera el prefijo `Bearer `), lo verifica y deja `{ id, role, active }`
 * en `request.user`. Rechaza con 401 si falta/está inválido, y con 403 si
 * la cuenta está deshabilitada (`active = false`).
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException('Access Token no encontrado.');
    }

    const user = await this.authService.getAuthUserFromToken(token);

    if (!user) {
      throw new UnauthorizedException('Token inválido o expirado.');
    }

    if (!user.active) {
      throw new ForbiddenException('La cuenta está deshabilitada.');
    }

    request.user = user;
    return true;
  }

  private extractToken(request: Request): string | null {
    const header = request.headers['authorization'];
    if (!header) {
      return null;
    }
    const value = header.startsWith('Bearer ') ? header.slice(7) : header;
    const token = value.trim();
    return token.length > 0 ? token : null;
  }
}

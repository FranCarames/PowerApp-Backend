import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { OWNER_PARAM_KEY } from '../decorators/owner.decorator';
import { UserRole } from '../../entities/user.entity';

/**
 * Check de dueño. Lee el parámetro que dejó `@Owner(...)` y, si quien llama es
 * un alumno, exige que ese parámetro sea su propio id. Sin `@Owner`, o con rol
 * coach/admin, deja pasar. Debe ejecutarse DESPUÉS de `JwtAuthGuard` (usa `request.user`).
 *
 * Los ids se comparan en minúscula: el token trae el id de la base (minúscula)
 * y un cliente puede mandarlo en mayúscula (el `uuidString` de iOS).
 */
@Injectable()
export class OwnerGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const param = this.reflector.getAllAndOverride<string>(OWNER_PARAM_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!param) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user;

    if (!user || user.role !== UserRole.user) {
      return true;
    }

    const ownerId = String(request.params[param] ?? '').toLowerCase();

    if (ownerId !== user.id.toLowerCase()) {
      throw new ForbiddenException('No podés acceder a los datos de otro usuario.');
    }

    return true;
  }
}

import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthUser } from '../auth-user.interface';

/**
 * Inyecta en el handler el usuario autenticado que dejó `JwtAuthGuard`
 * en `request.user`. Ej.: `promote(@CurrentUser() admin: AuthUser)`.
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthUser => {
    const request = context.switchToHttp().getRequest();
    return request.user;
  },
);

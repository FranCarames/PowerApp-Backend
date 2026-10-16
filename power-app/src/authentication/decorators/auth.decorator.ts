import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { OwnerGuard } from '../guards/owner.guard';
import { Roles } from './roles.decorator';
import { UserRole } from '../../entities/user.entity';

/**
 * Protege un endpoint en una sola línea: junta autenticación (`JwtAuthGuard`),
 * autorización por rol (`RolesGuard` + `@Roles`), el check de dueño (`OwnerGuard`,
 * inerte salvo que el endpoint declare `@Owner(...)`) y el candado de Swagger.
 *
 * - `@Auth(UserRole.admin)`            → sólo admin.
 * - `@Auth(UserRole.coach, UserRole.admin)` → coach o admin.
 * - `@Auth()`                          → cualquier usuario autenticado (sin filtro de rol).
 */
export function Auth(...roles: UserRole[]) {
  return applyDecorators(
    UseGuards(JwtAuthGuard, RolesGuard, OwnerGuard),
    Roles(...roles),
    ApiBearerAuth(),
  );
}

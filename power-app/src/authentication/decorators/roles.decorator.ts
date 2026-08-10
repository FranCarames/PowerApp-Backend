import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../entities/user.entity';

export const ROLES_KEY = 'roles';

/**
 * Marca los roles permitidos para un endpoint (o un controller entero).
 * Ej.: `@Roles(UserRole.admin)` o `@Roles(UserRole.coach, UserRole.admin)`.
 * Requiere `RolesGuard` (y `JwtAuthGuard` antes, que resuelve `request.user`).
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);

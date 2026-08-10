import { UserRole } from '../entities/user.entity';

/**
 * Identidad resuelta de la request autenticada.
 * La arma `JwtAuthGuard` (a partir del token) y queda en `request.user`.
 */
export interface AuthUser {
  id: string;
  role: UserRole;
  active: boolean;
}

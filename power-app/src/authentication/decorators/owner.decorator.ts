import { applyDecorators, SetMetadata } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';

export const OWNER_PARAM_KEY = 'ownerParam';

/**
 * Marca qué parámetro de la ruta es el id del alumno dueño del recurso.
 * Con el rol `user`, `OwnerGuard` exige que ese parámetro sea el propio id (403 si no);
 * coach y admin pasan sin restricción. Requiere `@Auth(...)`, que incluye el guard.
 *
 * - `@Owner('id')`     → `GET /users/get/:id`
 * - `@Owner('idUser')` → `GET /user_rm/user/:idUser/exercise/:idExercise`
 */
export function Owner(param: string) {
  return applyDecorators(
    SetMetadata(OWNER_PARAM_KEY, param),
    ApiResponse({ status: 403, description: 'Un alumno sólo puede acceder a sus propios datos' }),
  );
}

# PowerApp Backend — Estado de implementación vs. Casos de Uso

> **Corte:** 2026-08-06 · **Fuente:** `Documentation/Especificaciones de CU/especificaciones/` comparado contra `power-app/src`
> **Método:** mapeo 1:1 de los 72 CU contra los `controller` y `service` presentes en el código.

## Resumen

| Estado | CU | % | Significado |
|---|---:|---:|---|
| ✅ Implementado | 35 | 49% | Endpoint existe y su service ejecuta lógica real |
| 🟡 Parcial | 3 | 4% | Funciona a medias / resuelto dentro de otro endpoint |
| 🔵 Andamiaje | 14 | 19% | Ruta declarada pero service vacío y llamada comentada |
| ⬜ No implementado | 20 | 28% | Sin endpoint, service ni módulo |
| **Total** | **72** | | |

**38 de 72 CU con código implementado o parcial (~53%).** Los otros 34 son trabajo pendiente (andamiaje + no implementado).
> **Nota:** CU-A-23 quedó implementado en código pero requiere crear la columna `active` en la DB para funcionar (ver *Cambios recientes*).

### Cobertura por rol

| Rol | CU | ✅ | 🟡 | 🔵 | ⬜ | % implementado |
|---|---:|---:|---:|---:|---:|---:|
| Usuario | 20 | 8 | 2 | 2 | 8 | 40% |
| Entrenador | 29 | 4 | 1 | 12 | 12 | 14% |
| Admin | 23 | 23 | 0 | 0 | 0 | 100% |

## Cambios recientes (2026-08-06)

- **CU-A-18** reclasificado a ✅ **Implementado**: la spec define los campos editables del Coach como `coach_email`, `cuil`, `active`, exactamente lo que actualiza `POST /coach/promote_user` cuando el usuario ya es coach.
- **CU-A-23** implementado en código (baja lógica de membresía):
  - Nueva columna `active: boolean` (default `true`) en la entidad `Membership`.
  - Nuevo DTO `SetMembershipActiveDto` (`{ active: boolean }`).
  - Nuevo método `setMembershipActive` en `MembershipService`.
  - Nuevo endpoint `POST /membership/set-active/:id` — un mismo endpoint activa o da de baja según el flag del body.
  - Los listados (`GET /membership/all`) siguen devolviendo activas e inactivas (sin filtro).
  - **Schema:** se agregó `active BOOLEAN NOT NULL DEFAULT true` a la tabla `Membership` en `Db Creator/ddl.py` (fuente del DDL, generado por `build_sql.py`), `Db Creator/01_estructura.sql` y `db/Re-creacion DB.sql`. Los INSERT de seed usan lista de columnas explícita, así que el `DEFAULT true` los cubre. **Falta regenerar la base** para aplicarlo; hasta entonces los endpoints de membresía fallarán (TypeORM seleccionará una columna inexistente).
- **CU-A-02 / CU-A-03** reclasificados a ✅ **Implementado**: la asignación/desasignación de músculos se gestiona dentro de la creación y edición de ejercicios (`POST /exercise/create` y `POST /exercise/edit/:id`), no como endpoints separados. **Admin queda 23/23 (100%).**

---

## Hallazgos estructurales

1. **Routine y Planification son andamiaje puro.** Ambos `controller` declaran todas sus rutas, pero `routine.service.ts` y `planification.service.ts` están vacíos y cada llamada al service está comentada. Son **14 CU** (E-08→E-19, U-08, U-09): el mayor bloque de trabajo pendiente.
2. **El módulo `/auth` está completamente comentado** (`authentication.controller.ts`): logout, recuperar contraseña y registro social no funcionan. El registro/login reales viven en `/users`. Deja sin cubrir U-03 y U-04.
3. **No existe el módulo de Circuitos** (E-21→E-24): ni controller, ni service, ni ruta.
4. **Falta la gestión de "Mi Cuenta" del usuario:** cambiar contraseña (U-05), editar datos (U-06), marcar serie (U-12), notas (U-13), RM potenciales (U-16).
5. **No hay endpoints de "alumnos"** con filtro por rol/entrenador ni tracking de entrenamientos (historiales E-06/E-07) ni estados/tipos de membresía agregados (E-26→E-28).
6. **La autorización es manual, no centralizada:** los controllers verifican el token a mano (ej. `verifyAdminJwtToken` en Coach). No hay Guards ni decoradores de rol de NestJS.
7. **Sin infraestructura de migraciones y `synchronize: false`.** No existe carpeta `migrations`, `data-source` ni scripts typeorm en `package.json`. Todo cambio de columna en una entidad requiere definir cómo se aplica al schema.

---

## Detalle — Rol Usuario (20 CU · 40%)

### Administrar mi cuenta
| CU | Caso de uso | Estado | Endpoint / nota |
|---|---|---|---|
| CU-U-01 | Registrar usuario | ✅ Implementado | `POST /users/register` |
| CU-U-02 | Login | ✅ Implementado | `POST /users/login` |
| CU-U-03 | Cerrar sesión | ⬜ No implementado | `/auth/logout` comentado |
| CU-U-04 | Recuperar contraseña | ⬜ No implementado | `/auth/forgot_password` comentado |
| CU-U-05 | Cambiar contraseña | ⬜ No implementado | sin endpoint |
| CU-U-06 | Editar datos personales | ⬜ No implementado | sin endpoint |
| CU-U-07 | Obtener historial de pagos | ✅ Implementado | `GET /membership/payment/user/:id` |

### Mi entrenamiento
| CU | Caso de uso | Estado | Endpoint / nota |
|---|---|---|---|
| CU-U-08 | Obtener mi planificación | 🔵 Andamiaje | `GET /planification/user/:id/active` · service vacío |
| CU-U-09 | Ver detalle de rutina | 🔵 Andamiaje | `GET /routine/:id` · service vacío |
| CU-U-10 | Ver detalle de un ejercicio | 🟡 Parcial | `getExerciseById` existe; falta exponer `GET /exercise/:id` |
| CU-U-11 | Ver mis RMs de un ejercicio | 🟡 Parcial | `GET /user_rm/exercise/:id` · no filtra por usuario |
| CU-U-12 | Marcar serie como realizado | ⬜ No implementado | sin endpoint (Exercise_Set) |
| CU-U-13 | Dejar una nota en el ejercicio | ⬜ No implementado | sin endpoint |
| CU-U-14 | Temporizador | ⬜ No implementado | sin endpoint (probable front-end) |
| CU-U-15 | Consultar wiki de ejercicios | ✅ Implementado | `GET /exercise/all` |

### Administrar mis RMs
| CU | Caso de uso | Estado | Endpoint / nota |
|---|---|---|---|
| CU-U-16 | Calcular mis RM potenciales | ⬜ No implementado | sin fórmula ni endpoint |
| CU-U-17 | Registrar un RM | ✅ Implementado | `POST /user_rm/create` |
| CU-U-18 | Editar un RM | ✅ Implementado | `POST /user_rm/edit/:id` |
| CU-U-19 | Obtener mis RMs | ✅ Implementado | `GET /user_rm/user/:id` |
| CU-U-20 | Eliminar un RM | ✅ Implementado | `DELETE /user_rm/:id` |

---

## Detalle — Rol Entrenador (29 CU · 14%)

### Administrar alumnos
| CU | Caso de uso | Estado | Endpoint / nota |
|---|---|---|---|
| CU-E-01 | Obtener alumnos | 🟡 Parcial | `GET /users/all` · sin filtro por rol/entrenador |
| CU-E-02 | Obtener alumnos — filtro por nombre | ⬜ No implementado | sin endpoint |
| CU-E-03 | Cerrar cuenta de alumno | ⬜ No implementado | sin endpoint |
| CU-E-04 | Obtener RMs del alumno | ✅ Implementado | `GET /user_rm/user/:id` |
| CU-E-05 | Historial de pagos de alumno | ✅ Implementado | `GET /membership/payment/user/:id` |
| CU-E-06 | Historial de entrenamientos de alumno | ⬜ No implementado | sin tracking ni endpoint |
| CU-E-07 | Historial entrenamientos — filtro ejercicio | ⬜ No implementado | sin endpoint |

### Administrar planificaciones
| CU | Caso de uso | Estado | Endpoint / nota |
|---|---|---|---|
| CU-E-08 | Obtener planificaciones sistémicas | 🔵 Andamiaje | `GET /planification/all` · comentado |
| CU-E-09 | Crear planificación sistémica | 🔵 Andamiaje | `POST /planification/create` · comentado |
| CU-E-10 | Editar planificación sistémica | 🔵 Andamiaje | `POST /planification/edit/:id` · comentado |
| CU-E-11 | Eliminar planificación sistémica | 🔵 Andamiaje | `DELETE /planification/:id` · comentado |
| CU-E-12 | Asignar rutina a planificación | 🔵 Andamiaje | `POST /planification/routine/assign` · comentado |
| CU-E-13 | Asignar planificación a alumno | 🔵 Andamiaje | `POST /planification/user/assign` · comentado |
| CU-E-14 | Eliminar planificación a alumno | 🔵 Andamiaje | `DELETE /planification/user/:id` · comentado |

### Administrar rutinas
| CU | Caso de uso | Estado | Endpoint / nota |
|---|---|---|---|
| CU-E-15 | Obtener rutinas sistémicas | 🔵 Andamiaje | `GET /routine/all` · comentado |
| CU-E-16 | Crear rutina sistémica | 🔵 Andamiaje | `POST /routine/create` · comentado |
| CU-E-17 | Editar rutina sistémica | 🔵 Andamiaje | `POST /routine/edit/:id` · comentado |
| CU-E-18 | Eliminar rutina sistémica | 🔵 Andamiaje | `DELETE /routine/:id` · comentado |
| CU-E-19 | Asignar rutina a alumno | 🔵 Andamiaje | `POST /planification/routine/assign-user` · comentado |
| CU-E-20 | Eliminar rutina a alumno | ⬜ No implementado | sin ruta para quitar routine-asignation-user |

### Administrar circuitos
| CU | Caso de uso | Estado | Endpoint / nota |
|---|---|---|---|
| CU-E-21 | Obtener circuitos | ⬜ No implementado | sin módulo Circuit |
| CU-E-22 | Crear circuito | ⬜ No implementado | sin módulo Circuit |
| CU-E-23 | Editar circuito | ⬜ No implementado | sin módulo Circuit |
| CU-E-24 | Eliminar circuito (lógico) | ⬜ No implementado | sin módulo Circuit |

### Gestionar membresías
| CU | Caso de uso | Estado | Endpoint / nota |
|---|---|---|---|
| CU-E-25 | Obtener membresías | ✅ Implementado | `GET /membership/all` |
| CU-E-26 | Obtener estado de membresías | ⬜ No implementado | solo método interno `updateFinished` |
| CU-E-27 | Obtener alumnos por estado de membresía | ⬜ No implementado | sin endpoint |
| CU-E-28 | Obtener alumnos por tipo de membresía | ⬜ No implementado | sin endpoint |
| CU-E-29 | Registrar pago de alumno | ✅ Implementado | `POST /membership/payment/register` |

---

## Detalle — Rol Admin (23 CU · 100%)

### Administrar ejercicios
| CU | Caso de uso | Estado | Endpoint / nota |
|---|---|---|---|
| CU-A-01 | Obtener ejercicios | ✅ Implementado | `GET /exercise/all` |
| CU-A-02 | Asignar músculo a ejercicio | ✅ Implementado | se gestiona al crear/editar ejercicios (`POST /exercise/create` y `/exercise/edit/:id`) |
| CU-A-03 | Desasignar músculo de ejercicio | ✅ Implementado | se gestiona al editar ejercicios (`POST /exercise/edit/:id`) |
| CU-A-04 | Crear ejercicio | ✅ Implementado | `POST /exercise/create` |
| CU-A-05 | Editar ejercicio | ✅ Implementado | `POST /exercise/edit/:id` |
| CU-A-06 | Eliminar ejercicio | ✅ Implementado | `DELETE /exercise/:id` |

### Administrar músculos
| CU | Caso de uso | Estado | Endpoint / nota |
|---|---|---|---|
| CU-A-07 | Obtener músculos | ✅ Implementado | `GET /muscles/all` |
| CU-A-08 | Crear músculo | ✅ Implementado | `POST /muscles/create` |
| CU-A-09 | Editar músculo | ✅ Implementado | `POST /muscles/edit/:id` |
| CU-A-10 | Eliminar músculo | ✅ Implementado | `DELETE /muscles/:id` |
| CU-A-11 | Obtener grupos musculares | ✅ Implementado | `GET /muscles/mg/all` |

### Administrar grupos musculares
| CU | Caso de uso | Estado | Endpoint / nota |
|---|---|---|---|
| CU-A-12 | Obtener músculos del grupo muscular | ✅ Implementado | `GET /muscles/mg/get/:id` · incluye músculos |
| CU-A-13 | Crear grupo muscular | ✅ Implementado | `POST /muscles/mg/create` |
| CU-A-14 | Editar grupo muscular | ✅ Implementado | `POST /muscles/mg/edit/:id` |
| CU-A-15 | Eliminar grupo muscular | ✅ Implementado | `DELETE /muscles/mg/:id` |

### Administrar entrenadores
| CU | Caso de uso | Estado | Endpoint / nota |
|---|---|---|---|
| CU-A-16 | Obtener entrenadores | ✅ Implementado | `GET /coach/all` |
| CU-A-17 | Convertir alumno a entrenador | ✅ Implementado | `POST /coach/promote_user` |
| CU-A-18 | Editar datos de entrenador | ✅ Implementado | `POST /coach/promote_user` · si el user ya es coach, actualiza `coach_email`, `cuil`, `active` |
| CU-A-19 | Eliminar entrenador | ✅ Implementado | `POST /coach/delete_coach/:id` · baja lógica (`active: false`) |

### Administrar membresías (tipos)
| CU | Caso de uso | Estado | Endpoint / nota |
|---|---|---|---|
| CU-A-20 | Obtener membresías | ✅ Implementado | `GET /membership/all` |
| CU-A-21 | Crear membresía | ✅ Implementado | `POST /membership/create` |
| CU-A-22 | Editar membresía | ✅ Implementado | `POST /membership/edit/:id` |
| CU-A-23 | Eliminar membresía | ✅ Implementado | `POST /membership/set-active/:id` · baja lógica con flag `{ active }` · **pendiente:** columna `active` en DB |

---

## Orden sugerido para cerrar la brecha

1. **Admin cerrado (23/23):** A-18 cubierto por `promote_user`; A-02/A-03 se resuelven al crear/editar ejercicios; A-23 implementado y con la columna `active` ya agregada a los scripts de DB (falta regenerar la base para aplicarlo).
2. **Routine + Planification**: implementar los services stubbed → desbloquea 14 CU y hace usable el rol Entrenador y "Mi Entrenamiento" del Usuario.
3. **Módulo Circuitos** (E-21→E-24), dependencia de las rutinas.
4. **Gestión de cuenta del Usuario** (U-05, U-06) y auth (U-03, U-04).
5. **Transversal:** Guards de autenticación/roles antes de que crezca el volumen de endpoints; definir estrategia de migraciones para cambios de schema.

---

## Cómo leer los estados

- **✅ Implementado** — el endpoint existe y su service ejecuta lógica real y validada.
- **🟡 Parcial** — funciona a medias: resuelto dentro de otro endpoint, sin filtro por usuario, o con la lógica lista pero sin ruta expuesta.
- **🔵 Andamiaje** — la ruta está declarada pero el service está vacío y la llamada comentada: responde, no ejecuta nada.
- **⬜ No implementado** — no existe endpoint, service ni módulo que cubra el caso de uso.

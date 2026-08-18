# PowerApp Backend — Estado de implementación vs. Casos de Uso

> **Corte:** 2026-08-18 · **Fuente:** `Documentation/Especificaciones de CU/especificaciones/` comparado contra `power-app/src`
> **Método:** mapeo 1:1 de los 72 CU contra los `controller` y `service` presentes en el código.

## Resumen

| Estado | CU | % | Significado |
|---|---:|---:|---|
| ✅ Implementado | 43 | 60% | Endpoint existe y su service ejecuta lógica real |
| 🟡 Parcial | 1 | 1% | Funciona a medias / resuelto dentro de otro endpoint |
| 🔵 Andamiaje | 14 | 19% | Ruta declarada pero service vacío y llamada comentada |
| ⬜ No implementado | 14 | 19% | Sin endpoint, service ni módulo |
| **Total** | **72** | | |

**44 de 72 CU con código implementado o parcial (~61%).** Los otros 28 son trabajo pendiente (andamiaje + no implementado).
> **Nota:** la DB de Render fue **regenerada** con los scripts actualizados (incluye las columnas `active` de `Membership` y `User`), así que esos endpoints ya funcionan en runtime.

### Cobertura por rol

| Rol | CU | ✅ | 🟡 | 🔵 | ⬜ | % implementado |
|---|---:|---:|---:|---:|---:|---:|
| Usuario | 20 | 13 | 1 | 2 | 4 | 65% |
| Entrenador | 29 | 7 | 0 | 12 | 10 | 24% |
| Admin | 23 | 23 | 0 | 0 | 0 | 100% |

## Cambios recientes (2026-08-18)

- **CU-U-05 (cambiar contraseña)** ✅: `POST /users/change-password` con body `{ current_password, new_password }`. Acepta como contraseña actual tanto la normal como la **temporal** (cubre el cambio obligatorio tras una recuperación) y en ambos casos deja `temp_password` en `null`. Valida que la actual sea correcta (401) y que la nueva cumpla los requisitos de formato (mínimo 6, máximo 50). **Decisión (18/8):** la repetición de la contraseña nueva **no viaja al server** — esa confirmación se valida en el front, así que el camino alternativo «confirmación no coincide» de la spec queda del lado del cliente.
- **CU-U-06 (editar datos personales)** ✅: `POST /users/edit` sobre el **propio** registro — el id sale de `@CurrentUser()`, no del path, así que no hay forma de editar a otro usuario. Todos los campos son opcionales (`first_name`, `last_name`, `email`, `phone_prefix`, `phone_number`, `profile_picture`); sólo se persisten los que vienen. Si cambia el email se valida unicidad (409) y se resetea `email_verified`; si cambia el teléfono se resetea `phone_verified`.
- **Nuevo helper `AuthService.comparePassword(plain, hash)`**: compara contra un hash ya persistido y devuelve `false` si el hash es null, en vez de dejar que `bcrypt.compare` rompa.
- **`User.temp_password` pasó a `string | null` en TypeScript** para reflejar el `nullable: true` que la columna ya tenía. **No es un cambio de schema** — la DB no cambia y `Db Creator` no se toca.
- **CU-U-11 (ver mis RMs de un ejercicio)** ✅ *(era 🟡 parcial)*: nuevo `GET /user_rm/user/:idUser/exercise/:idExercise` con **check de dueño** — si el rol es `user`, el `:idUser` tiene que coincidir con el del token (403 si no); coach y admin consultan el de cualquier alumno. Devuelve los RMs ordenados por `date` DESC. Se eligió el path con los dos ids (en vez de un `/me/...`) para que el mismo endpoint le sirva al entrenador como drill-down por ejercicio sobre CU-E-04. Nuevo DTO `UserExerciseParamsDto` (dos UUIDs), porque `ParameterIdDto` sólo contempla uno.
- **CU-U-10 (ver detalle de un ejercicio)** 🟡 *sigue parcial*: se expuso `GET /exercise/:id` con `@Auth()`, que devuelve la **ficha de catálogo** del ejercicio (descripción, tips, video, imágenes y músculos trabajados) reutilizando el `getExerciseById` que ya existía en el service.
  - **Ojo con el alcance:** la spec de U-10 no pide sólo la ficha, sino el detalle del ejercicio **dentro de la rutina** — el `Exercise` con sus `Exercise_Set` ordenadas (reps, peso, RPE/RIR, AMRAP/RM) y las notas `coach_note`/`user_note` — con la precondición de que el ejercicio pertenezca a una rutina asignada vigente, e incluye («include») a U-11, U-12 y U-13. Ese camino pasa por `Routine_Exercise` → `Exercise_Set` desde la rutina del usuario, o sea por `RoutineService` (vacío) y el módulo `Circuit` (inexistente): **queda atado al bloque del 28/8**. La nota anterior del informe («falta exponer `GET /exercise/:id`») subestimaba el alcance real.
  - **Inconsistencia de auth a resolver:** el endpoint nuevo pide sesión (`@Auth()`), siguiendo la precondición de la spec, pero `GET /exercise/all` sigue siendo **público**. Conviene alinear los dos criterios.
- **Pendientes del 14/8**: U-16 y E-26→E-28 quedan a la espera de definiciones.

## Cambios recientes (2026-08-11)

- **Autorización centralizada (Guards):** se reemplazó la verificación manual de token por Guards + decorador `@Auth(...)` de NestJS en los 7 controllers (rol por endpoint, `@Auth(user)` + check de dueño en User RM). Resuelve el hallazgo #6.
- **CU-U-03 (cerrar sesión)** ✅: `POST /users/logout` responde 200 (ack). El JWT es stateless → el logout efectivo lo hace el cliente descartando el token; sin denylist server-side (no lo pide la spec).
- **CU-U-04 (recuperar contraseña)** ✅: `POST /users/recover-password` genera una `temp_password` aleatoria, la hashea/persiste y responde el **mismo mensaje** exista o no el email (no revela). **Email stubbeado** (la temporal se loguea en consola; falta integrar un servicio de mail real). No requiere cambio de schema (`temp_password` ya existía).
- El módulo `/auth` viejo (todo comentado) se **eliminó**; logout y recuperación viven en `/users`.
- Se corrigió un crash de login: `authenticateTemporaryPassword` cortaba con `bcrypt.compare(null)` cuando `temp_password` es null → ahora devuelve 401 limpio.

## Cambios recientes (2026-08-06)

- **CU-A-18** reclasificado a ✅ **Implementado**: la spec define los campos editables del Coach como `coach_email`, `cuil`, `active`, exactamente lo que actualiza `POST /coach/promote_user` cuando el usuario ya es coach.
- **CU-A-23** implementado en código (baja lógica de membresía):
  - Nueva columna `active: boolean` (default `true`) en la entidad `Membership`.
  - Nuevo DTO `SetMembershipActiveDto` (`{ active: boolean }`).
  - Nuevo método `setMembershipActive` en `MembershipService`.
  - Nuevo endpoint `POST /membership/set-active/:id` — un mismo endpoint activa o da de baja según el flag del body.
  - Los listados (`GET /membership/all`) siguen devolviendo activas e inactivas (sin filtro).
  - **Schema:** se agregó `active BOOLEAN NOT NULL DEFAULT true` a la tabla `Membership` en `Db Creator/ddl.py` (fuente del DDL, generado por `build_sql.py`) y `Db Creator/01_estructura.sql`. Los INSERT de seed usan lista de columnas explícita, así que el `DEFAULT true` los cubre. **Falta regenerar la base** para aplicarlo; hasta entonces los endpoints de membresía fallarán (TypeORM seleccionará una columna inexistente).
- **CU-A-02 / CU-A-03** reclasificados a ✅ **Implementado**: la asignación/desasignación de músculos se gestiona dentro de la creación y edición de ejercicios (`POST /exercise/create` y `POST /exercise/edit/:id`), no como endpoints separados. **Admin queda 23/23 (100%).**
- **Filtros + paginación en `GET /users/all`** (cierra **CU-E-01** y **CU-E-02**): query params `role` (user/coach/admin), `keyword` (coincidencia parcial en nombre, apellido y email), `active` (estado de cuenta) y paginación `page`/`limit` (default 1/20, máx 100). La respuesta pasó a ser paginada: `{ data, total, page, limit, totalPages }` (cambio de contrato — antes era un array). Orden interno por `created_at` DESC (no expuesto como parámetro).
- **Nuevo campo `User.active`** (boolean, default `true`): estado de la cuenta, independiente de si la membresía está vigente. Agregado a la entidad `User` y a los scripts de DB (`Db Creator/ddl.py` y `Db Creator/01_estructura.sql`). Los usuarios nuevos y el seed quedan `active = true` por el DEFAULT. Igual que `Membership.active`, **requiere regenerar la base**; hasta entonces los endpoints de usuarios fallan (TypeORM selecciona una columna inexistente).
- **CU-E-03 (cerrar cuenta de alumno)** implementado: endpoint `POST /users/set-active/:id` con body `{ active }` (mismo patrón que membresías) para baja/alta lógica de la cuenta. Además, `POST /users/login` ahora responde **403** para cuentas con `active = false`, cumpliendo la postcondición «no puede iniciar sesión». Falta control de acceso por rol (guards) — pendiente transversal.

---

## Hallazgos estructurales

1. **Routine y Planification son andamiaje puro.** Ambos `controller` declaran todas sus rutas, pero `routine.service.ts` y `planification.service.ts` están vacíos y cada llamada al service está comentada. Son **14 CU** (E-08→E-19, U-08, U-09): el mayor bloque de trabajo pendiente.
2. ~~**El módulo `/auth` está completamente comentado.**~~ **Resuelto (2026-08-11):** el módulo viejo se eliminó; logout (U-03) y recuperar contraseña (U-04) se implementaron en `/users`. Queda pendiente el registro social (fuera de los 72 CU).
3. **No existe el módulo de Circuitos** (E-21→E-24): ni controller, ni service, ni ruta.
4. **Falta la gestión de "Mi Cuenta" del usuario:** ~~cambiar contraseña (U-05), editar datos (U-06)~~ **resueltos (2026-08-18)**; siguen pendientes marcar serie (U-12), notas (U-13) y RM potenciales (U-16).
5. **No hay endpoints de "alumnos"** con filtro por rol/entrenador ni tracking de entrenamientos (historiales E-06/E-07) ni estados/tipos de membresía agregados (E-26→E-28).
6. ~~**La autorización es manual, no centralizada.**~~ **Resuelto (2026-08-11):** se centralizó con Guards + `@Auth(...)` en los 7 controllers (ver *Cambios recientes 2026-08-11*).
7. **Sin infraestructura de migraciones y `synchronize: false`.** No existe carpeta `migrations`, `data-source` ni scripts typeorm en `package.json`. Todo cambio de columna en una entidad requiere definir cómo se aplica al schema.

---

## Próximas semanas — cronograma del servidor (hasta 4/9)

> Organizado por **viernes** (clases). El **7/8** (infra y transversales) está **cerrado**: DB regenerada, autorización centralizada con Guards y CU-U-03/U-04 implementados. El **14/8** quedó **parcial** (ver abajo). Lo que sigue, hasta la **fecha límite de entrega del servidor (4/9)**:

| Viernes | Foco | Casos de uso |
|---|---|---|
| **14/8** ⏳ | CU sin dependencias — **3 de 8** (+ U-10 parcial) | ✅ cambiar contraseña (**U-05**), ✅ editar datos personales (**U-06**), ✅ filtrar RMs por usuario (**U-11**) · 🟡 detalle de ejercicio (**U-10**): ficha de catálogo expuesta, el resto depende de Rutinas · ⏸️ **pendientes:** estado y tipos de membresía + alumnos por estado/tipo (**E-26→E-28**), RMs potenciales (**U-16**) |
| **21/8** | Circuitos | Crear el módulo `Circuit` desde cero (entidad, módulo, controller, service); obtener/crear/editar/eliminar circuitos (**E-21→E-24**) |
| **28/8** | Rutinas | Implementar el service de rutinas (**E-15→E-18**); asignar/desasignar rutinas a alumnos (**E-19, E-20**); marcar series realizadas (**U-12**) y notas del ejercicio (**U-13**); historial de entrenamientos y su filtro (**E-06, E-07**) |
| **4/9** | Planificaciones y cierre | Service de planificaciones (**E-08→E-11**); asignar rutinas y planificaciones a alumnos (**E-12→E-14**); planificación activa y detalle de rutina del usuario (**U-08, U-09**); pruebas de integración sobre la API + Swagger. **🎯 Hito: servidor con los 72 CU cubiertos** |

> Secuencia según dependencias: primero los CU independientes, luego **Circuitos**, sobre ellos las **Rutinas** y por último las **Planificaciones** que las agrupan.

> **Riesgo abierto (18/8):** los 6 CU pausados del 14/8 no bloquean a nadie, pero **Circuitos sí** — es la base de las Rutinas (28/8) y éstas de las Planificaciones (4/9). Si el 21/8 se corre, se corre toda la cadena hasta el hito del servidor. Además, arrancar Circuitos exige resolver antes el desvío de modelo pendiente (`Circuit.routine_id` 1:N en el código vs. `Routine_Circuit` M:N en el modelo vigente de `Doc/`).

---

## Detalle — Rol Usuario (20 CU · 65%)

### Administrar mi cuenta
| CU | Caso de uso | Estado | Endpoint / nota |
|---|---|---|---|
| CU-U-01 | Registrar usuario | ✅ Implementado | `POST /users/register` |
| CU-U-02 | Login | ✅ Implementado | `POST /users/login` |
| CU-U-03 | Cerrar sesión | ✅ Implementado | `POST /users/logout` · ack 200, el cliente descarta el token |
| CU-U-04 | Recuperar contraseña | ✅ Implementado | `POST /users/recover-password` · genera `temp_password`; email stubbeado |
| CU-U-05 | Cambiar contraseña | ✅ Implementado | `POST /users/change-password` · acepta contraseña actual o temporal; anula `temp_password` |
| CU-U-06 | Editar datos personales | ✅ Implementado | `POST /users/edit` · sobre el propio registro (`@CurrentUser`), campos opcionales |
| CU-U-07 | Obtener historial de pagos | ✅ Implementado | `GET /membership/payment/user/:id` |

### Mi entrenamiento
| CU | Caso de uso | Estado | Endpoint / nota |
|---|---|---|---|
| CU-U-08 | Obtener mi planificación | 🔵 Andamiaje | `GET /planification/user/:id/active` · service vacío |
| CU-U-09 | Ver detalle de rutina | 🔵 Andamiaje | `GET /routine/:id` · service vacío |
| CU-U-10 | Ver detalle de un ejercicio | 🟡 Parcial | `GET /exercise/:id` ✅ expuesto (ficha de catálogo) · **falta** el detalle en contexto de rutina (`Exercise_Set` ordenadas, notas) — depende de Rutinas |
| CU-U-11 | Ver mis RMs de un ejercicio | ✅ Implementado | `GET /user_rm/user/:idUser/exercise/:idExercise` · check de dueño para rol `user`, orden por fecha DESC |
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

## Detalle — Rol Entrenador (29 CU · 24%)

### Administrar alumnos
| CU | Caso de uso | Estado | Endpoint / nota |
|---|---|---|---|
| CU-E-01 | Obtener alumnos | ✅ Implementado | `GET /users/all?role=user` · filtros rol/keyword/active + paginación |
| CU-E-02 | Obtener alumnos — filtro por nombre | ✅ Implementado | `GET /users/all?keyword=` · busca en nombre, apellido y email |
| CU-E-03 | Cerrar cuenta de alumno | ✅ Implementado | `POST /users/set-active/:id` · baja lógica `{ active }` + bloqueo de login (403) |
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
4. ~~**Gestión de cuenta del Usuario** (U-05, U-06) y auth (U-03, U-04).~~ **Cerrado** (U-03/U-04 el 11/8, U-05/U-06 el 18/8).
5. **Transversal:** Guards de autenticación/roles antes de que crezca el volumen de endpoints; definir estrategia de migraciones para cambios de schema.

---

## Cómo leer los estados

- **✅ Implementado** — el endpoint existe y su service ejecuta lógica real y validada.
- **🟡 Parcial** — funciona a medias: resuelto dentro de otro endpoint, sin filtro por usuario, o con la lógica lista pero sin ruta expuesta.
- **🔵 Andamiaje** — la ruta está declarada pero el service está vacío y la llamada comentada: responde, no ejecuta nada.
- **⬜ No implementado** — no existe endpoint, service ni módulo que cubra el caso de uso.

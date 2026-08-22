# PowerApp Backend — Estado de implementación vs. Casos de Uso

> **Corte:** 2026-08-22 · **Fuente:** `Documentation/Especificaciones de CU/especificaciones/` comparado contra `power-app/src`
> **Método:** mapeo 1:1 de los 72 CU contra los `controller` y `service` presentes en el código.

## Resumen

| Estado | CU | % | Significado |
|---|---:|---:|---|
| ✅ Implementado | 50 | 69% | Endpoint existe y su service ejecuta lógica real |
| 🟡 Parcial | 1 | 1% | Funciona a medias / resuelto dentro de otro endpoint |
| 🔵 Andamiaje | 14 | 19% | Ruta declarada pero service vacío y llamada comentada |
| ⬜ No implementado | 7 | 10% | Sin endpoint, service ni módulo |
| **Total** | **72** | | |

**51 de 72 CU con código implementado o parcial (~71%).** Los otros 21 son trabajo pendiente (andamiaje + no implementado).
> **Nota (19/8):** la DB está **al día** con el modelo. El ajuste de circuitos se aplicó sobre la instancia existente con un delta puntual, sin recrearla, así que todos los endpoints se pueden probar en runtime.

### Cobertura por rol

| Rol | CU | ✅ | 🟡 | 🔵 | ⬜ | % implementado |
|---|---:|---:|---:|---:|---:|---:|
| Usuario | 20 | 14 | 1 | 2 | 3 | 70% |
| Entrenador | 29 | 13 | 0 | 12 | 4 | 45% |
| Admin | 23 | 23 | 0 | 0 | 0 | 100% |

## Cambios recientes (2026-08-22 · baja lógica en Rutinas y Planificaciones)

Cambio de modelo: `Routine` y `Planification` suman `active` y pasan a **baja lógica**, como `Circuit`. **Ningún CU cambia de estado y los conteos no se mueven** — es sólo el modelo; los endpoints `set-active` se implementan con sus bloques (E-18 con Rutinas, E-11 con Planificaciones).

- **El motivo es una cascada que destruye historial.** `Routine` tiene tres FKs apuntándole con `ON DELETE CASCADE`: un `DELETE` se lleva `Routine_Circuit`, `Routine_Asignation_User` y `Routine_Asignation`, y desde ahí `User_Routine` y `Routine_Exercise_Set_Finished`. O sea, **borrar una rutina borraba en silencio el historial de entrenamiento de todos los alumnos que la hicieron**. `Planification` tenía el mismo problema vía `Routine_Asignation`. La spec anterior lo cubría con un chequeo de "no está en uso", protección que dependía de que ese chequeo estuviera bien escrito; con baja lógica el error es imposible por construcción.
- **Se hizo ahora y no después** porque las dos tablas están vacías (el `ALTER` no necesita backfill) y porque sus endpoints siguen siendo andamiaje: hacerlo más tarde obligaba a rehacer E-18, E-11 y los dos listados.
- **Regla de comportamiento** (espejo de CU-E-24): la baja saca la pieza de circulación para **nuevos** ensamblados y asignaciones, pero lo ya asignado mantiene integridad y el alumno lo sigue viendo.
- **Specs reescritas:** CU-E-18 y CU-E-11 pasan a "(Lógico)". Desaparece de ambas el camino alternativo *"en uso → impide la baja"*, reemplazado por una advertencia informativa: se puede dar de baja, pero eso no la quita de donde ya está asignada. CU-E-08 y CU-E-15 aclaran que listan las **activas**.
- **`Db Creator`:** columna + índice en las dos tablas, `01_estructura.sql` regenerado; `02` y `03` sin cambios. El `ALTER` se aplicó sobre la base viva.
- Diagramas de `Doc/` actualizados por el usuario (Miro → SVG/PDF). Plan: `Doc/plans/2026-08-22-baja-logica-rutinas-planificaciones-plan.md`.

## Cambios recientes (2026-08-19 · circuitos)

- **CU-E-21 (obtener circuitos)** ✅: `GET /routine/circuit/all` con tres filtros opcionales — `keyword` (parcial, sin distinguir mayúsculas, sobre nombre y descripción), `type` (exacto, sin distinguir mayúsculas) e `include_inactive` (por defecto `false`, solo activos como pide la spec). Devuelve un array plano ordenado por nombre, con `exercise_count` por circuito resuelto con `loadRelationCountAndMap` (sin query extra).
- **`GET /routine/circuit/all-plus`** (22/8) — tampoco es un CU: es el mismo listado de E-21 con los ejercicios de cada circuito (sólo `id` y `name`, sin series ni notas), pensado para que el front arme una rutina viendo el contenido de cada pieza sin una llamada por circuito. Se resolvió como **endpoint aparte y no como un parámetro `include_exercises`** del listado (decisión del usuario): así ningún endpoint devuelve dos formas distintas según el query string. Reutiliza el mismo `GetCircuitsQueryDto`, y los filtros compartidos se extrajeron a un helper privado `buildCircuitsQuery` para que un cambio futuro (por ejemplo, cuando `type` deje de ser string libre) se toque en un solo lugar. Acá el `exercise_count` sale del `.length` del array ya cargado, sin la query extra del listado normal.
- **`GET /routine/circuit/:id`** — no es un CU: es el «include» que CU-E-23 necesita para "abrir un circuito con sus ejercicios actuales". Devuelve el circuito con sus `Routine_Exercise` ordenados por `exercise_order` y sus `Exercise_Set` por `set_order`, aplanando las relaciones como hace `exercise.service.ts`. Responde también para circuitos inactivos, para que se puedan inspeccionar los dados de baja.
- **CU-E-24 (eliminar circuito, lógico)** ✅: `POST /routine/circuit/set-active/:id` con body `{ active }`, mismo patrón que `/membership/set-active/:id` y `/users/set-active/:id`. Un solo endpoint da de baja y reactiva. **No toca `Routine_Circuit`**: las rutinas que referencian el circuito quedan intactas, que es la postcondición explícita del CU.
- Los tres son `@Auth(coach, admin)` y viven en `routine.controller.ts` / `routine.service.ts`: **los circuitos no tienen módulo ni controller propio** (decisión del usuario — rutinas y circuitos dependen entre sí). El `RoutineService` deja de estar vacío.
- **CU-E-22 (crear circuito)** ✅: `POST /routine/circuit/create` da de alta la cabecera, sus ejercicios y sus series en **una sola transacción** (`QueryRunner`) — se aparta a propósito del patrón sin transacción de `createExercise`, porque con E-23 pausado un circuito creado a medias no se podría reparar desde la app. `exercise_order` y `set_order` los deriva el server de la posición en el array, así que no hay forma de recibir órdenes duplicados ni salteados. Responde `201` con el mismo formato anidado que el detalle, para que el front no tenga que hacer una segunda llamada.
  - **Reglas de negocio validadas:** `exercise_id` **único** dentro del circuito (400) — si hace falta el mismo movimiento dos veces se usa una variación del catálogo, y a cambio `exercise_id` queda como clave natural para la reconciliación de E-23; `amrap_time` sólo con `amrap = true`; `rpe` y `rir` mutuamente excluyentes (misma escala invertida); `rm = true` exige `set_count = 1`. Rangos: `set_count` 1–20, `rep_count` 1–1000 (cubre aeróbicos como saltos de soga), `weight` ≤1000, `rpe` 1–10, `rir` 0–10, `rm_perc` 1–125 (permite supramáximo).
  - **Semántica confirmada:** una fila de `Exercise_Set` es un **bloque de series iguales**, no una serie individual. Consecuencia asumida en CU-U-12: el alumno marca el bloque completo; tildar serie por serie sería maquillaje del front.
  - **Refactor:** el armado de la respuesta anidada salió de `getCircuitById` a dos helpers privados (`findCircuitDetail` + `buildCircuitDetailResponse`) que comparten el alta y el detalle.
- **CU-E-23 (editar circuito)** queda como el **único pendiente del bloque**, pausado por decisión de diseño: la reconciliación define qué pasa con los `Exercise_Set` que los alumnos ya marcaron como hechos vía `Routine_Exercise_Set_Finished`, y eso merece su propio refinamiento. Con `exercise_id` como clave única, va a poder resolverse con el mismo patrón que `editExercise` usa para los músculos.
- Sin cambios de entidades → `Db Creator` intacto.
- **La base ya está migrada al schema nuevo** (19/8): se aplicó el delta de circuitos sobre la instancia existente en vez de recrearla, así que los endpoints de circuitos se pueden probar en runtime.
- **`ias_users` fuera del DDL:** era una tabla de otro proyecto arrastrada en `ddl.py`. Se sacó de los scripts para que no vuelva a crearse al regenerar; **la tabla existente en la base no se toca** (decisión del usuario). Ahora la correspondencia entidades ↔ tablas es 20 a 20, sin excepciones.
- **Bugfix transversal — `@IsUUID('4')` → `@IsUUID('all')` en los 17 usos (12 DTOs).** El seed genera ids **deterministas v5** (`uuid5(namespace, nombre)`, en `gen_seed.py` y `dynamic_data.py`), mientras que la app genera **v4 aleatorios** (`gen_random_uuid()` / TypeORM). Los validadores exigían v4, así que **cualquier endpoint que recibiera un id del seed devolvía 400**: 939 de 984 ids del catálogo y 131 de 142 de los datos dinámicos son v5. Afectaba a `ParameterIdDto` (todos los `:id`), a los ids de ejercicio y músculo de ejercicios y RMs, y a usuarios y membresías sembrados. Se detectó probando el alta de circuitos con ejercicios reales del catálogo.
  - **Decisión:** no se toca la generación de ids. El v5 del seed es deliberado — es lo que hace que los INSERT sean idempotentes (`ON CONFLICT (id) DO NOTHING`), que los `.sql` regenerados queden byte-idénticos y que los ids se puedan citar en payloads y documentación. La app no puede usar v5 porque en runtime no hay clave natural que hashear. El error estaba en el validador, que afirmaba una propiedad que el sistema nunca garantizó: `'all'` sigue exigiendo un UUID bien formado, sólo deja de exigir que sea aleatorio.
- Spec: `Doc/specs/2026-08-19-crear-circuito-design.md` · plan: `Doc/plans/2026-08-19-crear-circuito-plan.md`.
- Spec del bloque: `Doc/specs/2026-08-19-circuitos-listado-y-baja-design.md` · plan: `Doc/plans/2026-08-19-circuitos-listado-y-baja-plan.md`.

## Cambios recientes (2026-08-19 · modelo)

Alineación de las entidades con el modelo vigente de `Doc/` (spec: `Doc/specs/2026-08-19-ajuste-modelo-circuitos-design.md`, plan: `Doc/plans/2026-08-19-ajuste-modelo-circuitos-plan.md`). **Sin endpoints nuevos: ningún CU cambia de estado ni se mueven los conteos.**

- **`Circuit` pasa a pieza global reutilizable**: se va `routine_id` (la forma 1:N que tenía el código), entran `description` varchar(100) nullable, `type` varchar(30) y `active` boolean. `type` queda como **string libre** por ahora — la idea es cerrarlo más adelante a un conjunto de valores por función dentro de la rutina (entrada en calor / principal / accesorio / cardio / estiramiento), y al ser varchar eso no va a requerir tocar la base.
- **Nueva `Routine_Circuit`**: join M:N rutina ↔ circuito con `order`. **Sin unique sobre (`routine_id`, `circuit_id`)** — un mismo circuito puede repetirse dentro de la rutina y el `order` distingue las apariciones. FKs: `routine_id` CASCADE, `circuit_id` RESTRICT (la baja de circuitos es lógica, así que el RESTRICT sólo protege de un borrado manual en la base).
- **`Routine_Exercise` pierde `finished` y `user_note`**: era estado per-usuario viviendo en la plantilla genérica y compartida del circuito. `coach_note` se queda.
- **Nueva `Routine_Exercise_Set_Finished`**: `user_routine_id` + `routine_exercise_set_id` (→ `Exercise_Set.id`) + `user_note`, con unique del par. La existencia de la fila *es* el "hecho". Habilita **CU-U-12**, que sigue ⬜ hasta que existan los endpoints.
- **`Db Creator`**: `ddl.py` + `01_estructura.sql` actualizados y regenerados con `build_sql.py`; `02` y `03` sin cambios de contenido. El schema se aplicó a la base existente con un `ALTER` puntual (19/8), sin recrearla.
- Verificado por compilación (`npm --prefix power-app run build`) y por chequeo cruzado columna a columna entre entidades y `01_estructura.sql`.

## Cambios recientes (2026-08-18)

- **CU-U-05 (cambiar contraseña)** ✅: `POST /users/change-password` con body `{ current_password, new_password }`. Acepta como contraseña actual tanto la normal como la **temporal** (cubre el cambio obligatorio tras una recuperación) y en ambos casos deja `temp_password` en `null`. Valida que la actual sea correcta (401) y que la nueva cumpla los requisitos de formato (mínimo 6, máximo 50). **Decisión (18/8):** la repetición de la contraseña nueva **no viaja al server** — esa confirmación se valida en el front, así que el camino alternativo «confirmación no coincide» de la spec queda del lado del cliente.
- **CU-U-06 (editar datos personales)** ✅: `POST /users/edit` sobre el **propio** registro — el id sale de `@CurrentUser()`, no del path, así que no hay forma de editar a otro usuario. Todos los campos son opcionales (`first_name`, `last_name`, `email`, `phone_prefix`, `phone_number`, `profile_picture`); sólo se persisten los que vienen. Si cambia el email se valida unicidad (409) y se resetea `email_verified`; si cambia el teléfono se resetea `phone_verified`.
- **Nuevo helper `AuthService.comparePassword(plain, hash)`**: compara contra un hash ya persistido y devuelve `false` si el hash es null, en vez de dejar que `bcrypt.compare` rompa.
- **`User.temp_password` pasó a `string | null` en TypeScript** para reflejar el `nullable: true` que la columna ya tenía. **No es un cambio de schema** — la DB no cambia y `Db Creator` no se toca.
- **CU-U-11 (ver mis RMs de un ejercicio)** ✅ *(era 🟡 parcial)*: nuevo `GET /user_rm/user/:idUser/exercise/:idExercise` con **check de dueño** — si el rol es `user`, el `:idUser` tiene que coincidir con el del token (403 si no); coach y admin consultan el de cualquier alumno. Devuelve los RMs ordenados por `date` DESC. Se eligió el path con los dos ids (en vez de un `/me/...`) para que el mismo endpoint le sirva al entrenador como drill-down por ejercicio sobre CU-E-04. Nuevo DTO `UserExerciseParamsDto` (dos UUIDs), porque `ParameterIdDto` sólo contempla uno.
- **CU-U-10 (ver detalle de un ejercicio)** 🟡 *sigue parcial*: se expuso `GET /exercise/:id` con `@Auth()`, que devuelve la **ficha de catálogo** del ejercicio (descripción, tips, video, imágenes y músculos trabajados) reutilizando el `getExerciseById` que ya existía en el service.
  - **Ojo con el alcance:** la spec de U-10 no pide sólo la ficha, sino el detalle del ejercicio **dentro de la rutina** — el `Exercise` con sus `Exercise_Set` ordenadas (reps, peso, RPE/RIR, AMRAP/RM) y las notas `coach_note`/`user_note` — con la precondición de que el ejercicio pertenezca a una rutina asignada vigente, e incluye («include») a U-11, U-12 y U-13. Ese camino pasa por `Routine_Exercise` → `Exercise_Set` desde la rutina del usuario, o sea por `RoutineService` (vacío) y el módulo `Circuit` (inexistente): **queda atado al bloque del 28/8**. La nota anterior del informe («falta exponer `GET /exercise/:id`») subestimaba el alcance real.
  - **Inconsistencia de auth a resolver:** el endpoint nuevo pide sesión (`@Auth()`), siguiendo la precondición de la spec, pero `GET /exercise/all` sigue siendo **público**. Conviene alinear los dos criterios.
- **CU-U-16 (calcular mis RM potenciales)** ✅: `POST /user_rm/potential` con body `{ exercise_id, weight, max_reps }`. Valida que el ejercicio exista (404), que el peso sea > 0 y que las reps sean un entero ≥ 1. **No persiste nada**, como pide la spec.
  - **Forma elegida (decisión del usuario):** en vez de devolver un único número, devuelve la **tabla completa de 1RM a 12RM**. Se calcula el 1RM con Epley directo (`peso × (1 + reps/30)`) y de ahí se derivan las demás filas con la inversa (`1RM / (1 + n/30)`). La fila `n = max_reps` devuelve exactamente el peso informado, lo que valida la tabla.
  - **Fila 1RM:** usa el Epley **directo**, no la inversa. La inversa en n=1 da ~3% menos y no coincidiría con el 1RM que muestra cualquier otra calculadora; se privilegió que el número sea cruzable con el resto del mundo.
  - **Rango fijo 1→12**, sin importar el `max_reps` recibido: es el rango estándar y más allá de 12 repeticiones Epley pierde precisión.
  - Valores con 2 decimales; el redondeo a disco queda del lado del cliente.
  - **Caso borde `max_reps = 1` contemplado:** Epley asume más de una repetición, así que aplicarlo a 1 rep inflaba el resultado un 3.3% (informar «120 kg a 1 repetición» devolvía `1RM = 124`). Ahora, si `max_reps === 1`, el peso informado **es** el 1RM y la tabla se deriva de ahí. Verificado sobre 6 combinaciones de peso/reps: en todas, la fila `n = max_reps` devuelve exactamente el peso informado.
- **CU-E-26 / E-27 / E-28 (estado y tipo de membresía)** ✅: tres endpoints nuevos en `MembershipController`, todos `@Auth(coach, admin)`.
  - `GET /membership/status/summary` — contadores de alumnos por estado.
  - `GET /membership/status/users?status=` — alumnos filtrados por estado.
  - `GET /membership/type/users?membership_id=` — alumnos por tipo; **sin** el parámetro devuelve todos los tipos agrupados (404 si el `membership_id` no existe).
  - **Estado derivado, no persistido:** la spec de E-26 pide explícitamente derivarlo de `Membership_Payment.expired_at` contra la fecha actual. Se ignora a propósito el flag `active` del pago, que lo pisa un cron a las 03:00 y durante el día puede estar desfasado. De cada alumno manda el pago de `expired_at` más lejano.
  - **Ventana "por vencer" configurable:** variable de entorno **`MEMBERSHIP_EXPIRING_SOON_DAYS`**, default **7** días. Se lee una vez al construir el service vía `ConfigService`; si falta o no es un entero ≥ 0, cae al default y avisa por consola. El valor se devuelve en las respuestas como `expiring_soon_days`. **No está expuesta al cliente** (no es query param). Como `.env` está gitignoreado, hay que agregarla a mano en cada entorno donde se quiera cambiar el default.
  - **Alumnos sin pagos:** no entran en activa/por vencer/vencida; van a un contador propio `no_payments` y quedan fuera de la agrupación por tipo (se informan aparte como `without_payments`).
  - **Corte de la ventana a fin de día:** los vencimientos se persisten a las 23:59:59.999 (ver `calculateExpirationDate`), así que el umbral también se corta a fin del día N. Si no, una membresía que vence justo dentro de N días quedaba como "activa" por unas horas de diferencia. Verificado sobre 8 casos de borde (vencida ayer, vence hoy, en 3, en 7, en 8 y en 30 días).
  - **Resolución en memoria:** se traen los alumnos con sus pagos y se clasifica en JS, en vez de un `DISTINCT ON`. Es específico de PostgreSQL, más frágil de mantener, y el volumen es de escala gimnasio.
- **Bloque del 14/8 cerrado** (7 de 8 + U-10 parcial). Lo que sigue es **Circuitos (21/8)**.

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

1. **Routine y Planification siguen siendo andamiaje** *(actualizado 19/8)*. Las rutas de rutinas y planificaciones están declaradas pero con la llamada al service comentada, y `planification.service.ts` sigue vacío. `routine.service.ts` **ya no está vacío**: tiene los métodos reales de circuitos (E-21/E-24), pero ninguno de rutinas. Siguen siendo **14 CU** (E-08→E-19, U-08, U-09): el mayor bloque de trabajo pendiente.
2. ~~**El módulo `/auth` está completamente comentado.**~~ **Resuelto (2026-08-11):** el módulo viejo se eliminó; logout (U-03) y recuperar contraseña (U-04) se implementaron en `/users`. Queda pendiente el registro social (fuera de los 72 CU).
3. **Circuitos: a mitad de camino** *(actualizado 19/8)*. Entidades ✅ (`Circuit` reutilizable + `Routine_Circuit`) y **E-21/E-24 implementados** — listado con filtros, detalle anidado y baja lógica, todo en `routine.controller.ts`/`routine.service.ts`: **no hay módulo ni controller propio de circuitos**, conviven con rutinas porque dependen entre sí. Falta sólo **E-23** (editar), pausado a propósito: recibe la lista completa de ejercicios con sus series y tiene que reconciliar (mantener / crear / eliminar), y esa reconciliación decide qué pasa con los `Exercise_Set` que los usuarios ya marcaron como hechos.
4. **Falta la gestión de "Mi Cuenta" del usuario:** ~~cambiar contraseña (U-05), editar datos (U-06)~~ **resueltos (2026-08-18)**; siguen pendientes marcar serie (U-12) y notas del ejercicio (U-13), ambos atados al bloque de Rutinas. ~~RM potenciales (U-16)~~ **resuelto (2026-08-18)**.
5. **Falta el tracking de entrenamientos (E-06/E-07).** ~~No hay endpoints de "alumnos" con filtro por rol/entrenador~~ **resuelto (2026-08-06)**: E-01→E-03 ✅ vía `GET /users/all` con filtros/paginación y `POST /users/set-active/:id`. ~~Ni estados/tipos de membresía agregados (E-26→E-28).~~ **Resuelto (2026-08-18).** Lo que queda es el historial de entrenamientos y su filtro por ejercicio, que dependen del bloque de Rutinas (28/8).
6. ~~**La autorización es manual, no centralizada.**~~ **Resuelto (2026-08-11):** se centralizó con Guards + `@Auth(...)` en los 7 controllers (ver *Cambios recientes 2026-08-11*).
7. **Sin infraestructura de migraciones y `synchronize: false`.** No existe carpeta `migrations`, `data-source` ni scripts typeorm en `package.json`: todo cambio de columna se aplica **regenerando la base** con `Db Creator` (01 → 02 → 03). **Consecuencia práctica:** cada cambio de entidad obliga a decidir cómo se aplica sobre la base viva. El de circuitos (19/8) se resolvió con un `ALTER` puntual escrito a mano y ya está aplicado, pero no queda registro versionado de ese delta: la única fuente reproducible sigue siendo regenerar de cero.

---

## Próximas semanas — cronograma del servidor (hasta 4/9)

> Organizado por **viernes** (clases). El **7/8** (infra y transversales) está **cerrado**: DB regenerada, autorización centralizada con Guards y CU-U-03/U-04 implementados. El **14/8** quedó **parcial** (ver abajo). Lo que sigue, hasta la **fecha límite de entrega del servidor (4/9)**:

| Viernes | Foco | Casos de uso |
|---|---|---|
| **14/8** ✅ | CU sin dependencias — **7 de 8** (+ U-10 parcial) | ✅ cambiar contraseña (**U-05**), ✅ editar datos personales (**U-06**), ✅ filtrar RMs por usuario (**U-11**), ✅ RMs potenciales (**U-16**), ✅ estado y tipos de membresía + alumnos por estado/tipo (**E-26→E-28**) · 🟡 detalle de ejercicio (**U-10**): ficha de catálogo expuesta, el resto depende de Rutinas |
| **21/8** ✅ | Circuitos — **3 de 4** | ✅ obtener (**E-21**), ✅ crear (**E-22**), ✅ baja lógica (**E-24**), más el detalle y el listado con ejercicios (`/all-plus`). ⏸️ editar (**E-23**) pausado por decisión de diseño: hay que definir qué pasa con los sets ya marcados por los alumnos |
| **28/8** | Rutinas | Implementar el service de rutinas (**E-15→E-18**); asignar/desasignar rutinas a alumnos (**E-19, E-20**); marcar series realizadas (**U-12**) y notas del ejercicio (**U-13**); historial de entrenamientos y su filtro (**E-06, E-07**) |
| **4/9** | Planificaciones y cierre | Service de planificaciones (**E-08→E-11**); asignar rutinas y planificaciones a alumnos (**E-12→E-14**); planificación activa y detalle de rutina del usuario (**U-08, U-09**); pruebas de integración sobre la API + Swagger. **🎯 Hito: servidor con los 72 CU cubiertos** |

> Secuencia según dependencias: primero los CU independientes, luego **Circuitos**, sobre ellos las **Rutinas** y por último las **Planificaciones** que las agrupan.

> **Riesgo abierto (18/8):** los 6 CU pausados del 14/8 no bloquean a nadie, pero **Circuitos sí** — es la base de las Rutinas (28/8) y éstas de las Planificaciones (4/9). Si el 21/8 se corre, se corre toda la cadena hasta el hito del servidor.

> **Actualización (22/8):** **Circuitos deja de ser el cuello de botella.** E-21, E-22 y E-24 están implementados y la base está migrada, así que **Rutinas (28/8) ya se puede arrancar**: `Routine_Circuit` existe y hay circuitos reales para ensamblar. E-23 quedó pausado a propósito y **no bloquea a Rutinas** — se puede retomar en cualquier momento, incluso después del 28/8.

---

## Detalle — Rol Usuario (20 CU · 70%)

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
| CU-U-16 | Calcular mis RM potenciales | ✅ Implementado | `POST /user_rm/potential` · Epley, tabla 1RM→12RM, no persiste |
| CU-U-17 | Registrar un RM | ✅ Implementado | `POST /user_rm/create` |
| CU-U-18 | Editar un RM | ✅ Implementado | `POST /user_rm/edit/:id` |
| CU-U-19 | Obtener mis RMs | ✅ Implementado | `GET /user_rm/user/:id` |
| CU-U-20 | Eliminar un RM | ✅ Implementado | `DELETE /user_rm/:id` |

---

## Detalle — Rol Entrenador (29 CU · 45%)

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
| CU-E-11 | Eliminar planificación sistémica (lógico) | 🔵 Andamiaje | pasa a baja lógica (22/8): será `POST /planification/set-active/:id` |
| CU-E-12 | Asignar rutina a planificación | 🔵 Andamiaje | `POST /planification/routine/assign` · comentado |
| CU-E-13 | Asignar planificación a alumno | 🔵 Andamiaje | `POST /planification/user/assign` · comentado |
| CU-E-14 | Eliminar planificación a alumno | 🔵 Andamiaje | `DELETE /planification/user/:id` · comentado |

### Administrar rutinas
| CU | Caso de uso | Estado | Endpoint / nota |
|---|---|---|---|
| CU-E-15 | Obtener rutinas sistémicas | 🔵 Andamiaje | `GET /routine/all` · comentado |
| CU-E-16 | Crear rutina sistémica | 🔵 Andamiaje | `POST /routine/create` · comentado |
| CU-E-17 | Editar rutina sistémica | 🔵 Andamiaje | `POST /routine/edit/:id` · comentado |
| CU-E-18 | Eliminar rutina sistémica (lógico) | 🔵 Andamiaje | pasa a baja lógica (22/8): será `POST /routine/set-active/:id` |
| CU-E-19 | Asignar rutina a alumno | 🔵 Andamiaje | `POST /planification/routine/assign-user` · comentado |
| CU-E-20 | Eliminar rutina a alumno | ⬜ No implementado | sin ruta para quitar routine-asignation-user |

### Administrar circuitos
| CU | Caso de uso | Estado | Endpoint / nota |
|---|---|---|---|
| CU-E-21 | Obtener circuitos | ✅ Implementado | `GET /routine/circuit/all` · filtros keyword/type/include_inactive + `exercise_count` |
| CU-E-22 | Crear circuito | ✅ Implementado | `POST /routine/circuit/create` · circuito + ejercicios + series en una transacción |
| CU-E-23 | Editar circuito | ⬜ No implementado | pendiente de refinar la reconciliación |
| CU-E-24 | Eliminar circuito (lógico) | ✅ Implementado | `POST /routine/circuit/set-active/:id` · flag `{ active }` |

### Gestionar membresías
| CU | Caso de uso | Estado | Endpoint / nota |
|---|---|---|---|
| CU-E-25 | Obtener membresías | ✅ Implementado | `GET /membership/all` |
| CU-E-26 | Obtener estado de membresías | ✅ Implementado | `GET /membership/status/summary` · contadores derivados de `expired_at` |
| CU-E-27 | Obtener alumnos por estado de membresía | ✅ Implementado | `GET /membership/status/users?status=` · active / expiring_soon / expired / no_payments |
| CU-E-28 | Obtener alumnos por tipo de membresía | ✅ Implementado | `GET /membership/type/users?membership_id=` · sin el param, agrupa por tipo |
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
3. ~~**Circuitos** (E-21→E-24)~~ **cerrado el 22/8** salvo **E-23** (editar), pausado por diseño y sin bloquear a nadie. Lo que sigue es **Rutinas** (E-15→E-18): ensamblar `Routine_Circuit` sobre los circuitos ya existentes.
4. ~~**Gestión de cuenta del Usuario** (U-05, U-06) y auth (U-03, U-04).~~ **Cerrado** (U-03/U-04 el 11/8, U-05/U-06 el 18/8).
5. **Transversal:** Guards de autenticación/roles antes de que crezca el volumen de endpoints; definir estrategia de migraciones para cambios de schema.

---

## Cómo leer los estados

- **✅ Implementado** — el endpoint existe y su service ejecuta lógica real y validada.
- **🟡 Parcial** — funciona a medias: resuelto dentro de otro endpoint, sin filtro por usuario, o con la lógica lista pero sin ruta expuesta.
- **🔵 Andamiaje** — la ruta está declarada pero el service está vacío y la llamada comentada: responde, no ejecuta nada.
- **⬜ No implementado** — no existe endpoint, service ni módulo que cubra el caso de uso.

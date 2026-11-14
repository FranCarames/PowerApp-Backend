# Generador de seed - PowerApp

Genera **tres** scripts SQL para levantar la base de datos desde cero:

1. `01_estructura.sql`      → DDL: tablas, ENUMs, foreign keys, índices.
2. `02_datos_estaticos.sql` → catálogo que la app **siempre** necesita:
   `Muscle_Group`, `Muscle`, `Exercise`, `Exercised_Muscle` y `Circuit_Type` (los cinco
   tipos de circuito: sin uno activo no se puede crear ningún circuito).
3. `03_datos_dinamicos.sql`  → datos de **prueba** para testear:
   `User`, `Coach`, `Membership`, `Membership_Payment`, `User_RM` y la **cadena de
   entrenamiento** (circuitos, rutinas, planificaciones, asignaciones y ejecuciones,
   con un escenario por alumno; ver más abajo).

## Cómo correrlo

Necesitás Python 3 (sin librerías externas). Parado en la carpeta con los `.py`:

```bash
python3 build_sql.py
```

Genera/sobrescribe los tres `.sql` en la misma carpeta e imprime un resumen.

## Cómo aplicar los SQL en la base (en orden)

```bash
psql "<tu_connection_string>" -f 01_estructura.sql
psql "<tu_connection_string>" -f 02_datos_estaticos.sql
psql "<tu_connection_string>" -f 03_datos_dinamicos.sql
```

El orden importa: la estructura primero, después los estáticos (que las FK
necesitan), y al final los dinámicos (usuarios, pagos, etc.).

## Estructura del proyecto

| Archivo            | Qué contiene                                                       |
|--------------------|-------------------------------------------------------------------|
| `build_sql.py`     | **Orquestador**. Es el único que ejecutás. Arma los 3 `.sql`.     |
| `ddl.py`           | El DDL completo (estructura de la base).                          |
| `gen_seed.py`      | Grupos musculares, 35 músculos (18 existentes + 6 nuevos) y los 5 tipos de circuito (`CIRCUIT_TYPES`). |
| `imagenes.py`      | URLs de las imágenes del catálogo (BE-47): la constante `ASSETS_BASE` y una función por columna. |
| `imagenes_manifiesto.py` | **Generado** por el repo PowerApp-Assets: los ids de los ejercicios que tienen foto. No se edita a mano. |
| `static_extra.py`  | Los 2 ejercicios "Sentadilla" originales y sus vínculos.          |
| `catalogo_ejercicios.py` | Catálogo de los 206 ejercicios en una lista única `EXERCISES`, organizada por secciones (disciplina). |
| `dynamic_data.py`  | Datos de prueba: usuarios, coaches, membresías, pagos, RMs y la cadena de entrenamiento. |

## Cómo agregar datos

- **Un ejercicio nuevo (estático):** agregá una tupla a la lista `EXERCISES` en
  `catalogo_ejercicios.py` (en la sección de disciplina que corresponda):
  `("Nombre", ["pec_medio","triceps_lateral"], "desc...", "safety...", "activation...")`.
  El primer músculo es el primario. Las keys válidas están en `gen_seed.py`.

- **Un usuario/coach/pago de prueba (dinámico):** agregá una tupla a la lista
  correspondiente en `dynamic_data.py`.

Después volvé a correr `python3 build_sql.py`.

## La cadena de entrenamiento (BE-21)

`dynamic_data.py` termina con la sección «Cadena de entrenamiento»: 7 circuitos (5 Principal, 1
Superserie y 1 AMRAP: el tipo de cada uno es el nombre de un tipo de `gen_seed.CIRCUIT_TYPES`, y
`_build_training()` corta la generación si no lo es), 6 rutinas,
4 planificaciones (27 rutinas en semanas), 5 planes asignados, 7 rutinas individuales y las
ejecuciones de los alumnos (17 en la vía individual, 27 en la del plan), con un escenario por
alumno para poder demostrar cada flujo de U-08 a E-07 sin cargar nada a mano:

| Alumno | Qué tiene |
|---|---|
| Lucía | Plan «Fuerza 4 semanas» vigente desde el 19/10, con la semana 1 casi completa; una individual el 24/10 |
| Mateo | Plan «Fuerza» vigente desde el 26/10 sin marcas; una individual pasada, completa |
| Sofía | Plan «Fuerza» **quitado** con marcas; «Hipertrofia 6 semanas» vigente desde el 26/10 |
| Tomás | «Hipertrofia» **futura** (desde el 30/11); una individual futura sin marcas |
| Valentina | **Sin plan**; individuales: una hecha, dos el mismo día y una futura |

Incluye los casos borde de baja lógica: un circuito apagado en «Full Body» con un ejercicio
completado, un ejercicio dado de baja con una marca y una rutina quitada de la semana 2 del plan
con una marca.

- **Las fechas son fijas** (octubre a diciembre de 2026): el seed no puede saber qué día se
  aplica y la regeneración tiene que dar los mismos bytes. El home se navega mandando `date`.
- **Los `INSERT` de la cadena usan `ON CONFLICT DO NOTHING` sin objetivo**, así que cubren el id
  y los únicos propios (`uk_rau_routine_user_date`, `uk_raef_asign_exercise`,
  `uk_ref_plan_asignation_exercise`). **Sobre una base viva alcanza con volver a aplicar el
  `03`**: agrega la cadena sin tocar lo que ya haya.
- Para sumar un escenario: agregá filas a `_CIRCUITS`, `_ROUTINES`, `_PLANS`, `_USER_PLANS`,
  `_INDIVIDUALS` o a las marcas dentro de `_build_training()`. Ese método valida las invariantes
  que la base no garantiza (la rutina del plan es de la plantilla de la asignación, el ejercicio
  es de un circuito de la rutina, el inicio es lunes y el fin domingo, etc.) y **corta la
  generación** si alguna no se cumple.

## Notas

- Los UUIDs de los datos nuevos son **deterministas** (derivados del nombre):
  re-generar el SQL da los mismos UUIDs. Los datos originales conservan sus
  UUIDs reales.
- Todos los INSERT usan `ON CONFLICT DO NOTHING`: son idempotentes.
- **Corrección aplicada:** el INSERT original de `Membership_Payment` omitía la
  columna `name` (que es `NOT NULL`), por lo que habría fallado. Acá se incluye
  `name` con el nombre de la membresía referenciada.
- Validado ejecutando los 3 scripts en un PostgreSQL real desde cero, sin errores.
  Conteos actuales que imprime `build_sql.py`: 8 grupos, 35 músculos,
  207 ejercicios, 5 tipos de circuito, 10 usuarios, 3 coaches, 3 membresías, 43 pagos, 83 RMs, y la cadena
  de entrenamiento descripta arriba.
  *(Los conteos dinámicos que figuraban antes acá — 3 usuarios, 1 coach, 1 pago,
  3 RMs — quedaron viejos: `dynamic_data.py` creció desde entonces.)*
- **Qué se probó de la cadena (BE-21):** los tres `.sql` aplicados en un SQLite en memoria con
  las claves foráneas activas (sin violaciones, y el `03` se puede re-aplicar sin duplicar), las
  invariantes de dominio, y el service real de la API ejecutando sus consultas sobre ese seed.
  **No** se aplicó en un Postgres.
- **Tipos de circuito (BE-44):** el `type` libre de `Circuit` pasó a una tabla `Circuit_Type`
  (`circuit_type_id` NOT NULL, FK `RESTRICT`). El `02` siembra Entrada en calor, Principal,
  Superserie, AMRAP y Enfriamiento con UUID v5 de `circuit_type:<nombre>` (`gen_seed.circuit_type_uuid`).
  **Sobre una base viva**, el patch `patches/2026-11-04-be-44.sql` crea la tabla, siembra los mismos
  cinco tipos con los mismos ids, pasa `normal` a Principal, crea un tipo por cada otro valor y borra
  `type`. Es idempotente y aborta sin tocar nada si encuentra algo inesperado. Alternativa
  equivalente: recrear la base con `01` → `02` → `03`.
  Se probó en un **PostgreSQL 16 local** (4/11): los tres `.sql` nuevos desde cero y volviendo a
  aplicar el `02` y el `03`; y el patch sobre una base creada con los `.sql` anteriores, con tipos
  sucios (`Core`, `core `, `''`, `amrap`, `principal`…), dos veces seguidas y con cada una de sus
  guardas. La base vieja parchada queda con los mismos datos que una creada con los `.sql` nuevos.

## Imágenes del catálogo (BE-47)

Las imágenes de ejercicios, músculos y grupos viven en el repo **PowerApp-Assets**, publicado con
GitHub Pages. Cada archivo se llama como el `id` de su fila, así que la URL sale del id:

| Columna | URL |
|---|---|
| `Exercise.preview_image` | `<base>/exercise/preview/<id>.svg` |
| `Exercise.bg_image` | `<base>/exercise/bg/<id>.jpg`, sólo si el ejercicio tiene foto; si no, `NULL` |
| `Muscle.image_url` y `preview_image` | `<base>/muscle/<id>.svg` |
| `Muscle_Group.image_url` y `preview_image` | `<base>/muscle-group/<id>.svg` |

- **La URL base** está en un solo lugar: `ASSETS_BASE`, en `imagenes.py`. Si el repo se muda, se cambia
  ahí y se regenera.
- **Qué ejercicios tienen foto** lo dice `imagenes_manifiesto.py`. Lo escribe el repo de assets con
  `py generator/export_manifest.py`; `Db Creator` no importa ese repo, así la base se puede regenerar
  sin tenerlo clonado. Hay que volver a exportarlo cada vez que cambia la tabla de fotos.
- **Sobre una base viva**, el patch `patches/2026-11-14-be-47.sql` completa esas columnas **sólo donde
  están en `NULL`**: no pisa una imagen cargada a mano y se puede correr más de una vez. Lo genera
  `build_sql.py` (`build_patch_imagenes`), junto con los tres `.sql`; no se edita a mano. Hace falta
  porque el `02` inserta con `ON CONFLICT (id) DO NOTHING`.

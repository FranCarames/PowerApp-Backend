# PowerApp Backend — Contexto del proyecto

## Qué es

Backend de PowerApp (app de gimnasio/entrenamiento). Stack: **NestJS + TypeORM + PostgreSQL**. El código vive en `power-app/` (entidades en `power-app/src/entities`).

Se implementa **caso de uso por caso de uso (CU)** contra las especificaciones. Las entidades TypeORM son la **fuente de verdad** del modelo ("código primero"): `synchronize` está en `false` y no hay migraciones TypeORM, así que los cambios de schema se aplican **regenerando la base** con los scripts de `Db Creator/`.

> Nota: la DB del proyecto es free-tier y expira cada 30 días; por ahora puede estar vencida. Mientras no haya base viva, la verificación de los cambios es por **compilación** (`npm --prefix power-app run build`), sin runtime.

## Ubicaciones clave

### Documentación actualizada del proyecto (`Doc/`, repo PowerApp-Docs)
`Doc/` vive en el **repo de documentación** (`D:\Power App\Docs\PowerApp-Docs\Doc`, GitHub `FranCarames/PowerApp-Docs`), no en este, y guarda la documentación **vigente** del proyecto — sobre todo el **modelo de datos actualizado**. Es la **fuente de verdad** ante cualquier duda de estructura/modelo: las entidades TypeORM del back pueden estar desactualizadas respecto de lo que hay acá, así que ante conflicto, este es el modelo que manda. Toda documentación nueva del proyecto, incluidas las specs y planes de cada cambio (`Doc/specs/`, `Doc/plans/`), se guarda en ese repo, no en este.

### Especificaciones de Casos de Uso
`D:\Power App\Docs\PowerApp-Docs\Use Cases\` (repo de documentación, **fuera de este repo**; es la fuente de verdad). La vieja copia en `D:\Power App\Documentation\` quedó como archivo histórico: no se usa.
- Subcarpetas por rol: `admin/`, `entrenador/`, `usuario/`.
- `README.md` es el índice de los CU.
- Un `.md` por CU (ej. `entrenador/CU-E-03-cerrar-cuenta-de-alumno.md`).

### Artefactos de Status (`Status/`)
Reflejan el avance de implementación de los CU. **Se mantienen a mano.**
El repo de documentación (`PowerApp-Docs`) publica una **copia** de estos dos archivos, que **el usuario sincroniza a mano**. En el flujo de Status se editan **sólo** los de este repo: no tocar `PowerApp-Docs`.
- `Status/estado-implementacion-CU.md` — informe: mapeo 1:1 de cada CU vs el código (estado, endpoint, notas), conteos por rol, hallazgos y sección "Cambios recientes".
- `Status/dashboard-estado-CU.html` — dashboard visual del mismo informe (copia local del artifact publicado en claude.ai).

### Scripts de recreación de la DB (`Db Creator/`)
**Única** fuente para levantar la base desde cero (la vieja carpeta `db/` se eliminó por duplicada). Pipeline generador en Python (sin librerías externas):
- `build_sql.py` — orquestador. Se corre con `python build_sql.py` parado en la carpeta; genera/sobrescribe los 3 `.sql`.
- `ddl.py` — **fuente del DDL** (tablas, ENUMs, FKs, índices) → genera `01_estructura.sql`.
- `gen_seed.py`, `static_extra.py`, `catalogo_ejercicios.py` — datos estáticos → `02_datos_estaticos.sql`.
- `dynamic_data.py` — datos de prueba → `03_datos_dinamicos.sql`.
- Aplicar en orden: `01_estructura.sql` → `02_datos_estaticos.sql` → `03_datos_dinamicos.sql`.

Mapa entidad → script que la referencia:

| Entidad / tabla | Estructura (DDL) | Datos (INSERT) |
|---|---|---|
| *Todas* | `ddl.py` → `01_estructura.sql` | — |
| `Muscle_Group`, `Muscle`, `Exercise`, `Exercised_Muscle` | `ddl.py` | `gen_seed.py` / `static_extra.py` / `catalogo_ejercicios.py` → `02_datos_estaticos.sql` |
| `User`, `Coach`, `Membership`, `Membership_Payment`, `User_RM` | `ddl.py` | `dynamic_data.py` → `03_datos_dinamicos.sql` |

## Regla de mantenimiento (IMPORTANTE)

**Cada vez que se modifica la estructura de una clase/entidad** (agregar, quitar o cambiar un campo), en el mismo cambio hay que actualizar:

1. **Los artefactos de Status** — `Status/estado-implementacion-CU.md` y `Status/dashboard-estado-CU.html`: reflejar el/los CU afectados y los conteos.
2. **Los scripts de `Db Creator` que referencian esa clase** — como mínimo `ddl.py` y su salida `01_estructura.sql`; y si cambia la lista de columnas de un INSERT, el generador de datos correspondiente (`gen_seed.py` / `static_extra.py` / `catalogo_ejercicios.py` / `dynamic_data.py`) y su `.sql` generado (`02` / `03`). Usar el mapa de arriba para saber cuáles tocar.

> Los `.sql` se pueden regenerar con `python build_sql.py` dentro de `Db Creator/`, y deben quedar **en sync** con los `.py` (verificable regenerando y comparando).

## Flujo de trabajo por cambio

1. Implementar el cambio en `power-app/src`.
2. Verificar compilación: `npm --prefix power-app run build`.
3. Si cambió la **estructura** de una entidad → actualizar los scripts de `Db Creator` (regla de arriba).
4. Actualizar los **artefactos de Status** (informe `.md` + dashboard `.html`), sólo en este repo (la copia al sitio de `PowerApp-Docs` la sincroniza el usuario).
5. Commit (el usuario commitea con su estilo).

> Las **specs** (`Doc/specs/`) y **planes** (`Doc/plans/`) de cada cambio se escriben en el repo `PowerApp-Docs` y se dejan stageados ahí. Cada repo tiene su propio commit, que hace el usuario.

# Generador de seed - PowerApp

Genera **tres** scripts SQL para levantar la base de datos desde cero:

1. `01_estructura.sql`      → DDL: tablas, ENUMs, foreign keys, índices.
2. `02_datos_estaticos.sql` → catálogo que la app **siempre** necesita:
   `Muscle_Group`, `Muscle`, `Exercise`, `Exercised_Muscle`.
3. `03_datos_dinamicos.sql`  → datos de **prueba** para testear:
   `User`, `Coach`, `Membership`, `Membership_Payment`, `User_RM`.

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
| `gen_seed.py`      | Grupos musculares y 35 músculos (18 existentes + 6 nuevos).       |
| `static_extra.py`  | Los 2 ejercicios "Sentadilla" originales y sus vínculos.          |
| `catalogo_ejercicios.py` | Catálogo de los 206 ejercicios en una lista única `EXERCISES`, organizada por secciones (disciplina). |
| `dynamic_data.py`  | Datos de prueba: usuarios, coaches, membresías, pagos, RMs.       |

## Cómo agregar datos

- **Un ejercicio nuevo (estático):** agregá una tupla a la lista `EXERCISES` en
  `catalogo_ejercicios.py` (en la sección de disciplina que corresponda):
  `("Nombre", ["pec_medio","triceps_lateral"], "desc...", "safety...", "activation...")`.
  El primer músculo es el primario. Las keys válidas están en `gen_seed.py`.

- **Un usuario/coach/pago de prueba (dinámico):** agregá una tupla a la lista
  correspondiente en `dynamic_data.py`.

Después volvé a correr `python3 build_sql.py`.

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
  207 ejercicios, 10 usuarios, 3 coaches, 3 membresías, 43 pagos, 83 RMs.
  *(Los conteos dinámicos que figuraban antes acá — 3 usuarios, 1 coach, 1 pago,
  3 RMs — quedaron viejos: `dynamic_data.py` creció desde entonces.)*

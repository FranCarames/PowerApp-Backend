# CU-E-02 — Obtener alumnos — Filtro por nombre

**Rol:** Entrenador  
**Paquete:** Administrar Alumnos

## Descripción breve

Variante de «Obtener alumnos» que acota el listado a los alumnos cuyo nombre coincide con un texto de búsqueda.

## Actores involucrados

- **Principal:** Entrenador autenticado
- **Secundarios:** —

## Alcance

**Cubre:**

- Filtrado del listado de alumnos del coach por coincidencia de nombre.

**Fuera de alcance:**

- Filtros por otros criterios (estado/tipo de membresía, que tienen CU propios).

## Precondiciones

- Existe una sesión activa con rol Entrenador.

## Postcondiciones

- Operación de solo lectura.

## Camino principal (flujo básico)

1. El entrenador ingresa un texto de búsqueda por nombre.
2. El sistema recupera los alumnos del coach que coinciden con el texto.
3. El sistema presenta el listado filtrado.

## Caminos alternativos / excepciones

### En el paso 2 — Sin coincidencias

1. Ningún alumno coincide con la búsqueda.
2. El sistema muestra un estado vacío.

# CU-E-12 — Asignar Rutina a Planificación Sistémica

**Rol:** Entrenador  
**Paquete:** Administrar Planificaciones

## Descripción breve

Vincula una rutina sistémica a una planificación, definiendo su posición mediante Routine_Asignation (campo order).

## Actores involucrados

- **Principal:** Entrenador autenticado
- **Secundarios:** —

## Casos de uso incluidos («include»)

- Obtener Rutinas Sistémicas

## Alcance

**Cubre:**

- Alta de un vínculo Routine_Asignation entre rutina y planificación con su order.

**Fuera de alcance:**

- Creación de la rutina (CU aparte).

## Precondiciones

- Existe una sesión activa con rol Entrenador.
- La planificación y la rutina existen.

## Postcondiciones

- Existe un Routine_Asignation que liga la rutina a la planificación en la posición indicada.

## Camino principal (flujo básico)

1. El entrenador abre una planificación y elige agregar una rutina.
2. El sistema lista las rutinas sistémicas disponibles.
3. El entrenador selecciona la rutina y su orden.
4. El sistema crea el Routine_Asignation y confirma.

## Caminos alternativos / excepciones

### En el paso 4 — Rutina ya asignada en esa posición

1. Conflicto de order o vínculo duplicado.
2. El sistema informa el conflicto y no duplica el vínculo.

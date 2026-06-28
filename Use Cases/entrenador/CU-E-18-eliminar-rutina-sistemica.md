# CU-E-18 — Eliminar Rutina Sistémica

**Rol:** Entrenador  
**Paquete:** Administrar Rutinas

## Descripción breve

Elimina una rutina sistémica respetando las restricciones de integridad referencial.

## Actores involucrados

- **Principal:** Entrenador autenticado
- **Secundarios:** —

## Alcance

**Cubre:**

- Baja de la Routine sistémica seleccionada y de sus vínculos a circuitos.

**Fuera de alcance:**

- Baja de los circuitos que la componen (son reutilizables).

## Precondiciones

- Existe una sesión activa con rol Entrenador.
- La rutina existe.

## Postcondiciones

- La Routine deja de estar disponible.

## Camino principal (flujo básico)

1. El entrenador selecciona una rutina y solicita eliminarla.
2. El sistema pide confirmación.
3. El sistema verifica que no esté en uso por planificaciones y la elimina.
4. El sistema confirma la baja.

## Caminos alternativos / excepciones

### En el paso 2 — Cancela la confirmación

1. El entrenador cancela.
2. El sistema no elimina nada.

### En el paso 3 — Rutina en uso

1. La rutina está asignada a una planificación o alumno.
2. El sistema impide la baja e informa la restricción.

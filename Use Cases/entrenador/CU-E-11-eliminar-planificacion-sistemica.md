# CU-E-11 — Eliminar Planificación Sistémica

**Rol:** Entrenador  
**Paquete:** Administrar Planificaciones

## Descripción breve

Elimina una planificación sistémica, respetando las restricciones de integridad referencial.

## Actores involucrados

- **Principal:** Entrenador autenticado
- **Secundarios:** —

## Alcance

**Cubre:**

- Baja de la Planification sistémica seleccionada.

**Fuera de alcance:**

- Baja de las planificaciones ya asignadas a alumnos (User_Planification).

## Precondiciones

- Existe una sesión activa con rol Entrenador.
- La Planification existe.

## Postcondiciones

- La Planification deja de estar disponible como plantilla.

## Camino principal (flujo básico)

1. El entrenador selecciona una planificación y solicita eliminarla.
2. El sistema pide confirmación.
3. El sistema verifica que no esté en uso y la elimina.
4. El sistema confirma la baja.

## Caminos alternativos / excepciones

### En el paso 2 — Cancela la confirmación

1. El entrenador cancela.
2. El sistema no elimina nada.

### En el paso 3 — Planificación en uso

1. La planificación está asignada a alumnos.
2. El sistema impide la baja e informa la restricción.

# CU-E-14 — Eliminar Planificación a Alumno

**Rol:** Entrenador  
**Paquete:** Administrar Planificaciones

## Descripción breve

Quita la planificación asignada a un alumno, eliminando su User_Planification y las User_Routine derivadas.

## Actores involucrados

- **Principal:** Entrenador autenticado
- **Secundarios:** —

## Alcance

**Cubre:**

- Baja de la User_Planification del alumno y de sus User_Routine asociadas.

**Fuera de alcance:**

- Baja de la planificación sistémica (plantilla).

## Precondiciones

- Existe una sesión activa con rol Entrenador.
- El alumno tiene la planificación asignada.

## Postcondiciones

- El alumno deja de tener esa planificación asignada y desaparece de su home.

## Camino principal (flujo básico)

1. El entrenador abre la asignación del alumno y solicita quitarla.
2. El sistema pide confirmación.
3. El sistema elimina la User_Planification y sus User_Routine, y confirma.

## Caminos alternativos / excepciones

### En el paso 2 — Cancela la confirmación

1. El entrenador cancela.
2. El sistema no realiza cambios.

-- =============================================================
--  Patch 2026-08-27 - CU-E-17 (editar rutina sistemica)
--
--  Lleva una base YA CREADA al esquema nuevo, sin recrearla desde cero.
--  Equivale a los cambios que ddl.py metio en 01_estructura.sql.
--
--  QUE HACE
--    1. Agrega Routine_Circuit.active -> baja logica del vinculo rutina-circuito.
--       Ninguna FK apunta a esta tabla, asi que no es para proteger historial:
--       es para conservar la traza de que circuitos integraron la rutina.
--    2. Saca el NOT NULL de Routine_Circuit."order". El order se normaliza a 1..N
--       en cada escritura, asi que un vinculo apagado no ocupa ninguna posicion y
--       queda en NULL; dejarle el numero viejo haria que la columna signifique dos
--       cosas y repitiera posiciones que ya ocupa otro circuito.
--
--  No migra datos: las filas existentes quedan active = true por el DEFAULT y
--  conservan su order, que es exactamente lo que corresponde.
--
--  Es idempotente: correrlo dos veces no rompe nada.
--  Alternativa equivalente: recrear la base con 01 -> 02 -> 03.
-- =============================================================

BEGIN;

-- -------------------------------------------------------------
-- 1. Baja logica del circuito dentro de la rutina
-- -------------------------------------------------------------
ALTER TABLE public."Routine_Circuit"
    ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT true;

-- -------------------------------------------------------------
-- 2. El order deja de ser obligatorio (NULL en los apagados)
-- -------------------------------------------------------------
ALTER TABLE public."Routine_Circuit"
    ALTER COLUMN "order" DROP NOT NULL;

COMMIT;

-- =============================================================
--  VERIFICACION (correr despues, deberia devolver 2 filas con 'ok')
-- =============================================================
-- SELECT 'Routine_Circuit.active existe' AS chequeo,
--        CASE WHEN COUNT(*) = 1 THEN 'ok' ELSE 'FALTA' END AS resultado
--   FROM information_schema.columns
--  WHERE table_schema = 'public'
--    AND table_name   = 'Routine_Circuit'
--    AND column_name  = 'active'
-- UNION ALL
-- SELECT 'Routine_Circuit."order" es nullable',
--        CASE WHEN is_nullable = 'YES' THEN 'ok' ELSE 'SIGUE NOT NULL' END
--   FROM information_schema.columns
--  WHERE table_schema = 'public'
--    AND table_name   = 'Routine_Circuit'
--    AND column_name  = 'order';

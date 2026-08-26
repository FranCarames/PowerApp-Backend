-- =============================================================
--  Patch 2026-08-25 - CU-E-23 (editar circuito)
--
--  Lleva una base YA CREADA al esquema nuevo, sin recrearla desde cero.
--  Equivale a los cambios que ddl.py metio en 01_estructura.sql.
--
--  QUE HACE
--    1. Agrega Routine_Exercise.active  -> baja logica del ejercicio del circuito.
--    2. Reemplaza Routine_Exercise_Set_Finished por Routine_Exercise_Finished:
--       el registro de "hecho" pasa a colgar de Routine_Exercise en vez de
--       Exercise_Set, y su FK queda en RESTRICT para que no se pueda perder
--       historial por un delete en cascada.
--
--  OJO: el paso 2 DROPEA la tabla vieja y NO migra datos, porque no habia
--  ninguno que migrar. Si tu base llegara a tener filas ahi, se pierden.
--
--  Es idempotente: correrlo dos veces no rompe nada.
--  Alternativa equivalente: recrear la base con 01 -> 02 -> 03.
-- =============================================================

BEGIN;

-- -------------------------------------------------------------
-- 1. Baja logica del ejercicio dentro del circuito
-- -------------------------------------------------------------
ALTER TABLE public."Routine_Exercise"
    ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT true;

-- -------------------------------------------------------------
-- 2. La tabla de "hecho" pasa a colgar del ejercicio
-- -------------------------------------------------------------
DROP TABLE IF EXISTS public."Routine_Exercise_Set_Finished";

-- La existencia de la fila = ese ejercicio esta hecho en esa instancia de rutina
CREATE TABLE IF NOT EXISTS public."Routine_Exercise_Finished" (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_routine_id     UUID        NOT NULL,
    routine_exercise_id UUID        NOT NULL,
    user_note           VARCHAR(100),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_ref_user_routine
        FOREIGN KEY (user_routine_id)     REFERENCES public."User_Routine"(id)     ON DELETE CASCADE,
    -- RESTRICT a proposito: la baja fisica de un Routine_Exercise solo ocurre cuando no
    -- tiene historial, asi que si esta FK frena un delete es un bug de la reconciliacion
    CONSTRAINT fk_ref_routine_exercise
        FOREIGN KEY (routine_exercise_id) REFERENCES public."Routine_Exercise"(id) ON DELETE RESTRICT,
    CONSTRAINT uk_ref_user_routine_exercise UNIQUE (user_routine_id, routine_exercise_id)
);

CREATE INDEX IF NOT EXISTS idx_ref_user_routine_id     ON public."Routine_Exercise_Finished"(user_routine_id);
CREATE INDEX IF NOT EXISTS idx_ref_routine_exercise_id ON public."Routine_Exercise_Finished"(routine_exercise_id);

COMMIT;

-- =============================================================
--  VERIFICACION (correr despues, deberia devolver 3 filas)
-- =============================================================
-- SELECT 'Routine_Exercise.active' AS chequeo,
--        COUNT(*)::text AS resultado_esperado_1
--   FROM information_schema.columns
--  WHERE table_schema = 'public'
--    AND table_name   = 'Routine_Exercise'
--    AND column_name  = 'active'
-- UNION ALL
-- SELECT 'Routine_Exercise_Finished existe',
--        COUNT(*)::text
--   FROM information_schema.tables
--  WHERE table_schema = 'public'
--    AND table_name   = 'Routine_Exercise_Finished'
-- UNION ALL
-- SELECT 'Routine_Exercise_Set_Finished borrada (esperado 0)',
--        COUNT(*)::text
--   FROM information_schema.tables
--  WHERE table_schema = 'public'
--    AND table_name   = 'Routine_Exercise_Set_Finished';

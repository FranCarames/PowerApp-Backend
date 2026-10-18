-- =============================================================
--  Patch 2026-10-17 - BE-10 (modelo de ejecucion y planificaciones por semanas)
--
--  Lleva una base YA CREADA al esquema nuevo, sin recrearla desde cero.
--  Equivale a los cambios que ddl.py metio en 01_estructura.sql.
--
--  QUE HACE
--    1. Routine_Asignation_User: borra routine_asignation_id y "order"; suma date NOT NULL
--       y UNIQUE (routine_id, user_id, date).
--    2. Crea Routine_Asign_Exercise_Finished (la ejecucion de la via individual).
--    3. Routine_Exercise_Finished: borra user_routine_id; suma user_planification_id y
--       routine_asignation_id (FK RESTRICT) y UNIQUE de las tres FK.
--    4. Borra User_Routine.
--    5. Routine_Asignation: suma week (las filas existentes quedan en la semana 1) y pasa
--       "order" a NOT NULL (las inactivas con order NULL van al final del plan).
--    6. Planification.duration: de VARCHAR(50) a INTEGER NOT NULL.
--    7. User_Planification: borra duration y end_date; number_of_routines a NOT NULL.
--
--  ABORTA, sin tocar nada, si:
--    - User_Routine, Routine_Exercise_Finished o Routine_Asignation_User tienen filas
--      (en su forma vieja). Ningun endpoint las escribe: si las tienen, alguien las lleno a
--      mano y hay que decidir que hacer con esos datos antes de borrar columnas y tablas.
--    - User_Planification tiene filas con number_of_routines NULL que no se pueden completar
--      desde la plantilla (planification_id NULL).
--
--  OJO con la conversion de Planification.duration: toma el PRIMER NUMERO del texto
--  ('12 semanas' -> 12; sin numero -> 0). NO convierte unidades: '3 meses' queda en 3 SEMANAS.
--  Antes de aplicarlo conviene revisar lo que hay:
--      SELECT id, name, duration FROM public."Planification" ORDER BY name;
--  y corregir a mano (en semanas) lo que no sea '<n> semanas'.
--
--  Es idempotente: correrlo dos veces no rompe nada, y las guardas solo miran la forma vieja
--  (despues del patch, Routine_Asignation_User se llena con E-19 y no debe abortar).
--  Correrlo con:  psql -v ON_ERROR_STOP=1 -f 2026-10-17-be-10.sql
--  Alternativa equivalente: recrear la base con 01 -> 02 -> 03.
-- =============================================================

BEGIN;

-- -------------------------------------------------------------
-- 0. Guardas: abortan antes de cambiar nada
-- -------------------------------------------------------------
DO $$
DECLARE
    n bigint;
BEGIN
    IF to_regclass('public."User_Routine"') IS NOT NULL THEN
        EXECUTE 'SELECT COUNT(*) FROM public."User_Routine"' INTO n;
        IF n > 0 THEN
            RAISE EXCEPTION 'Patch BE-10 abortado: User_Routine tiene % fila(s). Ningun endpoint la escribe; revisar de donde salieron antes de borrar la tabla.', n;
        END IF;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns
                WHERE table_schema = 'public' AND table_name = 'Routine_Exercise_Finished'
                  AND column_name = 'user_routine_id') THEN
        EXECUTE 'SELECT COUNT(*) FROM public."Routine_Exercise_Finished"' INTO n;
        IF n > 0 THEN
            RAISE EXCEPTION 'Patch BE-10 abortado: Routine_Exercise_Finished tiene % fila(s) con el esquema viejo (cuelgan de User_Routine). Revisar a mano.', n;
        END IF;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns
                WHERE table_schema = 'public' AND table_name = 'Routine_Asignation_User'
                  AND column_name = 'routine_asignation_id') THEN
        EXECUTE 'SELECT COUNT(*) FROM public."Routine_Asignation_User"' INTO n;
        IF n > 0 THEN
            RAISE EXCEPTION 'Patch BE-10 abortado: Routine_Asignation_User tiene % fila(s) con el esquema viejo (sin date). Revisar a mano.', n;
        END IF;
    END IF;

    SELECT COUNT(*) INTO n
      FROM public."User_Planification" up
      LEFT JOIN public."Planification" p ON p.id = up.planification_id
     WHERE up.number_of_routines IS NULL AND p.id IS NULL;
    IF n > 0 THEN
        RAISE EXCEPTION 'Patch BE-10 abortado: User_Planification tiene % fila(s) con number_of_routines NULL y sin planificacion de la cual copiarlo.', n;
    END IF;
END $$;

-- -------------------------------------------------------------
-- 1. Routine_Asignation_User: una rutina para un dia
-- -------------------------------------------------------------
-- Borrar la columna arrastra su FK (fk_routine_asignation_user_asignation)
ALTER TABLE public."Routine_Asignation_User" DROP COLUMN IF EXISTS routine_asignation_id;
ALTER TABLE public."Routine_Asignation_User" DROP COLUMN IF EXISTS "order";
-- La tabla esta vacia en este punto (la guarda lo asegura), asi que NOT NULL sin default entra
ALTER TABLE public."Routine_Asignation_User" ADD COLUMN IF NOT EXISTS date DATE NOT NULL;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint
                    WHERE conname = 'uk_rau_routine_user_date'
                      AND conrelid = 'public."Routine_Asignation_User"'::regclass) THEN
        ALTER TABLE public."Routine_Asignation_User"
            ADD CONSTRAINT uk_rau_routine_user_date UNIQUE (routine_id, user_id, date);
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_rau_user_date ON public."Routine_Asignation_User"(user_id, date);

-- -------------------------------------------------------------
-- 2. Ejecucion de la via individual
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public."Routine_Asign_Exercise_Finished" (
    id                    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_routine_asign_id UUID        NOT NULL,
    routine_exercise_id   UUID        NOT NULL,
    user_note             VARCHAR(100),
    created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_raef_routine_asignation_user
        FOREIGN KEY (user_routine_asign_id) REFERENCES public."Routine_Asignation_User"(id) ON DELETE RESTRICT,
    CONSTRAINT fk_raef_routine_exercise
        FOREIGN KEY (routine_exercise_id)   REFERENCES public."Routine_Exercise"(id)        ON DELETE RESTRICT,
    CONSTRAINT uk_raef_asign_exercise UNIQUE (user_routine_asign_id, routine_exercise_id)
);

CREATE INDEX IF NOT EXISTS idx_raef_routine_exercise_id ON public."Routine_Asign_Exercise_Finished"(routine_exercise_id);

-- -------------------------------------------------------------
-- 3. Routine_Exercise_Finished cuelga directo del plan y de la rutina
-- -------------------------------------------------------------
-- Borrar la columna arrastra su FK, su UNIQUE y idx_ref_user_routine_id
ALTER TABLE public."Routine_Exercise_Finished" DROP COLUMN IF EXISTS user_routine_id;
-- Vacia en este punto (la guarda lo asegura)
ALTER TABLE public."Routine_Exercise_Finished" ADD COLUMN IF NOT EXISTS user_planification_id UUID NOT NULL;
ALTER TABLE public."Routine_Exercise_Finished" ADD COLUMN IF NOT EXISTS routine_asignation_id UUID NOT NULL;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint
                    WHERE conname = 'fk_ref_user_planification'
                      AND conrelid = 'public."Routine_Exercise_Finished"'::regclass) THEN
        ALTER TABLE public."Routine_Exercise_Finished"
            ADD CONSTRAINT fk_ref_user_planification
            FOREIGN KEY (user_planification_id) REFERENCES public."User_Planification"(id) ON DELETE RESTRICT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint
                    WHERE conname = 'fk_ref_routine_asignation'
                      AND conrelid = 'public."Routine_Exercise_Finished"'::regclass) THEN
        ALTER TABLE public."Routine_Exercise_Finished"
            ADD CONSTRAINT fk_ref_routine_asignation
            FOREIGN KEY (routine_asignation_id) REFERENCES public."Routine_Asignation"(id) ON DELETE RESTRICT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint
                    WHERE conname = 'uk_ref_plan_asignation_exercise'
                      AND conrelid = 'public."Routine_Exercise_Finished"'::regclass) THEN
        ALTER TABLE public."Routine_Exercise_Finished"
            ADD CONSTRAINT uk_ref_plan_asignation_exercise
            UNIQUE (user_planification_id, routine_asignation_id, routine_exercise_id);
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_ref_routine_asignation_id ON public."Routine_Exercise_Finished"(routine_asignation_id);

-- -------------------------------------------------------------
-- 4. User_Routine desaparece (D11). Ya no la referencia ninguna FK
-- -------------------------------------------------------------
DROP TABLE IF EXISTS public."User_Routine";

-- -------------------------------------------------------------
-- 5. Routine_Asignation: semana y orden obligatorios
-- -------------------------------------------------------------
ALTER TABLE public."Routine_Asignation" ADD COLUMN IF NOT EXISTS week INTEGER;
UPDATE public."Routine_Asignation" SET week = 1 WHERE week IS NULL;

-- Las inactivas tenian "order" NULL (la baja se lo borraba). Pasan al final del plan, despues
-- del order mas alto que tenga, en el orden en que se asignaron
UPDATE public."Routine_Asignation" ra
   SET "order" = n.nuevo
  FROM (
        SELECT r.id,
               COALESCE(m.max_order, 0)
               + ROW_NUMBER() OVER (PARTITION BY r.planification_id ORDER BY r.created_at, r.id) AS nuevo
          FROM public."Routine_Asignation" r
          LEFT JOIN (SELECT planification_id, MAX("order") AS max_order
                       FROM public."Routine_Asignation"
                      GROUP BY planification_id) m
            ON m.planification_id = r.planification_id
         WHERE r."order" IS NULL
       ) n
 WHERE ra.id = n.id;

ALTER TABLE public."Routine_Asignation" ALTER COLUMN week SET NOT NULL;
ALTER TABLE public."Routine_Asignation" ALTER COLUMN "order" SET NOT NULL;

-- -------------------------------------------------------------
-- 6. Planification.duration: de texto a semanas (entero)
-- -------------------------------------------------------------
-- El COALESCE va ADENTRO del LEAST: LEAST ignora los NULL y devolveria el tope
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns
                WHERE table_schema = 'public' AND table_name = 'Planification'
                  AND column_name = 'duration' AND data_type = 'character varying') THEN
        ALTER TABLE public."Planification"
            ALTER COLUMN duration TYPE INTEGER
            USING LEAST(COALESCE(substring(duration FROM '[0-9]+')::numeric, 0), 2147483647)::integer;
    END IF;
END $$;
ALTER TABLE public."Planification" ALTER COLUMN duration SET NOT NULL;

-- -------------------------------------------------------------
-- 7. User_Planification: sin duration ni end_date (D12), number_of_routines obligatorio
-- -------------------------------------------------------------
-- Se completa desde la plantilla (DB3-a); la guarda de arriba ya garantizo que se puede
UPDATE public."User_Planification" up
   SET number_of_routines = p.number_of_routines
  FROM public."Planification" p
 WHERE up.planification_id = p.id AND up.number_of_routines IS NULL;

ALTER TABLE public."User_Planification" ALTER COLUMN number_of_routines SET NOT NULL;
ALTER TABLE public."User_Planification" DROP COLUMN IF EXISTS duration;
ALTER TABLE public."User_Planification" DROP COLUMN IF EXISTS end_date;

COMMIT;

-- =============================================================
--  VERIFICACION (correr despues, deberia devolver 8 filas con 'ok')
-- =============================================================
-- SELECT 'User_Routine no existe' AS chequeo,
--        CASE WHEN to_regclass('public."User_Routine"') IS NULL THEN 'ok' ELSE 'SIGUE' END AS resultado
-- UNION ALL
-- SELECT 'Routine_Asign_Exercise_Finished existe',
--        CASE WHEN to_regclass('public."Routine_Asign_Exercise_Finished"') IS NOT NULL THEN 'ok' ELSE 'FALTA' END
-- UNION ALL
-- SELECT 'Routine_Asignation_User tiene date y no tiene order',
--        CASE WHEN (SELECT COUNT(*) FROM information_schema.columns
--                    WHERE table_schema='public' AND table_name='Routine_Asignation_User'
--                      AND column_name IN ('date')) = 1
--              AND (SELECT COUNT(*) FROM information_schema.columns
--                    WHERE table_schema='public' AND table_name='Routine_Asignation_User'
--                      AND column_name IN ('order','routine_asignation_id')) = 0 THEN 'ok' ELSE 'MAL' END
-- UNION ALL
-- SELECT 'Routine_Exercise_Finished cuelga del plan',
--        CASE WHEN (SELECT COUNT(*) FROM information_schema.columns
--                    WHERE table_schema='public' AND table_name='Routine_Exercise_Finished'
--                      AND column_name IN ('user_planification_id','routine_asignation_id')) = 2
--              AND (SELECT COUNT(*) FROM information_schema.columns
--                    WHERE table_schema='public' AND table_name='Routine_Exercise_Finished'
--                      AND column_name = 'user_routine_id') = 0 THEN 'ok' ELSE 'MAL' END
-- UNION ALL
-- SELECT 'Routine_Asignation.week y order NOT NULL',
--        CASE WHEN (SELECT COUNT(*) FROM information_schema.columns
--                    WHERE table_schema='public' AND table_name='Routine_Asignation'
--                      AND column_name IN ('week','order') AND is_nullable = 'NO') = 2 THEN 'ok' ELSE 'MAL' END
-- UNION ALL
-- SELECT 'Planification.duration es integer NOT NULL',
--        CASE WHEN (SELECT data_type || '/' || is_nullable FROM information_schema.columns
--                    WHERE table_schema='public' AND table_name='Planification'
--                      AND column_name='duration') = 'integer/NO' THEN 'ok' ELSE 'MAL' END
-- UNION ALL
-- SELECT 'User_Planification sin duration ni end_date',
--        CASE WHEN (SELECT COUNT(*) FROM information_schema.columns
--                    WHERE table_schema='public' AND table_name='User_Planification'
--                      AND column_name IN ('duration','end_date')) = 0 THEN 'ok' ELSE 'MAL' END
-- UNION ALL
-- SELECT 'User_Planification.number_of_routines NOT NULL',
--        CASE WHEN (SELECT is_nullable FROM information_schema.columns
--                    WHERE table_schema='public' AND table_name='User_Planification'
--                      AND column_name='number_of_routines') = 'NO' THEN 'ok' ELSE 'MAL' END;

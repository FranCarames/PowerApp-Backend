-- =============================================================
--  Patch 2026-10-21 - BE-18 (modelo del bloque B: asignar planificaciones)
--
--  Lleva una base YA CREADA al esquema nuevo, sin recrearla desde cero.
--  Equivale a los cambios que ddl.py metio en 01_estructura.sql.
--  Spec: Doc/specs/2026-10-20-asignar-planificaciones-design.md (repo PowerApp-Docs), §3.
--
--  QUE HACE
--    1. User_Planification: borra description, type y number_of_routines (D18); suma end_date
--       DATE NOT NULL (D17); coach_id y planification_id pasan a NOT NULL, y sus FK a
--       ON DELETE RESTRICT (D19).
--    2. Routine_Exercise_Finished: suma finished_at DATE NOT NULL (D25).
--    3. Routine_Asign_Exercise_Finished: suma finished_at DATE NOT NULL (D25). Las filas que ya
--       existan (pruebas de BE-14) toman el dia de su created_at en hora de Argentina.
--
--  ABORTA, sin tocar nada, si:
--    - User_Planification tiene filas y todavia tiene la forma vieja (con number_of_routines).
--      Ningun endpoint la escribe antes de BE-18b: si tiene filas, alguien la lleno a mano.
--    - Routine_Exercise_Finished tiene filas y todavia no tiene finished_at. Idem (BE-20c).
--
--  Es idempotente: las guardas solo miran la forma vieja (despues del patch, E-13 y el marcar
--  del plan llenan esas tablas, y re-correrlo no debe abortar).
--  Correrlo con:  psql -v ON_ERROR_STOP=1 -f 2026-10-21-be-18.sql
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
    IF EXISTS (SELECT 1 FROM information_schema.columns
                WHERE table_schema = 'public' AND table_name = 'User_Planification'
                  AND column_name = 'number_of_routines') THEN
        EXECUTE 'SELECT COUNT(*) FROM public."User_Planification"' INTO n;
        IF n > 0 THEN
            RAISE EXCEPTION 'Patch BE-18 abortado: User_Planification tiene % fila(s) con el esquema viejo. Ningun endpoint la escribe todavia; revisar a mano antes de borrar columnas.', n;
        END IF;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                    WHERE table_schema = 'public' AND table_name = 'Routine_Exercise_Finished'
                      AND column_name = 'finished_at') THEN
        EXECUTE 'SELECT COUNT(*) FROM public."Routine_Exercise_Finished"' INTO n;
        IF n > 0 THEN
            RAISE EXCEPTION 'Patch BE-18 abortado: Routine_Exercise_Finished tiene % fila(s) sin finished_at. Ningun endpoint la escribe todavia; revisar a mano.', n;
        END IF;
    END IF;
END $$;

-- -------------------------------------------------------------
-- 1. User_Planification: lo propio de la asignacion, con fin guardado
-- -------------------------------------------------------------
ALTER TABLE public."User_Planification" DROP COLUMN IF EXISTS description;
ALTER TABLE public."User_Planification" DROP COLUMN IF EXISTS type;
ALTER TABLE public."User_Planification" DROP COLUMN IF EXISTS number_of_routines;
-- La primera vez la tabla esta vacia (la guarda lo asegura), asi que NOT NULL sin default entra;
-- en una re-corrida la columna ya existe y no se toca
ALTER TABLE public."User_Planification" ADD COLUMN IF NOT EXISTS end_date DATE NOT NULL;
ALTER TABLE public."User_Planification" ALTER COLUMN coach_id SET NOT NULL;
ALTER TABLE public."User_Planification" ALTER COLUMN planification_id SET NOT NULL;

-- Las FK se recrean con RESTRICT: SET NULL es incompatible con NOT NULL
ALTER TABLE public."User_Planification" DROP CONSTRAINT IF EXISTS fk_user_planification_coach;
ALTER TABLE public."User_Planification" ADD CONSTRAINT fk_user_planification_coach FOREIGN KEY (coach_id) REFERENCES public."Coach"(id) ON DELETE RESTRICT;
ALTER TABLE public."User_Planification" DROP CONSTRAINT IF EXISTS fk_user_planification_planification;
ALTER TABLE public."User_Planification" ADD CONSTRAINT fk_user_planification_planification FOREIGN KEY (planification_id) REFERENCES public."Planification"(id) ON DELETE RESTRICT;

-- -------------------------------------------------------------
-- 2. Routine_Exercise_Finished: el dia en que se hizo
-- -------------------------------------------------------------
-- Vacia la primera vez (la guarda lo asegura)
ALTER TABLE public."Routine_Exercise_Finished" ADD COLUMN IF NOT EXISTS finished_at DATE NOT NULL;

-- -------------------------------------------------------------
-- 3. Routine_Asign_Exercise_Finished: el dia en que se hizo
-- -------------------------------------------------------------
-- Puede tener filas de las pruebas de BE-14: la columna entra nullable, se completa con el dia
-- de la marca en hora de Argentina (la mejor aproximacion del dia en que se hizo) y recien
-- despues pasa a NOT NULL
ALTER TABLE public."Routine_Asign_Exercise_Finished" ADD COLUMN IF NOT EXISTS finished_at DATE;
UPDATE public."Routine_Asign_Exercise_Finished"
   SET finished_at = (created_at AT TIME ZONE 'America/Argentina/Buenos_Aires')::date
 WHERE finished_at IS NULL;
ALTER TABLE public."Routine_Asign_Exercise_Finished" ALTER COLUMN finished_at SET NOT NULL;

COMMIT;

-- =============================================================
--  VERIFICACION (correr despues, deberia devolver 6 filas con 'ok')
-- =============================================================
-- SELECT 'User_Planification sin description, type ni number_of_routines' AS chequeo,
--        CASE WHEN (SELECT COUNT(*) FROM information_schema.columns
--                    WHERE table_schema='public' AND table_name='User_Planification'
--                      AND column_name IN ('description','type','number_of_routines')) = 0 THEN 'ok' ELSE 'MAL' END AS resultado
-- UNION ALL
-- SELECT 'User_Planification.end_date es date NOT NULL',
--        CASE WHEN (SELECT data_type || '/' || is_nullable FROM information_schema.columns
--                    WHERE table_schema='public' AND table_name='User_Planification'
--                      AND column_name='end_date') = 'date/NO' THEN 'ok' ELSE 'MAL' END
-- UNION ALL
-- SELECT 'User_Planification.coach_id y planification_id NOT NULL',
--        CASE WHEN (SELECT COUNT(*) FROM information_schema.columns
--                    WHERE table_schema='public' AND table_name='User_Planification'
--                      AND column_name IN ('coach_id','planification_id') AND is_nullable='NO') = 2 THEN 'ok' ELSE 'MAL' END
-- UNION ALL
-- SELECT 'User_Planification: 3 FK, 2 de ellas RESTRICT (coach y plantilla)',
--        CASE WHEN (SELECT COUNT(*) FROM pg_constraint WHERE conrelid='public."User_Planification"'::regclass AND contype='f') = 3
--              AND (SELECT COUNT(*) FROM pg_constraint WHERE conrelid='public."User_Planification"'::regclass AND contype='f' AND confdeltype='r') = 2
--             THEN 'ok' ELSE 'MAL' END
-- UNION ALL
-- SELECT 'Routine_Exercise_Finished.finished_at es date NOT NULL',
--        CASE WHEN (SELECT data_type || '/' || is_nullable FROM information_schema.columns
--                    WHERE table_schema='public' AND table_name='Routine_Exercise_Finished'
--                      AND column_name='finished_at') = 'date/NO' THEN 'ok' ELSE 'MAL' END
-- UNION ALL
-- SELECT 'Routine_Asign_Exercise_Finished.finished_at es date NOT NULL',
--        CASE WHEN (SELECT data_type || '/' || is_nullable FROM information_schema.columns
--                    WHERE table_schema='public' AND table_name='Routine_Asign_Exercise_Finished'
--                      AND column_name='finished_at') = 'date/NO' THEN 'ok' ELSE 'MAL' END;

-- =============================================================
--  Patch 2026-10-22 - BE-24 y BE-25 (bajas del catalogo de musculos: CU-A-10 y CU-A-15)
--
--  Lleva una base YA CREADA al esquema nuevo, sin recrearla desde cero.
--  Equivale a los cambios que ddl.py metio en 01_estructura.sql.
--  Adelanta dos de las cuatro FK de BE-22 (las de Exercise quedan para esa tarea).
--
--  QUE HACE
--    1. Muscle.muscle_group_id: la FK pasa de ON DELETE CASCADE a RESTRICT. Un grupo con
--       musculos ya no se puede borrar (antes se llevaba sus musculos y sus vinculos).
--    2. Exercised_Muscle.muscle_id: idem. Un musculo asociado a ejercicios ya no se puede borrar
--       (antes se sacaba de esos ejercicios).
--    No toca datos: las filas que hay ya cumplen la FK, porque la vieja la garantizaba.
--
--  ABORTA, sin tocar nada, si:
--    - Hay otra FK, con un nombre distinto al del 01, sobre las mismas columnas. El DROP va por
--      nombre: quedaria la vieja en CASCADE al lado de la nueva y el borrado no se frenaria.
--
--  Es idempotente: cada FK se borra si existe y se vuelve a crear.
--  Correrlo con:  psql -v ON_ERROR_STOP=1 -f 2026-10-22-be-24-25.sql
--  Alternativa equivalente: recrear la base con 01 -> 02 -> 03.
-- =============================================================

BEGIN;

-- -------------------------------------------------------------
-- 0. Guarda: aborta antes de cambiar nada
-- -------------------------------------------------------------
DO $$
DECLARE
    others text;
BEGIN
    SELECT string_agg(conname, ', ') INTO others
      FROM pg_constraint
     WHERE contype = 'f'
       AND (   (conrelid  = 'public."Muscle"'::regclass
                AND confrelid = 'public."Muscle_Group"'::regclass
                AND conname  <> 'fk_muscle_muscle_group')
            OR (conrelid  = 'public."Exercised_Muscle"'::regclass
                AND confrelid = 'public."Muscle"'::regclass
                AND conname  <> 'fk_exercised_muscle_muscle'));

    IF others IS NOT NULL THEN
        RAISE EXCEPTION 'Patch BE-24/25 abortado: hay FK con otro nombre sobre las columnas a cambiar (%). Revisar a mano.', others;
    END IF;
END $$;

-- -------------------------------------------------------------
-- 1. Muscle -> Muscle_Group
-- -------------------------------------------------------------
ALTER TABLE public."Muscle" DROP CONSTRAINT IF EXISTS fk_muscle_muscle_group;
ALTER TABLE public."Muscle" ADD CONSTRAINT fk_muscle_muscle_group FOREIGN KEY (muscle_group_id) REFERENCES public."Muscle_Group"(id) ON DELETE RESTRICT;

-- -------------------------------------------------------------
-- 2. Exercised_Muscle -> Muscle
-- -------------------------------------------------------------
ALTER TABLE public."Exercised_Muscle" DROP CONSTRAINT IF EXISTS fk_exercised_muscle_muscle;
ALTER TABLE public."Exercised_Muscle" ADD CONSTRAINT fk_exercised_muscle_muscle FOREIGN KEY (muscle_id) REFERENCES public."Muscle"(id) ON DELETE RESTRICT;

COMMIT;

-- =============================================================
--  VERIFICACION (correr despues, deberia devolver 3 filas con 'ok')
-- =============================================================
-- SELECT 'Muscle: 1 FK, a Muscle_Group, RESTRICT' AS chequeo,
--        CASE WHEN (SELECT COUNT(*) FROM pg_constraint WHERE conrelid='public."Muscle"'::regclass AND contype='f') = 1
--              AND (SELECT confdeltype FROM pg_constraint WHERE conname='fk_muscle_muscle_group') = 'r'
--             THEN 'ok' ELSE 'MAL' END AS resultado
-- UNION ALL
-- SELECT 'Exercised_Muscle: la FK a Muscle es RESTRICT y es la unica a Muscle',
--        CASE WHEN (SELECT COUNT(*) FROM pg_constraint WHERE conrelid='public."Exercised_Muscle"'::regclass
--                     AND confrelid='public."Muscle"'::regclass AND contype='f') = 1
--              AND (SELECT confdeltype FROM pg_constraint WHERE conname='fk_exercised_muscle_muscle') = 'r'
--             THEN 'ok' ELSE 'MAL' END
-- UNION ALL
-- SELECT 'Exercised_Muscle: la FK a Exercise sigue en CASCADE',
--        CASE WHEN (SELECT confdeltype FROM pg_constraint WHERE conname='fk_exercised_muscle_exercise') = 'c'
--             THEN 'ok' ELSE 'MAL' END;

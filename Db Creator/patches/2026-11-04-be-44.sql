-- =============================================================
--  Patch 2026-11-04 - BE-44 (tipos de circuito: CU-A-24 a CU-A-27, CU-E-21 a CU-E-23)
--
--  Lleva una base YA CREADA al esquema nuevo, sin recrearla desde cero.
--  Equivale a los cambios que ddl.py metio en 01_estructura.sql y gen_seed.py en 02_datos_estaticos.sql.
--
--  QUE HACE
--    1. Crea la tabla Circuit_Type (igual que el 01) si no existe.
--    2. Siembra los cinco tipos del 02 (Entrada en calor, Principal, Superserie, AMRAP y
--       Enfriamiento) con sus mismos ids, descripciones y timestamps.
--    3. Agrega Circuit.circuit_type_id y la completa a partir del texto libre de Circuit.type:
--       - 'normal' y '' (o solo espacios) van a Principal;
--       - cada otro valor, sin distinguir mayusculas ni espacios de los bordes, va al tipo con ese
--         nombre: los del seed ('principal', 'Superserie', 'amrap', 'entrada en calor') caen en el
--         del seed, y para el resto se crea un tipo nuevo, activo y sin descripcion, que se llama
--         como MIN(TRIM(type)) de su grupo ('Core' y 'core ' son un solo tipo).
--       Avisa (NOTICE) cuantos tipos creo y cuantos circuitos quedaron en cada uno.
--    4. circuit_type_id pasa a NOT NULL, con la FK fk_circuit_circuit_type a Circuit_Type en
--       ON DELETE RESTRICT y el indice idx_circuit_circuit_type_id.
--    5. Borra Circuit.type y su indice idx_circuit_type.
--    No cambia updated_at de ningun circuito: el mapeo no es una edicion.
--
--  ABORTA, sin tocar nada, si:
--    - Circuit_Type ya existe pero le falta alguna de las columnas type, description o active.
--    - Alguno de los cinco nombres del seed ya existe en Circuit_Type (recortado y en minusculas)
--      con otro id que el del 02.
--    - Mientras Circuit.type existe, dos tipos de Circuit_Type tienen el mismo nombre (recortado
--      y en minusculas): el mapeo seria ambiguo.
--    - Hay una FK de Circuit a Circuit_Type con otro nombre que el del 01.
--    - Circuit no tiene ni type ni circuit_type_id (un estado que ningun paso de este patch deja).
--    - Despues del mapeo queda algun circuito sin circuit_type_id (se deshace todo).
--
--  Es idempotente: la segunda corrida no encuentra Circuit.type, no mapea nada y solo vuelve a
--  asegurar el NOT NULL, la FK y el indice.
--  Correrlo con:  psql -v ON_ERROR_STOP=1 -f 2026-11-04-be-44.sql
--  Alternativa equivalente: recrear la base con 01 -> 02 -> 03.
--
--  ORDEN CON EL DEPLOY: el backend nuevo lee circuit_type_id y el viejo lee type. Correr este patch
--  y desplegar el backend uno detras del otro (plan de BE-44, seccion 6).
-- =============================================================

BEGIN;

-- -------------------------------------------------------------
-- 0. Guardas: abortan antes de cambiar nada
-- -------------------------------------------------------------
DO $$
DECLARE
    missing  text;
    clash    text;
    dups     text;
    others   text;
    has_type boolean;
    has_ctid boolean;
BEGIN
    SELECT EXISTS (SELECT 1 FROM information_schema.columns
                    WHERE table_schema = 'public' AND table_name = 'Circuit' AND column_name = 'type')
      INTO has_type;
    SELECT EXISTS (SELECT 1 FROM information_schema.columns
                    WHERE table_schema = 'public' AND table_name = 'Circuit' AND column_name = 'circuit_type_id')
      INTO has_ctid;

    IF NOT has_type AND NOT has_ctid THEN
        RAISE EXCEPTION 'Patch BE-44 abortado: Circuit no tiene ni type ni circuit_type_id. Revisar a mano.';
    END IF;

    IF to_regclass('public."Circuit_Type"') IS NOT NULL THEN
        SELECT string_agg(col, ', ') INTO missing
          FROM unnest(ARRAY['type', 'description', 'active']) AS col
         WHERE NOT EXISTS (SELECT 1 FROM information_schema.columns
                            WHERE table_schema = 'public' AND table_name = 'Circuit_Type' AND column_name = col);

        IF missing IS NOT NULL THEN
            RAISE EXCEPTION 'Patch BE-44 abortado: Circuit_Type ya existe pero le falta: %. Revisar a mano.', missing;
        END IF;

        EXECUTE $q$
            SELECT string_agg(format('%s (id %s, el del seed es %s)', ct.type, ct.id, seed.id), ', ')
              FROM public."Circuit_Type" ct
              JOIN (VALUES
                    ('7b4c3dcb-5024-5a2c-81f0-acdb200d16a2'::uuid, 'Entrada en calor'),
                    ('49f793de-7681-5c05-a171-371baa69e9eb'::uuid, 'Principal'),
                    ('5dc3b269-cc31-5ba1-9da9-a2373d707c46'::uuid, 'Superserie'),
                    ('ce44ec22-1de2-5b7b-8df0-fb66b945d2bc'::uuid, 'AMRAP'),
                    ('58af9d1e-3235-5ede-9fc2-67efab8db0de'::uuid, 'Enfriamiento')
                   ) AS seed(id, type)
                ON LOWER(TRIM(ct.type)) = LOWER(seed.type) AND ct.id <> seed.id
        $q$ INTO clash;

        IF clash IS NOT NULL THEN
            RAISE EXCEPTION 'Patch BE-44 abortado: hay tipos con el nombre de uno del seed y otro id: %. Revisar a mano.', clash;
        END IF;

        IF has_type THEN
            EXECUTE $q$
                SELECT string_agg(name, ', ')
                  FROM (SELECT LOWER(TRIM(type)) AS name
                          FROM public."Circuit_Type"
                         GROUP BY LOWER(TRIM(type))
                        HAVING COUNT(*) > 1) AS d
            $q$ INTO dups;

            IF dups IS NOT NULL THEN
                RAISE EXCEPTION 'Patch BE-44 abortado: Circuit_Type tiene nombres repetidos (%): el mapeo seria ambiguo. Revisar a mano.', dups;
            END IF;
        END IF;

        SELECT string_agg(conname, ', ') INTO others
          FROM pg_constraint
         WHERE contype = 'f'
           AND conrelid  = 'public."Circuit"'::regclass
           AND confrelid = 'public."Circuit_Type"'::regclass
           AND conname  <> 'fk_circuit_circuit_type';

        IF others IS NOT NULL THEN
            RAISE EXCEPTION 'Patch BE-44 abortado: hay FK de Circuit a Circuit_Type con otro nombre (%). Revisar a mano.', others;
        END IF;
    END IF;
END $$;

-- -------------------------------------------------------------
-- 1. La tabla, igual que el 01
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public."Circuit_Type" (
    id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    type        VARCHAR(50)  NOT NULL,
    description VARCHAR(100),
    active      BOOLEAN      NOT NULL DEFAULT true,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- -------------------------------------------------------------
-- 2. Los cinco tipos del 02, con los mismos ids, descripciones y timestamps
-- -------------------------------------------------------------
INSERT INTO public."Circuit_Type" (id, type, description, active, created_at, updated_at) VALUES
    ('7b4c3dcb-5024-5a2c-81f0-acdb200d16a2'::uuid, 'Entrada en calor', 'Movilidad y activación antes del trabajo principal', true, '2026-06-14 12:00:00-03', '2026-06-14 12:00:00-03'),
    ('49f793de-7681-5c05-a171-371baa69e9eb'::uuid, 'Principal', 'El bloque central de la sesión', true, '2026-06-14 12:00:00-03', '2026-06-14 12:00:00-03'),
    ('5dc3b269-cc31-5ba1-9da9-a2373d707c46'::uuid, 'Superserie', 'Dos o más ejercicios seguidos, sin descanso entre ellos', true, '2026-06-14 12:00:00-03', '2026-06-14 12:00:00-03'),
    ('ce44ec22-1de2-5b7b-8df0-fb66b945d2bc'::uuid, 'AMRAP', 'Tantas repeticiones o rondas como se pueda en un tiempo dado', true, '2026-06-14 12:00:00-03', '2026-06-14 12:00:00-03'),
    ('58af9d1e-3235-5ede-9fc2-67efab8db0de'::uuid, 'Enfriamiento', 'Vuelta a la calma y estiramientos al final de la sesión', true, '2026-06-14 12:00:00-03', '2026-06-14 12:00:00-03')
ON CONFLICT (id) DO NOTHING;

-- -------------------------------------------------------------
-- 3. La columna nueva, todavia sin NOT NULL
-- -------------------------------------------------------------
ALTER TABLE public."Circuit" ADD COLUMN IF NOT EXISTS circuit_type_id UUID;

-- -------------------------------------------------------------
-- 4. El mapeo, solo si Circuit.type existe. Con EXECUTE: la segunda corrida, sin type, no
--    puede fallar al preparar una sentencia que lo nombra
-- -------------------------------------------------------------
DO $$
DECLARE
    created integer;
    r       record;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                    WHERE table_schema = 'public' AND table_name = 'Circuit' AND column_name = 'type') THEN
        RAISE NOTICE 'Patch BE-44: Circuit ya no tiene type, no hay nada que mapear.';
        RETURN;
    END IF;

    -- 4.1 Un tipo por cada valor que no es 'normal' ni vacio y que no coincide con uno existente
    EXECUTE $q$
        INSERT INTO public."Circuit_Type" (type, active)
        SELECT MIN(TRIM(c.type)), true
          FROM public."Circuit" c
         WHERE LOWER(TRIM(c.type)) NOT IN ('normal', '')
           AND NOT EXISTS (SELECT 1 FROM public."Circuit_Type" ct
                            WHERE LOWER(TRIM(ct.type)) = LOWER(TRIM(c.type)))
         GROUP BY LOWER(TRIM(c.type))
    $q$;
    GET DIAGNOSTICS created = ROW_COUNT;

    -- 4.2 'normal' y vacio van a Principal
    EXECUTE $q$
        UPDATE public."Circuit"
           SET circuit_type_id = '49f793de-7681-5c05-a171-371baa69e9eb'
         WHERE circuit_type_id IS NULL
           AND LOWER(TRIM(type)) IN ('normal', '')
    $q$;

    -- 4.3 El resto, al tipo con el mismo nombre (los del seed y los recien creados)
    EXECUTE $q$
        UPDATE public."Circuit" c
           SET circuit_type_id = ct.id
          FROM public."Circuit_Type" ct
         WHERE c.circuit_type_id IS NULL
           AND LOWER(TRIM(ct.type)) = LOWER(TRIM(c.type))
    $q$;

    -- 4.4 El resumen
    RAISE NOTICE 'Patch BE-44: % tipo(s) de circuito creado(s) a partir del texto libre.', created;
    FOR r IN
        SELECT ct.type, ct.active, COUNT(c.id) AS n
          FROM public."Circuit_Type" ct
          LEFT JOIN public."Circuit" c ON c.circuit_type_id = ct.id
         GROUP BY ct.id, ct.type, ct.active
         ORDER BY ct.type
    LOOP
        RAISE NOTICE 'Patch BE-44:   % -> % circuito(s)%', r.type, r.n, CASE WHEN r.active THEN '' ELSE ' (dado de baja)' END;
    END LOOP;
END $$;

-- -------------------------------------------------------------
-- 5. Guarda: ningun circuito puede quedar sin tipo
-- -------------------------------------------------------------
DO $$
DECLARE
    orphans text;
BEGIN
    SELECT string_agg(format('%s (%s)', name, id), ', ') INTO orphans
      FROM public."Circuit"
     WHERE circuit_type_id IS NULL;

    IF orphans IS NOT NULL THEN
        RAISE EXCEPTION 'Patch BE-44 abortado: circuitos sin tipo despues del mapeo: %. No se cambio nada.', orphans;
    END IF;
END $$;

-- -------------------------------------------------------------
-- 6. NOT NULL, la FK en RESTRICT y el indice, como el 01
-- -------------------------------------------------------------
ALTER TABLE public."Circuit" ALTER COLUMN circuit_type_id SET NOT NULL;
ALTER TABLE public."Circuit" DROP CONSTRAINT IF EXISTS fk_circuit_circuit_type;
ALTER TABLE public."Circuit" ADD CONSTRAINT fk_circuit_circuit_type FOREIGN KEY (circuit_type_id) REFERENCES public."Circuit_Type"(id) ON DELETE RESTRICT;
CREATE INDEX IF NOT EXISTS idx_circuit_circuit_type_id ON public."Circuit"(circuit_type_id);

-- -------------------------------------------------------------
-- 7. Afuera el texto libre
-- -------------------------------------------------------------
DROP INDEX IF EXISTS public.idx_circuit_type;
ALTER TABLE public."Circuit" DROP COLUMN IF EXISTS type;

COMMIT;

-- =============================================================
--  VERIFICACION (correr despues: las cuatro primeras filas deberian decir 'ok')
-- =============================================================
-- SELECT 'Circuit no tiene type' AS chequeo,
--        CASE WHEN NOT EXISTS (SELECT 1 FROM information_schema.columns
--                               WHERE table_schema = 'public' AND table_name = 'Circuit' AND column_name = 'type')
--             THEN 'ok' ELSE 'MAL' END AS resultado
-- UNION ALL
-- SELECT 'circuit_type_id es NOT NULL',
--        CASE WHEN (SELECT is_nullable FROM information_schema.columns
--                    WHERE table_schema = 'public' AND table_name = 'Circuit' AND column_name = 'circuit_type_id') = 'NO'
--             THEN 'ok' ELSE 'MAL' END
-- UNION ALL
-- SELECT 'Circuit tiene una sola FK a Circuit_Type, en RESTRICT',
--        CASE WHEN (SELECT COUNT(*) FROM pg_constraint WHERE conrelid = 'public."Circuit"'::regclass
--                     AND confrelid = 'public."Circuit_Type"'::regclass AND contype = 'f') = 1
--              AND (SELECT confdeltype FROM pg_constraint WHERE conname = 'fk_circuit_circuit_type') = 'r'
--             THEN 'ok' ELSE 'MAL' END
-- UNION ALL
-- SELECT 'Los cinco tipos del seed existen',
--        CASE WHEN (SELECT COUNT(*) FROM public."Circuit_Type" WHERE id IN (
--                     '7b4c3dcb-5024-5a2c-81f0-acdb200d16a2', '49f793de-7681-5c05-a171-371baa69e9eb',
--                     '5dc3b269-cc31-5ba1-9da9-a2373d707c46', 'ce44ec22-1de2-5b7b-8df0-fb66b945d2bc',
--                     '58af9d1e-3235-5ede-9fc2-67efab8db0de')) = 5
--             THEN 'ok' ELSE 'MAL' END;
--
-- Cuantos circuitos tiene cada tipo (los creados por el patch quedan activos y sin descripcion;
-- el Admin decide si los conserva, los renombra o los da de baja desde Tipos de circuito):
-- SELECT ct.type, ct.active, COUNT(c.id) AS circuitos, COUNT(c.id) FILTER (WHERE c.active) AS activos
--   FROM public."Circuit_Type" ct
--   LEFT JOIN public."Circuit" c ON c.circuit_type_id = ct.id
--  GROUP BY ct.id, ct.type, ct.active
--  ORDER BY ct.type;

-- =============================================================
--  PowerApp DB - ESTRUCTURA (DDL)
--  Basado en modelo Miro actualizado al 26/05/2026
--  Orden: sin FK primero, luego dependientes
-- =============================================================

-- Tipo ENUM para el rol de usuario
CREATE TYPE public."User_role_enum" AS ENUM ('user', 'admin', 'coach');


-- =============================================================
--  TABLAS SIN DEPENDENCIAS
-- =============================================================

CREATE TABLE public."User" (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name      VARCHAR(50)  NOT NULL,
    last_name       VARCHAR(50)  NOT NULL,
    email           VARCHAR(50)  NOT NULL,
    email_verified  BOOLEAN      NOT NULL DEFAULT false,
    password        VARCHAR(255) NOT NULL,
    temp_password   VARCHAR(255),
    role            public."User_role_enum" NOT NULL DEFAULT 'user',
    profile_picture VARCHAR(150),
    phone_prefix 	VARCHAR(10),
    phone_number    VARCHAR(20),
    phone_verified  BOOLEAN      NOT NULL DEFAULT false,
    active          BOOLEAN      NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    CONSTRAINT "User_email_key" UNIQUE (email)
);

CREATE TABLE public."Coach" (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    coach_email VARCHAR(50),
    cuil        VARCHAR(20),
    active      BOOLEAN     NOT NULL DEFAULT true,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uk_coach_email UNIQUE (coach_email),
    CONSTRAINT uk_coach_cuil  UNIQUE (cuil)
);

CREATE INDEX idx_coach_email  ON public."Coach"(coach_email);
CREATE INDEX idx_coach_active ON public."Coach"(active);

CREATE TABLE public."Membership" (
    id          UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(50)    NOT NULL,
    duration    INTEGER        NOT NULL,
    price       DECIMAL(10,2)  NOT NULL,
    active      BOOLEAN        NOT NULL DEFAULT true,
    created_at  TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE TABLE public."Muscle_Group" (
    id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    name          VARCHAR(50) NOT NULL,
    image_url     VARCHAR(150),
    preview_image VARCHAR(150),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public."Exercise" (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(50) NOT NULL,
    description     VARCHAR(2000) NOT NULL,
    safety_tips     VARCHAR(500),
    activation_tips VARCHAR(500),
    video_url       VARCHAR(150),
    preview_image   VARCHAR(150),
    bg_image        VARCHAR(150),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_exercise_name ON public."Exercise"(name);

CREATE TABLE public."Planification" (
    id                 UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    name               VARCHAR(50),
    description        TEXT,
    number_of_routines INTEGER     NOT NULL,
    type               VARCHAR(30),
    duration           VARCHAR(50),
    active             BOOLEAN     NOT NULL DEFAULT true,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_planification_active ON public."Planification"(active);

-- Circuit es una pieza global reutilizable: no depende de Routine
CREATE TABLE public."Circuit" (
    id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(100) NOT NULL,
    description VARCHAR(100),
    type        VARCHAR(30)  NOT NULL,
    active      BOOLEAN      NOT NULL DEFAULT true,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_circuit_active ON public."Circuit"(active);
CREATE INDEX idx_circuit_type   ON public."Circuit"(type);

CREATE TABLE public."Routine" (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    routine_plan_id UUID,
    name            VARCHAR(50) NOT NULL,
    coach_note      VARCHAR(100),
    active          BOOLEAN     NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_routine_active ON public."Routine"(active);


-- =============================================================
--  TABLAS CON DEPENDENCIAS DE PRIMER NIVEL
-- =============================================================

CREATE TABLE public."Muscle" (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    muscle_group_id UUID        NOT NULL,
    name            VARCHAR(50) NOT NULL,
    description     TEXT,
    image_url       VARCHAR(150),
    preview_image   VARCHAR(150),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_muscle_muscle_group
        FOREIGN KEY (muscle_group_id) REFERENCES public."Muscle_Group"(id) ON DELETE CASCADE
);

CREATE TABLE public."Exercised_Muscle" (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    exercise_id UUID        NOT NULL,
    muscle_id   UUID        NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_exercised_muscle_exercise
        FOREIGN KEY (exercise_id) REFERENCES public."Exercise"(id) ON DELETE CASCADE,
    CONSTRAINT fk_exercised_muscle_muscle
        FOREIGN KEY (muscle_id)   REFERENCES public."Muscle"(id)   ON DELETE CASCADE,
    CONSTRAINT uk_exercise_muscle UNIQUE (exercise_id, muscle_id)
);

CREATE INDEX idx_exercised_muscle_exercise_id ON public."Exercised_Muscle"(exercise_id);
CREATE INDEX idx_exercised_muscle_muscle_id   ON public."Exercised_Muscle"(muscle_id);

CREATE TABLE public."Membership_Payment" (
    id            UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       UUID           NOT NULL,
    membership_id UUID           NOT NULL,
    name          VARCHAR(50)    NOT NULL,
    duration      INTEGER        NOT NULL,
    active        BOOLEAN        NOT NULL DEFAULT true,
    price         DECIMAL(10,2)  NOT NULL,
    created_at    TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    expired_at    TIMESTAMPTZ    NOT NULL,
    CONSTRAINT fk_membership_payment_user
        FOREIGN KEY (user_id)       REFERENCES public."User"(id)       ON DELETE CASCADE,
    CONSTRAINT fk_membership_payment_membership
        FOREIGN KEY (membership_id) REFERENCES public."Membership"(id) ON DELETE RESTRICT
);
 
CREATE INDEX idx_membership_payment_user_id       ON public."Membership_Payment"(user_id);
CREATE INDEX idx_membership_payment_membership_id ON public."Membership_Payment"(membership_id);

CREATE TABLE public."User_RM" (
    id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID          NOT NULL,
    exercise_id UUID          NOT NULL,
    weight      DECIMAL(10,2) NOT NULL,
    reps        INTEGER       NOT NULL,
    date        DATE          NOT NULL,
    created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_user_rm_user
        FOREIGN KEY (user_id)     REFERENCES public."User"(id)     ON DELETE CASCADE,
    CONSTRAINT fk_user_rm_exercise
        FOREIGN KEY (exercise_id) REFERENCES public."Exercise"(id) ON DELETE CASCADE
);

CREATE INDEX idx_user_rm_user_id     ON public."User_RM"(user_id);
CREATE INDEX idx_user_rm_exercise_id ON public."User_RM"(exercise_id);
CREATE INDEX idx_user_rm_date        ON public."User_RM"(date);

-- FK diferida en Routine (depende de Planification)
ALTER TABLE public."Routine"
    ADD CONSTRAINT fk_routine_planification
        FOREIGN KEY (routine_plan_id) REFERENCES public."Planification"(id) ON DELETE SET NULL;

CREATE TABLE public."Routine_Asignation" (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    routine_id      UUID        NOT NULL,
    routine_plan_id UUID        NOT NULL,
    "order" 		INTEGER		NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_routine_asignation_routine
        FOREIGN KEY (routine_id)      REFERENCES public."Routine"(id)       ON DELETE CASCADE,
    CONSTRAINT fk_routine_asignation_planification
        FOREIGN KEY (routine_plan_id) REFERENCES public."Planification"(id) ON DELETE CASCADE
);

CREATE TABLE public."User_Planification" (
    id                 UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id            UUID         NOT NULL,
    coach_id           UUID,
    planification_id   UUID,
    description        TEXT,
    number_of_routines INTEGER,
    type               VARCHAR(30),
    coach_note         VARCHAR(100),
    duration           VARCHAR(50),
    start_date         DATE         NOT NULL,
    end_date           DATE         NOT NULL,
    created_at         TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at         TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_user_planification_user
        FOREIGN KEY (user_id)          REFERENCES public."User"(id)          ON DELETE CASCADE,
    CONSTRAINT fk_user_planification_coach
        FOREIGN KEY (coach_id)         REFERENCES public."Coach"(id)         ON DELETE SET NULL,
    CONSTRAINT fk_user_planification_planification
        FOREIGN KEY (planification_id) REFERENCES public."Planification"(id) ON DELETE SET NULL
);

-- Vinculo M:N Routine <-> Circuit. Sin unique: un circuito puede repetirse en la rutina
CREATE TABLE public."Routine_Circuit" (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    routine_id  UUID        NOT NULL,
    circuit_id  UUID        NOT NULL,
    -- Nullable: el order se normaliza a 1..N en cada escritura, asi que un vinculo
    -- dado de baja no ocupa ninguna posicion (ver active, abajo)
    "order"     INTEGER,
    -- Baja logica del vinculo rutina-circuito. Ninguna FK apunta a esta tabla, asi que
    -- no es para proteger historial: es para conservar la traza de que circuitos
    -- integraron la rutina, que es lo que el alumno efectivamente ejecuto
    active      BOOLEAN     NOT NULL DEFAULT true,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_routine_circuit_routine
        FOREIGN KEY (routine_id) REFERENCES public."Routine"(id) ON DELETE CASCADE,
    CONSTRAINT fk_routine_circuit_circuit
        FOREIGN KEY (circuit_id) REFERENCES public."Circuit"(id) ON DELETE RESTRICT
);

CREATE INDEX idx_routine_circuit_routine_id ON public."Routine_Circuit"(routine_id, "order");
CREATE INDEX idx_routine_circuit_circuit_id ON public."Routine_Circuit"(circuit_id);


-- =============================================================
--  TABLAS CON DEPENDENCIAS DE SEGUNDO NIVEL
-- =============================================================

CREATE TABLE public."Routine_Exercise" (
    id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    exercise_id     UUID         NOT NULL,
    circuit_id      UUID         NOT NULL,
    exercise_order  INTEGER      NOT NULL,
    coach_note      VARCHAR(100),
    active          BOOLEAN      NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_routine_exercise_exercise
        FOREIGN KEY (exercise_id) REFERENCES public."Exercise"(id) ON DELETE CASCADE,
    CONSTRAINT fk_routine_exercise_circuit
        FOREIGN KEY (circuit_id)  REFERENCES public."Circuit"(id)  ON DELETE CASCADE
);

CREATE INDEX idx_routine_exercise_circuit_id  ON public."Routine_Exercise"(circuit_id);
CREATE INDEX idx_routine_exercise_exercise_id ON public."Routine_Exercise"(exercise_id);
CREATE INDEX idx_routine_exercise_order       ON public."Routine_Exercise"(circuit_id, exercise_order);

CREATE TABLE public."Routine_Asignation_User" (
    id                    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    routine_id            UUID        NOT NULL,
    user_id               UUID        NOT NULL,
    routine_asignation_id UUID        NOT NULL,
    "order" 			  INTEGER     NOT NULL,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_routine_asignation_user_routine
        FOREIGN KEY (routine_id)            REFERENCES public."Routine"(id)           ON DELETE CASCADE,
    CONSTRAINT fk_routine_asignation_user_user
        FOREIGN KEY (user_id)               REFERENCES public."User"(id)              ON DELETE CASCADE,
    CONSTRAINT fk_routine_asignation_user_asignation
        FOREIGN KEY (routine_asignation_id) REFERENCES public."Routine_Asignation"(id) ON DELETE CASCADE
);

CREATE TABLE public."User_Routine" (
    id                    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    routine_asignation_id UUID        NOT NULL,
    user_id               UUID        NOT NULL,
    date                  DATE        NOT NULL,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_user_routine_routine_asignation
        FOREIGN KEY (routine_asignation_id) REFERENCES public."Routine_Asignation"(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_routine_user
        FOREIGN KEY (user_id) REFERENCES public."User"(id) ON DELETE CASCADE
);


-- =============================================================
--  TABLAS CON DEPENDENCIAS DE TERCER NIVEL
-- =============================================================

CREATE TABLE public."Exercise_Set" (
    id                   UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    routine_exercise_id  UUID          NOT NULL,
    set_order            INTEGER       NOT NULL,
    set_count            INTEGER       NOT NULL,
    rep_count            INTEGER       NOT NULL,
    weight               DECIMAL(10,2),
    rpe                  INTEGER,
    rir                  INTEGER,
    rm_perc              INTEGER,
    amrap                BOOLEAN       NOT NULL DEFAULT false,
    amrap_time           INTEGER,
    rm                   BOOLEAN       NOT NULL DEFAULT false,
    created_at           TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_exercise_set_routine_exercise
        FOREIGN KEY (routine_exercise_id) REFERENCES public."Routine_Exercise"(id) ON DELETE CASCADE
);

CREATE INDEX idx_exercise_set_routine_exercise_id ON public."Exercise_Set"(routine_exercise_id);
CREATE INDEX idx_exercise_set_order               ON public."Exercise_Set"(routine_exercise_id, set_order);


-- =============================================================
--  TABLAS CON DEPENDENCIAS DE CUARTO NIVEL
-- =============================================================

-- La existencia de la fila = ese ejercicio esta hecho en esa instancia de rutina
CREATE TABLE public."Routine_Exercise_Finished" (
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

CREATE INDEX idx_ref_user_routine_id     ON public."Routine_Exercise_Finished"(user_routine_id);
CREATE INDEX idx_ref_routine_exercise_id ON public."Routine_Exercise_Finished"(routine_exercise_id);

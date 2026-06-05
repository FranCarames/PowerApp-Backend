-- =============================================================
--  PowerApp DB - Script de recreación completa v2
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
    created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public."Routine" (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    routine_plan_id UUID,
    name            VARCHAR(20) NOT NULL,
    coach_note      VARCHAR(100),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


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

-- Circuit ahora tiene FK a Routine
CREATE TABLE public."Circuit" (
    id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    routine_id  UUID         NOT NULL,
    name        VARCHAR(100) NOT NULL,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_circuit_routine
        FOREIGN KEY (routine_id) REFERENCES public."Routine"(id) ON DELETE CASCADE
);

CREATE INDEX idx_circuit_routine_id ON public."Circuit"(routine_id);


-- =============================================================
--  TABLAS CON DEPENDENCIAS DE SEGUNDO NIVEL
-- =============================================================

CREATE TABLE public."Routine_Exercise" (
    id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    exercise_id     UUID         NOT NULL,
    circuit_id      UUID         NOT NULL,
    exercise_order  INTEGER      NOT NULL,
    coach_note      VARCHAR(100),
    user_note       VARCHAR(100),
    finished        BOOLEAN      NOT NULL DEFAULT false,
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
--  TABLA DE OTRO PROYECTO (sacar en el futuro)
-- =============================================================

CREATE TABLE public.ias_users (
    id         SERIAL       PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name  VARCHAR(100) NOT NULL,
    email      VARCHAR(120) NOT NULL,
    password   VARCHAR(100) NOT NULL,
    birthdate  DATE,
    CONSTRAINT ias_users_email_key UNIQUE (email)
);


-- =============================================================
--  INSERTS - Datos iniciales
-- =============================================================

-- Muscle_Group
INSERT INTO public."Muscle_Group" (id, name, image_url, preview_image, created_at, updated_at) VALUES
    ('e743e972-e2ad-44aa-b40b-264255ab4756'::uuid, 'Pecho',   NULL, NULL, '2026-04-10 08:55:11.054355-03', '2026-04-10 08:55:11.054355-03'),
    ('22e7080f-a4a9-457c-aeb5-1bff538eeb3d'::uuid, 'Espalda', NULL, NULL, '2026-04-10 09:00:40.534356-03', '2026-04-10 09:00:40.534356-03'),
    ('b4715f19-6de4-4735-a2c1-882d76bde9ba'::uuid, 'Hombros', NULL, NULL, '2026-04-10 09:00:53.124043-03', '2026-04-10 09:00:53.124043-03'),
    ('0120ab64-2ec0-4b14-8c9f-b2646c542749'::uuid, 'Brazos',  NULL, NULL, '2026-04-10 09:01:01.263399-03', '2026-04-10 09:01:01.263399-03'),
    ('a56fe120-6687-4e98-98c5-a553654e1626'::uuid, 'Abdomen', NULL, NULL, '2026-04-10 09:01:11.012242-03', '2026-04-10 09:01:11.012242-03'),
    ('964d1770-1aac-4cf7-825c-780f96b17bb2'::uuid, 'Piernas', NULL, NULL, '2026-04-10 09:01:15.692963-03', '2026-04-10 09:01:15.692963-03');

-- User
INSERT INTO public."User" (id, first_name, last_name, email, email_verified, password, temp_password, profile_picture, phone_number, phone_verified, created_at, updated_at, role) VALUES
    ('6d8a02c2-5bd0-4cd3-8c0b-db5a62d24d85'::uuid, 'Franco', 'Admin',   'caramesfranco@gmail.com', false, '$2b$10$eTc9vpIaAVXO9JPhCH/3N.95IJEQaVEUrKnQJrNtSh01VkNTT1dg6', NULL, NULL, '1157217320', false, '2026-04-09 21:05:38.195244-03', '2026-04-09 21:05:38.195244-03', 'admin'),
    ('2abeb10e-431a-4116-a749-8cbf37740f70'::uuid, 'Franco', 'Carames', 'frankkram@gmail.com',      false, '$2b$10$DGMvw5VfTH9kM3pRdR8Zw.oIcawn0rRxUoh97.vC5/nBUaYlhEc4u', NULL, NULL, '1157217320', false, '2026-04-09 21:06:35.162061-03', '2026-04-09 21:06:35.162061-03', 'user'),
    ('1188a044-5515-4348-a2be-6a5afdaf44f1'::uuid, 'Franco', 'Carames', 'francocoach@gmail.com',    false, '$2b$10$87uumoT3DTv8aFv/01yuUOBx2aLxL6lqsELh1VqBfErYCiH0uMvAW', NULL, NULL, '1157217320', false, '2026-04-26 21:39:13.168299-03', '2026-04-26 21:39:13.168299-03', 'user');

-- Coach
INSERT INTO public."Coach" (id, coach_email, cuil, active, created_at, updated_at) VALUES
    ('1188a044-5515-4348-a2be-6a5afdaf44f1'::uuid, 'francocoach1@gmail.com', '11111111111', false, '2026-04-27 16:57:01.526267-03', '2026-04-27 18:25:58.892392-03');

-- Membership
INSERT INTO public."Membership" (id, name, duration, price, created_at, updated_at) VALUES
    ('6e1992e8-3005-4fd4-94a4-cbb70e160a61'::uuid, 'Membresia Diaria',      1,  3000.00,  '2026-04-21 20:29:21.790259-03', '2026-04-21 20:30:46.210723-03'),
    ('7f86a6d0-8d11-45a0-96d7-684407cbd05d'::uuid, 'Membresia Mensual',    30, 60000.00,  '2026-04-21 20:31:04.905079-03', '2026-04-21 20:31:04.905079-03'),
    ('f1a5b588-17fb-4684-853c-9a015e5761a4'::uuid, 'Membresia Trimestral', 90, 150000.00, '2026-04-21 20:31:18.398486-03', '2026-04-21 20:32:12.557085-03');

-- Membership_Payment
INSERT INTO public."Membership_Payment" (id, user_id, membership_id, duration, active, price, created_at, updated_at, expired_at) VALUES
    ('34fc6625-d3a8-4ae6-b44f-81095a933e56'::uuid, '2abeb10e-431a-4116-a749-8cbf37740f70'::uuid, '6e1992e8-3005-4fd4-94a4-cbb70e160a61'::uuid, 1, 1, '3000.00', '2026-04-22 16:19:21.304208-03', '2026-04-22 16:19:21.304208-03', '2026-04-23 23:59:59.999-03');

-- Exercise
INSERT INTO public."Exercise" (id, name, description, safety_tips, activation_tips, video_url, preview_image, bg_image, created_at, updated_at) VALUES
    ('2c164517-e18f-4c97-a3a7-d31b9865640e'::uuid, 'Sentadilla',            'Tenes que bajar y despues subir', 'Respira como si tu vida dependiera de ello', 'Apreta las nalgas', NULL, NULL, NULL, '2026-04-26 20:21:55.452574-03', '2026-04-26 20:21:55.452574-03'),
    ('e66c5580-d397-471f-85f0-13bc74655b64'::uuid, 'Sentadilla Barra Baja', 'Tenes que bajar y despues subir', 'Respira como si tu vida dependiera de ello', 'Apreta las nalgas', NULL, NULL, NULL, '2026-05-07 19:54:30.419425-03', '2026-05-07 19:54:30.419425-03');

-- Muscle
INSERT INTO public."Muscle" (id, muscle_group_id, name, description, image_url, preview_image, created_at, updated_at) VALUES
    ('ccf521a5-c910-4e9f-a86b-b5c2e202d80c'::uuid, '964d1770-1aac-4cf7-825c-780f96b17bb2'::uuid, 'Cuádriceps Femoral',    'El cuádriceps se encuentra en la parte frontal del muslo. Es el músculo extensor de la rodilla más poderoso del cuerpo. Ejercicios principales: sentadilla, leg extension y press de piernas.', NULL, NULL, '2026-04-19 20:17:57.082619-03', '2026-04-19 20:17:57.082619-03'),
    ('a356fd7c-ae2a-4813-bab0-fe70c2515c78'::uuid, '964d1770-1aac-4cf7-825c-780f96b17bb2'::uuid, 'Isquiotibiales',        'Los isquiotibiales están en la parte posterior del muslo. Flexionan la rodilla y extienden la cadera. Son clave para evitar lesiones y equilibrar las piernas. Ejercicios principales: peso muerto rumano, curl de piernas y good mornings.', NULL, NULL, '2026-04-19 20:23:29.446364-03', '2026-04-19 20:23:29.446364-03'),
    ('870a269b-205c-4f8d-83db-7b557e819744'::uuid, '964d1770-1aac-4cf7-825c-780f96b17bb2'::uuid, 'Glúteo Mayor',          'El glúteo mayor es el músculo más grande de las nalgas, ubicado en la parte posterior de la pelvis. Extiende y rota externamente la cadera. Ejercicios principales: hip thrust, sentadilla profunda y zancadas.', NULL, NULL, '2026-04-19 20:23:51.360513-03', '2026-04-19 20:23:51.360513-03'),
    ('95f831db-8dd3-4477-b02f-4f675de81550'::uuid, '964d1770-1aac-4cf7-825c-780f96b17bb2'::uuid, 'Glúteo Medio',          'El glúteo medio se localiza en la parte lateral de la cadera. Abduce la pierna y estabiliza la pelvis durante la marcha. Ejercicios principales: abducciones laterales, clamshells y side leg raises.', NULL, NULL, '2026-04-19 20:24:16.489159-03', '2026-04-19 20:24:16.489159-03'),
    ('4533e84e-c8c3-45f5-b523-f84770a5bd53'::uuid, '964d1770-1aac-4cf7-825c-780f96b17bb2'::uuid, 'Gemelos',               'Los gemelos se sitúan en la parte posterior de la pantorrilla. Son responsables de la flexión plantar del pie y la elevación del talón. Ejercicios principales: elevaciones de talones de pie y sentado.', NULL, NULL, '2026-04-19 20:24:36.317334-03', '2026-04-19 20:24:36.317334-03'),
    ('4421797a-3d58-414d-9bcf-bc29e65610c9'::uuid, '964d1770-1aac-4cf7-825c-780f96b17bb2'::uuid, 'Aductores',             'Los aductores se encuentran en la parte interna del muslo. Aducen la pierna hacia el centro del cuerpo. Mejoran la estabilidad y previenen lesiones en la ingle. Ejercicios principales: aducción en máquina, sumo squat y Copenhagen plank.', NULL, NULL, '2026-04-19 20:24:54.962959-03', '2026-04-19 20:24:54.962959-03'),
    ('f3d5019d-8520-410d-a32e-cdc697a941e7'::uuid, 'e743e972-e2ad-44aa-b40b-264255ab4756'::uuid, 'Pectoral Superior',     'El pectoral superior (porción clavicular) se encuentra en la parte alta del pecho, cerca de las clavículas. Es responsable de la flexión y elevación del brazo hacia adelante y arriba. Ejercicios principales: press de banca inclinado, press inclinado con mancuernas y cruces altas en polea.', NULL, NULL, '2026-04-19 20:27:11.535103-03', '2026-04-19 20:27:11.535103-03'),
    ('a7174ace-b220-47d7-a2e1-ba8ed314ea83'::uuid, 'e743e972-e2ad-44aa-b40b-264255ab4756'::uuid, 'Pectoral Medio',        'El pectoral medio (porción esternal) ocupa la parte central del pecho, desde el esternón. Es el principal en la aducción horizontal del brazo y genera el grosor del pecho. Ejercicios principales: press de banca plano, aperturas con mancuernas y flyes en máquina.', NULL, NULL, '2026-04-19 20:27:31.691488-03', '2026-04-19 20:27:31.691488-03'),
    ('79db9e7e-f398-456f-a4ca-dbf5d825acc7'::uuid, 'e743e972-e2ad-44aa-b40b-264255ab4756'::uuid, 'Pectoral Inferior',     'El pectoral inferior (porción costal) se localiza en la parte baja del pecho, cerca de las costillas. Ayuda en la aducción y rotación interna del brazo desde abajo. Ejercicios principales: press de banca declinado, dips en paralelas y cruces bajas en polea.', NULL, NULL, '2026-04-19 20:27:43.668006-03', '2026-04-19 20:27:43.668006-03'),
    ('e04e1799-a9f2-4d6c-9a2b-57490ebf3c0d'::uuid, 'a56fe120-6687-4e98-98c5-a553654e1626'::uuid, 'Recto Abdominal',       'El recto abdominal se ubica en la parte central frontal del abdomen, desde el esternón hasta el pubis. Flexiona el tronco hacia adelante. Ejercicios principales: crunch abdominal, abdominales en máquina y plank.', NULL, NULL, '2026-04-19 20:28:35.892759-03', '2026-04-19 20:28:35.892759-03'),
    ('a037faea-eaab-4dff-9a70-4c26926f53d9'::uuid, 'a56fe120-6687-4e98-98c5-a553654e1626'::uuid, 'Oblicuo Externo',       'El oblicuo externo está en los laterales del abdomen. Permite la rotación y flexión lateral del tronco. Da definición a los costados. Ejercicios principales: russian twists, crunch oblicuo y side plank.', NULL, NULL, '2026-04-19 20:28:49.012501-03', '2026-04-19 20:28:49.012501-03'),
    ('bc05efd7-33b9-4ae2-8e2d-f4bcd815eba3'::uuid, 'a56fe120-6687-4e98-98c5-a553654e1626'::uuid, 'Transverso Abdominal',  'El transverso abdominal es el músculo más profundo del abdomen, ubicado debajo de los oblicuos. Estabiliza el core y comprime los órganos internos. Ejercicios principales: plank, vacuum abdominal y dead bug.', NULL, NULL, '2026-04-19 20:29:03.578834-03', '2026-04-19 20:29:03.578834-03'),
    ('4e8c9dcc-81f7-48d0-8967-fb40e6d73a56'::uuid, 'b4715f19-6de4-4735-a2c1-882d76bde9ba'::uuid, 'Deltoide Anterior',     'El deltoide anterior está en la parte frontal del hombro. Participa en la elevación del brazo hacia adelante y la flexión del hombro. Ejercicios principales: press militar, elevaciones frontales y press Arnold.', NULL, NULL, '2026-04-19 20:29:46.767413-03', '2026-04-19 20:29:46.767413-03'),
    ('0ffbb9ff-6d66-4390-b6f4-aea09f259310'::uuid, 'b4715f19-6de4-4735-a2c1-882d76bde9ba'::uuid, 'Deltoide Lateral',      'El deltoide lateral se localiza en la parte media del hombro, dando anchura y forma redondeada. Abduce el brazo hacia los lados. Ejercicios principales: elevaciones laterales con mancuernas o cables.', NULL, NULL, '2026-04-19 20:29:55.549506-03', '2026-04-19 20:39:11.31-03'),
    ('eea89e6c-5ec1-4952-98ac-0d9ec46aa9ba'::uuid, 'b4715f19-6de4-4735-a2c1-882d76bde9ba'::uuid, 'Deltoide Posterior',    'El deltoide posterior se encuentra en la parte trasera del hombro. Extiende y rota externamente el brazo. Ejercicios principales: elevaciones posteriores, face pulls y remo en polea alta.', NULL, NULL, '2026-04-19 20:39:54.048431-03', '2026-04-19 20:39:54.048431-03'),
    ('f78961a0-9a1d-47a0-a8f9-a5d82281beb4'::uuid, '0120ab64-2ec0-4b14-8c9f-b2646c542749'::uuid, 'Bíceps Braquial Cabeza Larga',    'La cabeza larga del bíceps se origina en la escápula y cruza la articulación del hombro. Flexiona el codo, supina el antebrazo y ayuda a estabilizar el hombro. Ejercicios principales: curl con barra EZ, curl predicador y curl martillo.', NULL, NULL, '2026-04-19 20:46:51.190077-03', '2026-04-19 20:46:51.190077-03'),
    ('27184cf2-42e1-44a2-b717-0cd44016ca59'::uuid, '0120ab64-2ec0-4b14-8c9f-b2646c542749'::uuid, 'Bíceps Braquial Cabeza Corta',    'La cabeza corta del bíceps se origina en la apófisis coracoides. Flexiona el codo y supina el antebrazo, aportando grosor y pico al bíceps. Ejercicios principales: curl concentrado, curl en banco inclinado y curl con mancuernas.', NULL, NULL, '2026-04-19 20:47:11.61295-03',  '2026-04-19 20:47:11.61295-03'),
    ('c80658ae-2f3e-4d0a-8e08-4277c9a1be7f'::uuid, '0120ab64-2ec0-4b14-8c9f-b2646c542749'::uuid, 'Braquial',               'El braquial está ubicado debajo del bíceps en la parte frontal del brazo. Es el principal flexor del codo, independientemente de la posición de la mano. Ejercicios principales: curl reverso, curl martillo y curl con barra.', NULL, NULL, '2026-04-19 20:47:40.235479-03', '2026-04-19 20:47:40.235479-03'),
    ('0fd38e3b-37f5-4c2e-8776-62bad3bb5223'::uuid, '0120ab64-2ec0-4b14-8c9f-b2646c542749'::uuid, 'Tríceps Braquial Cabeza Larga',   'La cabeza larga del tríceps se origina en la escápula y cruza el hombro. Extiende el codo y ayuda en la aducción del brazo. Ejercicios principales: press francés overhead, extensiones overhead y fondos en paralelas.', NULL, NULL, '2026-04-19 20:48:01.19671-03',  '2026-04-19 20:48:01.19671-03'),
    ('1861a8ee-257a-41ff-9175-5b5f043ed130'::uuid, '0120ab64-2ec0-4b14-8c9f-b2646c542749'::uuid, 'Tríceps Braquial Cabeza Lateral', 'La cabeza lateral del tríceps se encuentra en la parte externa del brazo posterior. Extiende el codo y da la forma característica de "caballito" al tríceps. Ejercicios principales: extensiones en polea con barra recta y kickbacks.', NULL, NULL, '2026-04-19 20:48:25.12855-03',  '2026-04-19 20:48:25.12855-03'),
    ('b1ec2878-d3b1-4a9a-be8a-f3f62a6ce2bf'::uuid, '0120ab64-2ec0-4b14-8c9f-b2646c542749'::uuid, 'Tríceps Braquial Cabeza Medial',  'La cabeza medial del tríceps está en la parte interna y profunda del brazo. Extiende el codo y es activa en todos los movimientos de empuje. Ejercicios principales: extensiones en polea con cuerda y press close grip.', NULL, NULL, '2026-04-19 20:48:51.337247-03', '2026-04-19 20:48:51.337247-03'),
    ('647e2468-c7cc-4182-a278-14ac0a359816'::uuid, '0120ab64-2ec0-4b14-8c9f-b2646c542749'::uuid, 'Flexores del Antebrazo',          'Los flexores del antebrazo se sitúan en la parte interna del antebrazo. Flexionan la muñeca y los dedos, mejorando el agarre en ejercicios pesados. Ejercicios principales: curl de muñeca, farmer carry y ejercicios de agarre específico.', NULL, NULL, '2026-04-19 20:49:10.350079-03', '2026-04-19 20:49:10.350079-03'),
    ('5e37e2ed-dc4f-4536-b867-8652cf0d15c1'::uuid, '0120ab64-2ec0-4b14-8c9f-b2646c542749'::uuid, 'Extensores del Antebrazo',        'Los extensores del antebrazo se localizan en la parte externa del antebrazo. Extienden la muñeca y los dedos, equilibrando los flexores y previniendo lesiones. Ejercicios principales: extensiones de muñeca inversas y reverse curl.', NULL, NULL, '2026-04-19 20:49:28.870081-03', '2026-04-19 20:49:28.870081-03'),
    ('3c7b40cd-4071-48ae-adb0-e4913c3a7ff2'::uuid, '22e7080f-a4a9-457c-aeb5-1bff538eeb3d'::uuid, 'Dorsal Ancho',            'El dorsal ancho es el músculo más grande de la espalda, ubicado en la zona media y baja. Le da la clásica forma en V al torso y permite tirar los brazos hacia abajo y atrás. Ejercicios principales: dominadas, remo con barra y pulldown en polea.', NULL, NULL, '2026-04-19 20:50:26.698546-03', '2026-04-19 20:50:26.698546-03'),
    ('052db8da-fc86-450b-8d84-08d5b2b8c30f'::uuid, '22e7080f-a4a9-457c-aeb5-1bff538eeb3d'::uuid, 'Trapecio',                'El trapecio se sitúa en la parte superior de la espalda y cuello, formando una capa ancha. Eleva y retrae los hombros y omóplatos. Ejercicios principales: encogimientos de hombros, remo al mentón y face pulls.', NULL, NULL, '2026-04-19 20:50:49.656833-03', '2026-04-19 20:50:49.656833-03'),
    ('4f0a7f41-c316-4899-bbef-39df5ebfc1eb'::uuid, '22e7080f-a4a9-457c-aeb5-1bff538eeb3d'::uuid, 'Romboide Mayor',          'Los romboides se encuentran entre los omóplatos en la espalda media. Retraen y estabilizan los omóplatos durante movimientos de tirón. Ejercicios principales: remo sentado, remo con mancuernas y face pulls.', NULL, NULL, '2026-04-19 20:51:09.805982-03', '2026-04-19 20:51:09.805982-03'),
    ('acd5bbf5-9665-4449-af63-a4251b78e579'::uuid, '22e7080f-a4a9-457c-aeb5-1bff538eeb3d'::uuid, 'Erectores de la Columna', 'Los erectores de la columna recorren la espalda baja a ambos lados de la columna vertebral. Mantienen la postura erguida y extienden la espalda. Ejercicios principales: peso muerto, hiperextensiones y good mornings.', NULL, NULL, '2026-04-19 20:51:36.521482-03', '2026-04-19 20:51:36.521482-03'),
    ('ae8352a9-2568-4a4e-9e18-e7757e0be9d7'::uuid, '22e7080f-a4a9-457c-aeb5-1bff538eeb3d'::uuid, 'Redondo Mayor',           'El redondo mayor se localiza en la parte superior de la espalda, junto al omóplato. Ayuda en la aducción, extensión y rotación interna del brazo. Es clave en movimientos de tirón. Ejercicios principales: remo con mancuernas, pullover y dominadas.', NULL, NULL, '2026-04-19 20:51:56.948159-03', '2026-04-19 20:51:56.948159-03'),
    ('63644457-1a46-4562-89d9-46ac7077a03b'::uuid, '22e7080f-a4a9-457c-aeb5-1bff538eeb3d'::uuid, 'Serrato Anterior',        'El serrato anterior se encuentra en los laterales del tórax, debajo de la escápula. Protrae y rota la escápula hacia arriba, esencial para la estabilidad en empujes. Ejercicios principales: push-up plus, scapular wall slides y dips en paralelas.', NULL, NULL, '2026-04-19 20:52:19.42281-03', '2026-04-19 20:52:19.42281-03');

-- Exercised_Muscle
INSERT INTO public."Exercised_Muscle" (id, exercise_id, muscle_id, created_at, updated_at) VALUES
    ('9289c812-d605-4e71-8523-b3e482f3bd18'::uuid, '2c164517-e18f-4c97-a3a7-d31b9865640e'::uuid, 'ccf521a5-c910-4e9f-a86b-b5c2e202d80c'::uuid, '2026-04-26 20:21:55.956833-03', '2026-04-26 20:21:55.956833-03'),
    ('85eba518-bafd-4fb2-a8f2-e5f779d48d41'::uuid, '2c164517-e18f-4c97-a3a7-d31b9865640e'::uuid, '95f831db-8dd3-4477-b02f-4f675de81550'::uuid, '2026-04-26 20:21:57.278818-03', '2026-04-26 20:21:57.278818-03'),
    ('8cb8f18c-fcaa-4d21-98f9-5e59bbcf7138'::uuid, '2c164517-e18f-4c97-a3a7-d31b9865640e'::uuid, '870a269b-205c-4f8d-83db-7b557e819744'::uuid, '2026-04-26 20:21:57.649347-03', '2026-04-26 20:21:57.649347-03'),
    ('a78d989d-c207-48f9-8103-216facb79cce'::uuid, '2c164517-e18f-4c97-a3a7-d31b9865640e'::uuid, 'a356fd7c-ae2a-4813-bab0-fe70c2515c78'::uuid, '2026-04-26 20:21:57.757338-03', '2026-04-26 20:21:57.757338-03'),
    ('3b3a846e-a731-4102-982d-2d5dcd6bf959'::uuid, 'e66c5580-d397-471f-85f0-13bc74655b64'::uuid, 'ccf521a5-c910-4e9f-a86b-b5c2e202d80c'::uuid, '2026-05-07 19:54:30.951098-03', '2026-05-07 19:54:30.951098-03'),
    ('4c1655d6-3d0a-4aba-a437-e4020a349d6c'::uuid, 'e66c5580-d397-471f-85f0-13bc74655b64'::uuid, '870a269b-205c-4f8d-83db-7b557e819744'::uuid, '2026-05-07 19:54:32.377731-03', '2026-05-07 19:54:32.377731-03'),
    ('2d43753c-fbd0-42a3-9898-7a32e4c6dfe1'::uuid, 'e66c5580-d397-471f-85f0-13bc74655b64'::uuid, '95f831db-8dd3-4477-b02f-4f675de81550'::uuid, '2026-05-07 19:54:32.405671-03', '2026-05-07 19:54:32.405671-03'),
    ('37fa36ce-ae8b-46df-b766-b5a0992806d8'::uuid, 'e66c5580-d397-471f-85f0-13bc74655b64'::uuid, 'a356fd7c-ae2a-4813-bab0-fe70c2515c78'::uuid, '2026-05-07 19:54:32.437564-03', '2026-05-07 19:54:32.437564-03');

-- User_RM
INSERT INTO public."User_RM" (id, user_id, exercise_id, weight, reps, date, created_at, updated_at) VALUES
    ('5fdf6710-5be2-47f3-8ba4-cf723b84d080'::uuid, '2abeb10e-431a-4116-a749-8cbf37740f70'::uuid, '2c164517-e18f-4c97-a3a7-d31b9865640e'::uuid, 200.00, 1, '2022-12-01', '2026-05-07 19:36:32.506083-03', '2026-05-07 19:36:32.506083-03'),
    ('a4a6592b-deec-48c8-b408-7c779b00bac4'::uuid, '2abeb10e-431a-4116-a749-8cbf37740f70'::uuid, '2c164517-e18f-4c97-a3a7-d31b9865640e'::uuid, 205.00, 1, '2022-12-02', '2026-05-07 19:42:32.01941-03',  '2026-05-07 19:42:32.01941-03'),
    ('a3780a42-615f-45e0-bd23-18f106f76204'::uuid, '2abeb10e-431a-4116-a749-8cbf37740f70'::uuid, 'e66c5580-d397-471f-85f0-13bc74655b64'::uuid, 205.00, 1, '2022-12-02', '2026-05-07 19:56:39.734919-03', '2026-05-07 19:56:39.734919-03');
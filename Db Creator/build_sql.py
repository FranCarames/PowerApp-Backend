# -*- coding: utf-8 -*-
"""
Orquestador del seed de PowerApp.
Genera TRES archivos SQL:
  1. 01_estructura.sql      -> DDL (tablas, ENUMs, FKs, indices)
  2. 02_datos_estaticos.sql -> Muscle_Group, Muscle, Exercise, Exercised_Muscle
  3. 03_datos_dinamicos.sql -> User, Coach, Membership, Membership_Payment, User_RM

Uso:  python3 build_sql.py
"""
import gen_seed
from gen_seed import MUSCLES, GROUPS, NEW_GROUPS, U, esc, TS
import catalogo_ejercicios
import static_extra as SX
import dynamic_data as DD

ALL_EX = catalogo_ejercicios.EXERCISES

# Ejercicios que ya existen en el seed original (no recrearlos desde el catalogo nuevo)
EXISTING_EXERCISE_NAMES = {"Sentadilla", "Sentadilla Barra Baja"}
EXISTING_EX_UUID = {
    "Sentadilla": "2c164517-e18f-4c97-a3a7-d31b9865640e",
    "Sentadilla Barra Baja": "e66c5580-d397-471f-85f0-13bc74655b64",
}

def ex_uuid(name):
    return U("exercise:" + name)


# =============================================================
#  ETAPA 1: ESTRUCTURA (DDL)
# =============================================================
def build_estructura():
    import ddl
    return ddl.DDL.rstrip() + "\n"


# =============================================================
#  ETAPA 2: DATOS ESTATICOS
# =============================================================
def build_estaticos():
    out = []
    w = out.append

    w("-- =============================================================")
    w("--  PowerApp DB - DATOS ESTATICOS")
    w("--  Catalogo base que la app necesita SIEMPRE para funcionar:")
    w("--  Muscle_Group, Muscle, Exercise, Exercised_Muscle")
    w("--  Ejecutar DESPUES de 01_estructura.sql")
    w("-- =============================================================")
    w("")

    # ---------- MUSCLE_GROUP ----------
    EXISTING_GROUPS = {name: gid for name, gid in GROUPS.items() if name not in NEW_GROUPS}
    w("-- Grupos musculares (existentes + nuevos)")
    w('INSERT INTO public."Muscle_Group" (id, name, image_url, preview_image, created_at, updated_at) VALUES')
    rows = []
    for name, gid in EXISTING_GROUPS.items():
        c, u = SX.GROUP_TIMESTAMPS.get(gid, (TS.strip("'"), TS.strip("'")))
        rows.append("    ('{}'::uuid, {}, NULL, NULL, '{}', '{}')".format(gid, esc(name), c, u))
    for name, gid in NEW_GROUPS.items():
        rows.append("    ('{}'::uuid, {}, NULL, NULL, {}, {})".format(gid, esc(name), TS, TS))
    w(",\n".join(rows) + "\nON CONFLICT (id) DO NOTHING;")
    w("")

    # ---------- MUSCLE ----------
    w("-- Musculos (existentes + nuevos)")
    w('INSERT INTO public."Muscle" (id, muscle_group_id, name, description, image_url, preview_image, created_at, updated_at) VALUES')
    rows = []
    for k, m in MUSCLES.items():
        rows.append("    ('{}'::uuid, '{}'::uuid, {}, {}, NULL, NULL, {}, {})".format(
            m["id"], m["group"], esc(m["name"]), esc(m["desc"]), TS, TS))
    w(",\n".join(rows) + "\nON CONFLICT (id) DO NOTHING;")
    w("")

    # ---------- EXERCISE ----------
    w("-- Ejercicios (originales + catalogo nuevo)")
    w('INSERT INTO public."Exercise" (id, name, description, safety_tips, activation_tips, video_url, preview_image, bg_image, created_at, updated_at) VALUES')
    rows = []
    # Originales primero (textos y timestamps reales)
    for eid, name, desc, safety, activation, c, u in SX.ORIGINAL_EXERCISES:
        rows.append("    ('{}'::uuid, {}, {}, {}, {}, NULL, NULL, NULL, '{}', '{}')".format(
            eid, esc(name), esc(desc), esc(safety), esc(activation), c, u))
    # Nuevos
    ex_id_map = dict(EXISTING_EX_UUID)
    for name, muscles, desc, safety, activation in ALL_EX:
        if name in EXISTING_EXERCISE_NAMES:
            continue
        eid = ex_uuid(name)
        ex_id_map[name] = eid
        rows.append("    ('{}'::uuid, {}, {}, {}, {}, NULL, NULL, NULL, {}, {})".format(
            eid, esc(name), esc(desc), esc(safety), esc(activation), TS, TS))
    w(",\n".join(rows) + "\nON CONFLICT (id) DO NOTHING;")
    w("")

    # ---------- EXERCISED_MUSCLE ----------
    w("-- Vinculos ejercicio <-> musculos")
    w('INSERT INTO public."Exercised_Muscle" (id, exercise_id, muscle_id, created_at, updated_at) VALUES')
    rows = []
    # Originales primero
    for lid, eid, mid, c, u in SX.ORIGINAL_EXERCISED_MUSCLE:
        rows.append("    ('{}'::uuid, '{}'::uuid, '{}'::uuid, '{}', '{}')".format(lid, eid, mid, c, u))
    # Nuevos (saltea los de las 2 sentadillas, ya estan arriba como originales)
    for name, muscles, desc, safety, activation in ALL_EX:
        if name in EXISTING_EXERCISE_NAMES:
            continue
        eid = ex_id_map[name]
        for mkey in muscles:
            mid = MUSCLES[mkey]["id"]
            link_id = U("em:" + name + ":" + mkey)
            rows.append("    ('{}'::uuid, '{}'::uuid, '{}'::uuid, {}, {})".format(link_id, eid, mid, TS, TS))
    w(",\n".join(rows) + "\nON CONFLICT (exercise_id, muscle_id) DO NOTHING;")
    w("")

    return "\n".join(out)


# =============================================================
#  ETAPA 3: DATOS DINAMICOS (de prueba)
# =============================================================
def build_dinamicos():
    out = []
    w = out.append

    w("-- =============================================================")
    w("--  PowerApp DB - DATOS DINAMICOS (de prueba)")
    w("--  Usuarios, coaches, membresias y pagos para testear la app.")
    w("--  Ejecutar DESPUES de 02_datos_estaticos.sql")
    w("-- =============================================================")
    w("")

    # ---------- USER ----------
    w("-- Usuarios de prueba")
    w('INSERT INTO public."User" (id, first_name, last_name, email, email_verified, password, temp_password, profile_picture, phone_number, phone_verified, created_at, updated_at, role) VALUES')
    rows = []
    for (uid, fn, ln, email, ev, pw, tp, pp, phone, pv, c, u, role) in DD.USERS:
        rows.append("    ('{}'::uuid, {}, {}, {}, {}, {}, {}, {}, {}, {}, '{}', '{}', '{}')".format(
            uid, esc(fn), esc(ln), esc(email), str(ev).lower(), esc(pw),
            esc(tp), esc(pp), esc(phone), str(pv).lower(), c, u, role))
    w(",\n".join(rows) + "\nON CONFLICT (id) DO NOTHING;")
    w("")

    # ---------- COACH ----------
    w("-- Coaches de prueba")
    w('INSERT INTO public."Coach" (id, coach_email, cuil, active, created_at, updated_at) VALUES')
    rows = []
    for (cid, cemail, cuil, active, c, u) in DD.COACHES:
        rows.append("    ('{}'::uuid, {}, {}, {}, '{}', '{}')".format(
            cid, esc(cemail), esc(cuil), str(active).lower(), c, u))
    w(",\n".join(rows) + "\nON CONFLICT (id) DO NOTHING;")
    w("")

    # ---------- MEMBERSHIP ----------
    w("-- Membresias")
    w('INSERT INTO public."Membership" (id, name, duration, price, created_at, updated_at) VALUES')
    rows = []
    for (mid, name, dur, price, c, u) in DD.MEMBERSHIPS:
        rows.append("    ('{}'::uuid, {}, {}, {}, '{}', '{}')".format(
            mid, esc(name), dur, price, c, u))
    w(",\n".join(rows) + "\nON CONFLICT (id) DO NOTHING;")
    w("")

    # ---------- MEMBERSHIP_PAYMENT ----------
    w("-- Pagos de membresia")
    w('INSERT INTO public."Membership_Payment" (id, user_id, membership_id, name, duration, active, price, created_at, updated_at, expired_at) VALUES')
    rows = []
    for (pid, uid, mid, name, dur, active, price, c, u, exp) in DD.MEMBERSHIP_PAYMENTS:
        rows.append("    ('{}'::uuid, '{}'::uuid, '{}'::uuid, {}, {}, {}, {}, '{}', '{}', '{}')".format(
            pid, uid, mid, esc(name), dur, str(active).lower(), price, c, u, exp))
    w(",\n".join(rows) + "\nON CONFLICT (id) DO NOTHING;")
    w("")

    # ---------- USER_RM ----------
    w("-- RMs de usuario (historial de levantamientos de prueba)")
    w('INSERT INTO public."User_RM" (id, user_id, exercise_id, weight, reps, date, created_at, updated_at) VALUES')
    rows = []
    for (rid, uid, eid, weight, reps, date, c, u) in DD.USER_RMS:
        rows.append("    ('{}'::uuid, '{}'::uuid, '{}'::uuid, {}, {}, '{}', '{}', '{}')".format(
            rid, uid, eid, weight, reps, date, c, u))
    w(",\n".join(rows) + "\nON CONFLICT (id) DO NOTHING;")
    w("")

    return "\n".join(out)


# =============================================================
#  MAIN
# =============================================================
if __name__ == "__main__":
    archivos = {
        "01_estructura.sql": build_estructura(),
        "02_datos_estaticos.sql": build_estaticos(),
        "03_datos_dinamicos.sql": build_dinamicos(),
    }
    for fname, content in archivos.items():
        with open(fname, "w", encoding="utf-8") as f:
            f.write(content)
        print("Generado: {:28s} ({} lineas)".format(fname, len(content.splitlines())))

    n_ex = len([e for e in ALL_EX if e[0] not in EXISTING_EXERCISE_NAMES]) + len(SX.ORIGINAL_EXERCISES)
    print("\nResumen datos estaticos:")
    print("  - Grupos musculares :", len(GROUPS))
    print("  - Musculos          :", len(MUSCLES))
    print("  - Ejercicios        :", n_ex)
    print("Resumen datos dinamicos:")
    print("  - Usuarios          :", len(DD.USERS))
    print("  - Coaches           :", len(DD.COACHES))
    print("  - Membresias        :", len(DD.MEMBERSHIPS))
    print("  - Pagos             :", len(DD.MEMBERSHIP_PAYMENTS))
    print("  - User_RM           :", len(DD.USER_RMS))

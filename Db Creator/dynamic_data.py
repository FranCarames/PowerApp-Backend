# -*- coding: utf-8 -*-
"""
Modulo de DATOS DINAMICOS (de prueba) - PowerApp
User, Coach, Membership, Membership_Payment, User_RM y la cadena de entrenamiento
(Circuit, Routine, Routine_Exercise, Exercise_Set, Routine_Circuit, Planification,
Routine_Asignation, User_Planification, Routine_Asignation_User y las dos tablas de
"hecho": Routine_Asign_Exercise_Finished y Routine_Exercise_Finished).

Incluye:
 - Los registros originales del seed.
 - 5 alumnos nuevos + 2 entrenadores nuevos (Charly Tauros, Roman Koski).
 - Historial de membresias (>4 meses) por alumno: mezcla de diaria/mensual/trimestral.
 - RMs con progresion realista para los ejercicios principales por alumno.
 - La cadena de entrenamiento (BE-21): circuitos, rutinas, planificaciones, asignaciones
   (individuales y de plan) y ejecuciones, con un escenario por alumno. Va al final del
   modulo; las fechas son FIJAS (octubre a diciembre de 2026) para que la regeneracion
   sea byte-identica.

UUIDs deterministas (uuid5 con namespace fijo) => re-ejecutable estable.
"""
import uuid
from datetime import date, datetime, timedelta

import gen_seed
import catalogo_ejercicios

NS = uuid.UUID("99999999-8888-7777-6666-555555555555")
def U(label):
    return str(uuid.uuid5(NS, label))

# Password bcrypt para TODOS los datos de prueba.
# Hash generado por el backend de PowerApp. Login de prueba: pass123
TEST_PW = "$2b$10$q9C820afQ5U.qNuSEUCn9.cA2yi8EQPLgznGq3iETS/k1yKy/ZRTi"

# =============================================================
#  MEMBRESIAS (catalogo de planes - se mantiene el original)
# =============================================================
# (id, name, duration, price, created_at, updated_at)
MEMBERSHIPS = [
    ("6e1992e8-3005-4fd4-94a4-cbb70e160a61", "Membresia Diaria", 1, "3000.00",
     "2026-04-21 20:29:21.790259-03", "2026-04-21 20:30:46.210723-03"),
    ("7f86a6d0-8d11-45a0-96d7-684407cbd05d", "Membresia Mensual", 30, "60000.00",
     "2026-04-21 20:31:04.905079-03", "2026-04-21 20:31:04.905079-03"),
    ("f1a5b588-17fb-4684-853c-9a015e5761a4", "Membresia Trimestral", 90, "150000.00",
     "2026-04-21 20:31:18.398486-03", "2026-04-21 20:32:12.557085-03"),
]
# acceso rapido por tipo
MEM = {
    "diaria":     {"id": MEMBERSHIPS[0][0], "name": "Membresia Diaria",     "dur": 1,  "price": "3000.00"},
    "mensual":    {"id": MEMBERSHIPS[1][0], "name": "Membresia Mensual",    "dur": 30, "price": "60000.00"},
    "trimestral": {"id": MEMBERSHIPS[2][0], "name": "Membresia Trimestral", "dur": 90, "price": "150000.00"},
}

# =============================================================
#  EJERCICIOS PRINCIPALES (para RMs) - UUIDs reales
# =============================================================
MAIN_EXERCISES = {
    "Sentadilla":               "2c164517-e18f-4c97-a3a7-d31b9865640e",  # original
    "Press de Banca Plano":     "ae44805a-6931-55e1-aafb-a4f7e2462b6b",
    "Peso Muerto Convencional": "0bd03725-9b75-5fdd-b713-98bbf4ada440",
    "Remo con Barra Inclinado": "ba54bcf2-4709-550e-817e-96986073f43b",
}

# =============================================================
#  USUARIOS ORIGINALES (no se tocan)
# =============================================================
# (id, first_name, last_name, email, email_verified, password, temp_password,
#  profile_picture, phone_number, phone_verified, created_at, updated_at, role)
_ORIGINAL_USERS = [
    ("6d8a02c2-5bd0-4cd3-8c0b-db5a62d24d85", "Franco", "Admin", "caramesfranco@gmail.com",
     False, TEST_PW, None, None,
     "1157217320", False, "2026-04-09 21:05:38.195244-03", "2026-04-09 21:05:38.195244-03", "admin"),
    ("2abeb10e-431a-4116-a749-8cbf37740f70", "Franco", "Carames", "frankkram@gmail.com",
     False, TEST_PW, None, None,
     "1157217320", False, "2026-04-09 21:06:35.162061-03", "2026-04-09 21:06:35.162061-03", "user"),
    ("1188a044-5515-4348-a2be-6a5afdaf44f1", "Franco", "Carames", "francocoach@gmail.com",
     False, TEST_PW, None, None,
     "1157217320", False, "2026-04-26 21:39:13.168299-03", "2026-04-26 21:39:13.168299-03", "user"),
]

# Coach original (no se toca)
_ORIGINAL_COACHES = [
    ("1188a044-5515-4348-a2be-6a5afdaf44f1", "francocoach1@gmail.com", "11111111111", False,
     "2026-04-27 16:57:01.526267-03", "2026-04-27 18:25:58.892392-03"),
]

# Pago original (no se toca)
_ORIGINAL_PAYMENTS = [
    ("34fc6625-d3a8-4ae6-b44f-81095a933e56", "2abeb10e-431a-4116-a749-8cbf37740f70",
     "6e1992e8-3005-4fd4-94a4-cbb70e160a61", "Membresia Diaria", 1, True, "3000.00",
     "2026-04-22 16:19:21.304208-03", "2026-04-22 16:19:21.304208-03", "2026-04-23 23:59:59.999-03"),
]

# RMs originales (no se tocan)
_ORIGINAL_RMS = [
    ("5fdf6710-5be2-47f3-8ba4-cf723b84d080", "2abeb10e-431a-4116-a749-8cbf37740f70",
     "2c164517-e18f-4c97-a3a7-d31b9865640e", "200.00", 1, "2022-12-01",
     "2026-05-07 19:36:32.506083-03", "2026-05-07 19:36:32.506083-03"),
    ("a4a6592b-deec-48c8-b408-7c779b00bac4", "2abeb10e-431a-4116-a749-8cbf37740f70",
     "2c164517-e18f-4c97-a3a7-d31b9865640e", "205.00", 1, "2022-12-02",
     "2026-05-07 19:42:32.01941-03", "2026-05-07 19:42:32.01941-03"),
    ("a3780a42-615f-45e0-bd23-18f106f76204", "2abeb10e-431a-4116-a749-8cbf37740f70",
     "e66c5580-d397-471f-85f0-13bc74655b64", "205.00", 1, "2022-12-02",
     "2026-05-07 19:56:39.734919-03", "2026-05-07 19:56:39.734919-03"),
]

# =============================================================
#  NUEVOS ALUMNOS Y ENTRENADORES
# =============================================================
# Alumnos nuevos: (nombre, apellido, email, telefono, fuerza_base_kg dict)
# fuerza_base = peso inicial aprox por ejercicio (para progresion de RMs)
_NEW_STUDENTS = [
    ("Lucia",   "Fernandez", "lucia.fernandez@test.com",  "1145000001",
     {"Sentadilla": 60,  "Press de Banca Plano": 35, "Peso Muerto Convencional": 80,  "Remo con Barra Inclinado": 30}),
    ("Mateo",   "Gimenez",   "mateo.gimenez@test.com",    "1145000002",
     {"Sentadilla": 100, "Press de Banca Plano": 75, "Peso Muerto Convencional": 130, "Remo con Barra Inclinado": 60}),
    ("Sofia",   "Rossi",     "sofia.rossi@test.com",      "1145000003",
     {"Sentadilla": 70,  "Press de Banca Plano": 40, "Peso Muerto Convencional": 90,  "Remo con Barra Inclinado": 35}),
    ("Tomas",   "Acosta",    "tomas.acosta@test.com",     "1145000004",
     {"Sentadilla": 120, "Press de Banca Plano": 90, "Peso Muerto Convencional": 160, "Remo con Barra Inclinado": 70}),
    ("Valentina","Lopez",    "valentina.lopez@test.com",  "1145000005",
     {"Sentadilla": 80,  "Press de Banca Plano": 45, "Peso Muerto Convencional": 100, "Remo con Barra Inclinado": 40}),
]

# Entrenadores nuevos: (nombre, apellido, email, telefono, coach_email, cuil)
_NEW_COACHES = [
    ("Charly", "Tauros", "charly.tauros@test.com", "1146000001", "charly.tauros.coach@test.com", "20304050601"),
    ("Roman",  "Koski",  "roman.koski@test.com",   "1146000002", "roman.koski.coach@test.com",   "20304050602"),
]

# Fecha base para empezar los historiales (hace ~6 meses respecto a la fecha de la app)
_BASE_DATE = date(2025, 12, 1)


def _ts(d):
    """date -> timestamp string a las 10:00 -03."""
    return d.strftime("%Y-%m-%d") + " 10:00:00-03"


def _build():
    users = list(_ORIGINAL_USERS)
    coaches = list(_ORIGINAL_COACHES)
    payments = list(_ORIGINAL_PAYMENTS)
    rms = list(_ORIGINAL_RMS)

    student_ids = []  # para membresias y RMs

    # ---- ALUMNOS NUEVOS ----
    for fn, ln, email, phone, base in _NEW_STUDENTS:
        uid = U("user:" + email)
        student_ids.append((uid, base, email))
        created = _ts(_BASE_DATE)
        users.append((uid, fn, ln, email, True, TEST_PW, None, None, phone, True,
                      created, created, "user"))

    # ---- ENTRENADORES NUEVOS (User rol coach + fila Coach) ----
    for fn, ln, email, phone, cemail, cuil in _NEW_COACHES:
        uid = U("user:" + email)
        created = _ts(_BASE_DATE)
        users.append((uid, fn, ln, email, True, TEST_PW, None, None, phone, True,
                      created, created, "coach"))
        coaches.append((uid, cemail, cuil, True, created, created))

    # ---- HISTORIAL DE MEMBRESIAS (solo alumnos: nuevos + users actuales) ----
    # Patron realista por alumno: arranca con alguna diaria suelta, luego
    # mensuales encadenadas, y alguna trimestral. Cubre > 4 meses.
    # Secuencia (tipo, dias que avanza el cursor):
    PLAN_SEQUENCE = [
        ("diaria", 1), ("diaria", 1),            # par de dias sueltos al inicio
        ("mensual", 30), ("mensual", 30),        # 2 meses
        ("trimestral", 90),                       # 3 meses -> total ~5 meses
        ("mensual", 30),                          # 1 mes mas -> ~6 meses
    ]

    # Alumnos que reciben historial: los 5 nuevos + los users actuales con rol 'user'
    students_for_membership = [(uid, email) for (uid, base, email) in student_ids]
    # users actuales con rol 'user'
    for u in _ORIGINAL_USERS:
        if u[12] == "user":
            students_for_membership.append((u[0], u[3]))

    for uid, email in students_for_membership:
        cursor = _BASE_DATE
        seq = PLAN_SEQUENCE
        n = len(seq)
        for i, (tipo, adv) in enumerate(seq):
            plan = MEM[tipo]
            start = cursor
            exp = start + timedelta(days=plan["dur"])
            is_last = (i == n - 1)
            pid = U("pay:" + email + ":" + str(i))
            created = _ts(start)
            updated = created
            expired = exp.strftime("%Y-%m-%d") + " 23:59:59.999-03"
            payments.append((pid, uid, plan["id"], plan["name"], plan["dur"],
                             is_last, plan["price"], created, updated, expired))
            cursor = exp  # encadenar

    # ---- RMs CON PROGRESION (solo alumnos nuevos) ----
    # 4 mediciones por ejercicio, una cada ~3 semanas, peso subiendo.
    for uid, base, email in student_ids:
        for ex_name, ex_id in MAIN_EXERCISES.items():
            w0 = base.get(ex_name)
            if w0 is None:
                continue
            for k in range(4):  # 4 fechas de progresion
                d = _BASE_DATE + timedelta(days=21 * k + 10)
                # progresion: +2.5kg por medicion (aprox)
                weight = w0 + int(2.5 * k * 2) / 2.0  # incrementos de 2.5
                weight = round(w0 + 2.5 * k, 2)
                rid = U("rm:" + email + ":" + ex_name + ":" + str(k))
                created = _ts(d)
                rms.append((rid, uid, ex_id, "{:.2f}".format(weight), 1,
                            d.strftime("%Y-%m-%d"), created, created))

    return users, coaches, payments, rms


USERS, COACHES, MEMBERSHIP_PAYMENTS, USER_RMS = _build()


# =============================================================
#  CADENA DE ENTRENAMIENTO (BE-21)
# =============================================================
# Un escenario por alumno, para poder demostrar cada flujo de U-08 a E-07 sin cargar nada a mano:
#   Lucia     plan "Fuerza" VIGENTE desde el lunes 19/10, con la semana 1 casi completa, parte de la
#             2 y una individual el sabado 24/10. Como ya tiene un plan vigente, asignarle otro da
#             409 de solapamiento (E-13)
#   Mateo     plan "Fuerza" vigente desde el 26/10, todavia sin marcas, y una individual pasada, completa
#   Sofia     plan "Fuerza" QUITADO (E-14) con marcas en las semanas 1 y 2, y "Hipertrofia" vigente
#             desde el 26/10
#   Tomas     plan "Hipertrofia" FUTURO (desde el 30/11) y una individual futura, sin marcas
#   Valentina SIN plan; individuales: una hecha, dos el mismo dia y una futura
#
# Casos borde de baja logica (lo que BE-35 nunca pudo probar):
#   - "Full Body" tiene el circuito "Metabolico" apagado (sin orden) y Valentina completo un ejercicio
#     suyo: el detalle muestra solo lo completado de ese circuito
#   - "Fondos en Paralelas" esta dado de baja en el circuito "Empuje" y Lucia lo completo antes
#   - "Metabolico" esta quitada de la semana 2 del plan "Fuerza" y Sofia hizo algo en ella
#
# Las fechas son FIJAS: el seed no puede saber que dia se aplica, y la regeneracion tiene que dar
# los mismos bytes. El home se navega mandando `date`. Los lunes del escenario: 5/10, 12/10, 19/10,
# 26/10, 2/11, 9/11, 16/11 y 30/11. Todo lo creado lleva marcas de tiempo del 12/10 en adelante.

_CATALOG_NAMES = {e[0] for e in catalogo_ejercicios.EXERCISES}
_ORIGINAL_EXERCISE_IDS = {
    "Sentadilla": MAIN_EXERCISES["Sentadilla"],
    "Sentadilla Barra Baja": "e66c5580-d397-471f-85f0-13bc74655b64",
}


def _ex(name):
    """Id de un ejercicio del catalogo por nombre (el mismo calculo que build_sql.ex_uuid)."""
    if name in _ORIGINAL_EXERCISE_IDS:
        return _ORIGINAL_EXERCISE_IDS[name]
    if name not in _CATALOG_NAMES:
        raise ValueError("Ejercicio fuera del catalogo: " + name)
    return gen_seed.U("exercise:" + name)


def _set(count, reps, weight=None, rpe=None, rir=None, rm_perc=None, amrap=False, amrap_time=None, rm=False):
    """Un bloque de series, con las reglas de CreateCircuitSetDto."""
    assert 1 <= count <= 20 and 1 <= reps <= 1000
    assert rpe is None or rir is None, "rpe y rir son excluyentes"
    assert rpe is None or 1 <= rpe <= 10
    assert rir is None or 0 <= rir <= 10
    assert rm_perc is None or 1 <= rm_perc <= 125
    assert amrap_time is None or amrap, "amrap_time solo con amrap"
    assert not rm or count == 1, "un intento de RM es de a uno"
    return (count, reps, None if weight is None else "{:.2f}".format(weight), rpe, rir, rm_perc, amrap, amrap_time, rm)


def _day(s, plus=0):
    return (date.fromisoformat(s) + timedelta(days=plus)).isoformat()


def _at(day, hhmm="19:30"):
    return "{} {}:00-03".format(day, hhmm)


# Circuitos: (clave, nombre, descripcion, tipo, activo, [(ejercicio, nota del coach, activo, [series])]).
# Una fila de series es un bloque: set_count 3 con rep_count 8 es "3x8".
_CIRCUITS = [
    ("piernas_fuerza", "Piernas - Fuerza", "Sentadilla y bisagra de cadera pesadas", "normal", True, [
        ("Sentadilla", "Bajá controlado y subí explosivo", True, [_set(1, 5, rm_perc=60), _set(3, 5, rm_perc=75, rpe=7)]),
        ("Peso Muerto Rumano", "Espalda neutra todo el recorrido", True, [_set(3, 8, weight=60, rir=2)]),
        ("Zancadas con Mancuernas", None, True, [_set(3, 10, weight=14)]),
    ]),
    ("piernas_hipertrofia", "Piernas - Hipertrofia", "Volumen para cuádriceps y gemelos", "normal", True, [
        ("Prensa de Piernas 45 Grados", "Sin bloquear las rodillas", True, [_set(3, 12, weight=120, rpe=8)]),
        ("Curl de Piernas Tumbado", None, True, [_set(3, 12, weight=35, rir=2)]),
        ("Elevación de Talones de Pie", "Pausa de un segundo arriba", True, [_set(4, 15, weight=50)]),
    ]),
    ("empuje", "Empuje", "Pecho y hombros", "normal", True, [
        ("Press de Banca Plano", "Escápulas retraídas", True, [_set(4, 6, rm_perc=75, rpe=7), _set(1, 8, rm_perc=70, amrap=True)]),
        ("Press Militar con Barra", None, True, [_set(3, 8, weight=30, rpe=8)]),
        ("Fondos en Paralelas", None, False, [_set(3, 10)]),
    ]),
    ("traccion", "Tracción", "Espalda y hombro posterior", "normal", True, [
        ("Remo con Barra Inclinado", "Pecho al frente, sin balanceo", True, [_set(4, 8, weight=40, rir=2)]),
        ("Dominadas Pronas", None, True, [_set(3, 6)]),
        ("Face Pull en Polea", "Codos altos", True, [_set(3, 15, weight=15)]),
    ]),
    ("core", "Core", "Abdomen en superserie", "superserie", True, [
        ("Plancha Abdominal", "Cuerpo en línea", True, [_set(3, 1, amrap=True, amrap_time=45)]),
        ("Elevación de Piernas Colgado", None, True, [_set(3, 10)]),
        ("Crunch Abdominal", None, True, [_set(3, 15)]),
    ]),
    ("metabolico", "Metabólico", "Cierre cronometrado", "amrap", True, [
        ("Burpee", "Al ritmo que puedas sostener", True, [_set(1, 10, amrap=True, amrap_time=300)]),
        ("Remo en Ergómetro", None, True, [_set(1, 1, amrap=True, amrap_time=300)]),
    ]),
    ("desuso", "Circuito en desuso", "Dado de baja", "normal", False, [
        ("Curl con Barra", None, True, [_set(3, 10, weight=20)]),
    ]),
]

# Rutinas: (clave, nombre, nota del coach, activa, [(circuito, orden, vinculo activo)]).
# Un vinculo apagado no tiene orden (el order se normaliza a 1..N solo entre los activos).
_ROUTINES = [
    ("dia_a", "Día A - Piernas", "Entrá en calor 10 minutos", True,
     [("piernas_fuerza", 1, True), ("piernas_hipertrofia", 2, True)]),
    ("dia_b", "Día B - Empuje", None, True, [("empuje", 1, True), ("core", 2, True)]),
    ("dia_c", "Día C - Tracción", None, True, [("traccion", 1, True), ("core", 2, True)]),
    ("full_body", "Full Body", "Para los días sueltos", True,
     [("piernas_fuerza", 1, True), ("empuje", 2, True), ("traccion", 3, True), ("metabolico", None, False)]),
    ("metabolico", "Metabólico", "Cardio de cierre", True, [("metabolico", 1, True)]),
    ("baja", "Rutina de prueba (baja)", "Dada de baja", False, [("core", 1, True)]),
]


def _weeks(weeks, routines):
    """Las mismas rutinas, en cada semana, con su orden."""
    return [(week, key, order, True) for week in weeks for order, key in enumerate(routines, start=1)]


# Planificaciones: (clave, nombre, descripcion, rutinas por semana, tipo, duracion en semanas, activa,
# [(semana, rutina, orden, activa)]). Duracion 0 = sin duracion fija: el fin lo pone cada asignacion.
_PLANS = [
    ("fuerza", "Fuerza 4 semanas", "Tres días por semana, con foco en los básicos", 3, "Fuerza", 4, True,
     _weeks(range(1, 5), ["dia_a", "dia_b", "dia_c"]) + [(2, "metabolico", 4, False)]),
    ("hiper", "Hipertrofia 6 semanas", "Semanas 1 a 3 cargadas; el resto lo completa el coach", 3, "Hipertrofia", 6, True,
     _weeks(range(1, 4), ["dia_a", "dia_b", "dia_c"])),
    ("libre", "Plan libre", "Sin duración fija: el fin lo define cada asignación", 2, "General", 0, True,
     _weeks(range(1, 3), ["full_body", "metabolico"])),
    ("descontinuado", "Plan descontinuado", "Dado de baja", 1, "Fuerza", 2, False,
     [(1, "full_body", 1, True)]),
]

# Asignaciones de plan: (clave, alumno, coach, plan, nota del coach, inicio, fin, activa, alta, ultima modificacion).
# El inicio es siempre lunes y el fin, domingo: el fin por defecto es el domingo de la semana `duracion`.
_USER_PLANS = [
    ("lucia_fuerza", "lucia.fernandez@test.com", "charly.tauros@test.com", "fuerza", "Foco en técnica de sentadilla",
     "2026-10-19", "2026-11-15", True, "2026-10-17 09:00:00-03", "2026-10-17 09:00:00-03"),
    ("mateo_fuerza", "mateo.gimenez@test.com", "charly.tauros@test.com", "fuerza", None,
     "2026-10-26", "2026-11-22", True, "2026-10-22 10:00:00-03", "2026-10-22 10:00:00-03"),
    ("sofia_fuerza", "sofia.rossi@test.com", "roman.koski@test.com", "fuerza", "Retoma después de la lesión",
     "2026-10-05", "2026-11-01", False, "2026-10-03 11:00:00-03", "2026-10-20 18:00:00-03"),
    ("sofia_hiper", "sofia.rossi@test.com", "roman.koski@test.com", "hiper", None,
     "2026-10-26", "2026-12-06", True, "2026-10-20 18:05:00-03", "2026-10-20 18:05:00-03"),
    ("tomas_hiper", "tomas.acosta@test.com", "roman.koski@test.com", "hiper", "Arranca después del viaje",
     "2026-11-30", "2027-01-10", True, "2026-10-21 10:00:00-03", "2026-10-21 10:00:00-03"),
]

# Asignaciones individuales: (alumno, rutina, dia, alta).
_INDIVIDUALS = [
    ("valentina.lopez@test.com", "full_body", "2026-10-19", "2026-10-16 10:00:00-03"),
    ("valentina.lopez@test.com", "full_body", "2026-10-26", "2026-10-22 10:00:00-03"),
    ("valentina.lopez@test.com", "metabolico", "2026-10-26", "2026-10-22 10:05:00-03"),
    ("valentina.lopez@test.com", "full_body", "2026-11-02", "2026-10-22 10:10:00-03"),
    ("lucia.fernandez@test.com", "metabolico", "2026-10-24", "2026-10-20 10:00:00-03"),
    ("mateo.gimenez@test.com", "full_body", "2026-10-21", "2026-10-19 10:00:00-03"),
    ("tomas.acosta@test.com", "full_body", "2026-11-04", "2026-10-22 11:00:00-03"),
]


def _build_training():
    t0 = "2026-10-12 09:00:00-03"  # alta de todo el catalogo de entrenamiento

    circuits, routine_exercises, exercise_sets = [], [], []
    re_id = {}          # (circuito, ejercicio) -> id del Routine_Exercise
    circuit_items = {}  # circuito -> [(ejercicio, activo)]
    for key, name, desc, ctype, active, exercises in _CIRCUITS:
        assert len(name) <= 100 and len(desc) <= 100 and len(ctype) <= 30
        cid = U("circuit:" + key)
        circuits.append((cid, name, desc, ctype, active, t0, t0))
        circuit_items[key] = []
        names = [e[0] for e in exercises]
        assert len(set(names)) == len(names), "un ejercicio no se repite dentro del circuito: " + key
        for order, (ex_name, note, ex_active, sets) in enumerate(exercises, start=1):
            assert note is None or len(note) <= 100
            rid = U("re:{}:{}".format(key, ex_name))
            re_id[(key, ex_name)] = rid
            circuit_items[key].append((ex_name, ex_active))
            routine_exercises.append((rid, _ex(ex_name), cid, order, note, ex_active, t0, t0))
            for n, s in enumerate(sets, start=1):
                exercise_sets.append((U("set:{}:{}:{}".format(key, ex_name, n)), rid, n) + s + (t0, t0))

    routines, routine_circuits = [], []
    routine_id, routine_links = {}, {}
    for key, name, note, active, links in _ROUTINES:
        assert len(name) <= 50 and (note is None or len(note) <= 100)
        rid = U("routine:" + key)
        routine_id[key] = rid
        routine_links[key] = links
        routines.append((rid, name, note, active, t0, t0))
        orders = sorted(order for (_, order, link_active) in links if link_active)
        assert orders == list(range(1, len(orders) + 1)), "el order de los vinculos activos es 1..N: " + key
        assert all(order is None for (_, order, link_active) in links if not link_active), "un vinculo apagado no tiene order"
        for i, (ckey, order, link_active) in enumerate(links, start=1):
            routine_circuits.append((U("rc:{}:{}:{}".format(key, ckey, i)), rid, U("circuit:" + ckey), order, link_active, t0, t0))

    planifications, routine_asignations = [], []
    ra_id = {}  # (plan, semana, rutina) -> id de la Routine_Asignation
    plan_id, plan_duration = {}, {}
    for key, name, desc, n_routines, ptype, duration, active, items in _PLANS:
        assert len(name) <= 50 and len(ptype) <= 30
        pid = U("plan:" + key)
        plan_id[key] = pid
        plan_duration[key] = duration
        planifications.append((pid, name, desc, n_routines, ptype, duration, active, t0, t0))
        for week, rkey, order, ra_active in items:
            assert week >= 1 and (duration == 0 or week <= duration), "la semana cae dentro de la duracion"
            ra_id[(key, week, rkey)] = U("ra:{}:{}:{}".format(key, week, rkey))
            routine_asignations.append((ra_id[(key, week, rkey)], routine_id[rkey], pid, order, week, ra_active, t0, t0))

    user_planifications = []
    up_id, up_plan = {}, {}
    for key, email, coach_email, plan, note, start, end, active, created, updated in _USER_PLANS:
        assert note is None or len(note) <= 100
        d0, d1 = date.fromisoformat(start), date.fromisoformat(end)
        assert d0.weekday() == 0 and d1.weekday() == 6 and d1 > d0, "inicio lunes, fin domingo: " + key
        if plan_duration[plan] > 0:
            assert d1 == d0 + timedelta(days=7 * plan_duration[plan] - 1), "el fin por defecto es el domingo de la semana duration: " + key
        up_id[key] = U("up:" + key)
        up_plan[key] = plan
        user_planifications.append((up_id[key], U("user:" + email), U("user:" + coach_email), plan_id[plan], note, start, end, active, created, updated))

    individuals = []
    rau_id = {}  # (alumno, rutina, dia) -> id de la Routine_Asignation_User
    for email, rkey, on, created in _INDIVIDUALS:
        assert date.fromisoformat(on) and (email, rkey, on) not in rau_id
        rau_id[(email, rkey, on)] = U("rau:{}:{}:{}".format(email, rkey, on))
        individuals.append((rau_id[(email, rkey, on)], routine_id[rkey], U("user:" + email), on, created, created))

    def routine_items(rkey):
        """Los ejercicios vigentes de una rutina: activos y en un vinculo activo."""
        return [(ckey, ex) for (ckey, _, link_active) in routine_links[rkey] if link_active
                for (ex, ex_active) in circuit_items[ckey] if ex_active]

    def in_routine(rkey, ckey, ex):
        """El ejercicio es de la rutina: su circuito esta vinculado a ella (activo o no)."""
        return any(c == ckey for (c, _, _) in routine_links[rkey]) and any(e == ex for (e, _) in circuit_items[ckey])

    # ---- Ejecuciones de la via individual: Routine_Asign_Exercise_Finished ----
    individual_marks = []

    def mark_individual(email, rkey, on, ckey, ex, finished, note=None, lag=0):
        assert note is None or len(note) <= 100
        assert in_routine(rkey, ckey, ex), "el ejercicio es de la rutina"
        asign = rau_id[(email, rkey, on)]
        created = _at(_day(finished, lag))
        individual_marks.append((U("raef:{}:{}:{}".format(asign, ckey, ex)), asign, re_id[(ckey, ex)], note, finished, created, created))

    # Valentina hizo "Full Body" el 19/10. Las zancadas las hizo el 20 (finished_at distinto del dia
    # asignado), las dominadas las hizo el 19 pero las marco el 20 (en diferido), y el burpee es de un
    # circuito que despues se apago en la rutina: se sigue viendo porque lo completo
    v, v_day = "valentina.lopez@test.com", "2026-10-19"
    mark_individual(v, "full_body", v_day, "piernas_fuerza", "Sentadilla", "2026-10-19", "Subí 5 kg")
    mark_individual(v, "full_body", v_day, "piernas_fuerza", "Peso Muerto Rumano", "2026-10-19")
    mark_individual(v, "full_body", v_day, "piernas_fuerza", "Zancadas con Mancuernas", "2026-10-20", "Las hice al otro día")
    mark_individual(v, "full_body", v_day, "empuje", "Press de Banca Plano", "2026-10-19", "Cómodo con 40 kg")
    mark_individual(v, "full_body", v_day, "empuje", "Press Militar con Barra", "2026-10-19")
    mark_individual(v, "full_body", v_day, "traccion", "Remo con Barra Inclinado", "2026-10-19")
    mark_individual(v, "full_body", v_day, "traccion", "Dominadas Pronas", "2026-10-19", "Las marqué al día siguiente", lag=1)
    mark_individual(v, "full_body", v_day, "metabolico", "Burpee", "2026-10-19", "Lo hice al final")
    # Lucia: un metabolico suelto el sabado, a medias
    mark_individual("lucia.fernandez@test.com", "metabolico", "2026-10-24", "metabolico", "Burpee", "2026-10-24", "Muy duro, paré a los 4 minutos")
    # Mateo: "Full Body" completo (8 de 8)
    for ckey, ex in routine_items("full_body"):
        mark_individual("mateo.gimenez@test.com", "full_body", "2026-10-21", ckey, ex, "2026-10-21",
                        "Último set al fallo" if ex == "Press de Banca Plano" else None)

    # ---- Ejecuciones de la via del plan: Routine_Exercise_Finished ----
    plan_marks = []

    def mark_plan(upk, week, rkey, ckey, ex, finished, note=None, lag=0):
        assert note is None or len(note) <= 100
        assert in_routine(rkey, ckey, ex), "el ejercicio es de la rutina"
        created = _at(_day(finished, lag))
        plan_marks.append((U("ref:{}:{}:{}:{}:{}".format(upk, week, rkey, ckey, ex)), up_id[upk],
                           ra_id[(up_plan[upk], week, rkey)], re_id[(ckey, ex)], note, finished, created, created))

    # Lucia, semana 1 (19 al 25/10): Dia A entero el lunes; Dia B el miercoles (la plancha, marcada en
    # diferido al dia siguiente; los fondos ya estan dados de baja); Dia C el viernes, sin el core.
    # Semana 2: empezo el Dia A el lunes 26/10
    for ckey, ex in routine_items("dia_a"):
        mark_plan("lucia_fuerza", 1, "dia_a", ckey, ex, "2026-10-19",
                  {"Sentadilla": "Rodillas bien alineadas", "Prensa de Piernas 45 Grados": "Subí 10 kg"}.get(ex))
    for ckey, ex in [("empuje", "Press de Banca Plano"), ("empuje", "Press Militar con Barra"), ("empuje", "Fondos en Paralelas"),
                     ("core", "Plancha Abdominal"), ("core", "Elevación de Piernas Colgado"), ("core", "Crunch Abdominal")]:
        mark_plan("lucia_fuerza", 1, "dia_b", ckey, ex, "2026-10-21",
                  "Buen ritmo" if ex == "Press de Banca Plano" else None, lag=1 if ex == "Plancha Abdominal" else 0)
    for ckey, ex in routine_items("dia_c"):
        if ckey == "traccion":
            mark_plan("lucia_fuerza", 1, "dia_c", ckey, ex, "2026-10-23", "Llegué a 6 limpias" if ex == "Dominadas Pronas" else None)
    mark_plan("lucia_fuerza", 2, "dia_a", "piernas_fuerza", "Sentadilla", "2026-10-26")
    mark_plan("lucia_fuerza", 2, "dia_a", "piernas_fuerza", "Peso Muerto Rumano", "2026-10-26")

    # Sofia, plan quitado el 20/10: semana 1 (5 al 11/10) y semana 2 (12 al 18/10). "Metabolico" esta
    # quitada de la semana 2 del plan, pero lo que ella hizo ahi se conserva
    for ckey, ex in routine_items("dia_a"):
        mark_plan("sofia_fuerza", 1, "dia_a", ckey, ex, "2026-10-05", "Primera semana tras la lesión" if ex == "Sentadilla" else None)
    mark_plan("sofia_fuerza", 1, "dia_b", "empuje", "Press de Banca Plano", "2026-10-07")
    mark_plan("sofia_fuerza", 1, "dia_b", "empuje", "Press Militar con Barra", "2026-10-07")
    mark_plan("sofia_fuerza", 2, "dia_a", "piernas_fuerza", "Sentadilla", "2026-10-12")
    mark_plan("sofia_fuerza", 2, "metabolico", "metabolico", "Burpee", "2026-10-14", "Antes de que la quitaran")

    return {
        "circuits": circuits, "routines": routines, "routine_exercises": routine_exercises,
        "exercise_sets": exercise_sets, "routine_circuits": routine_circuits,
        "planifications": planifications, "routine_asignations": routine_asignations,
        "user_planifications": user_planifications, "individuals": individuals,
        "individual_marks": individual_marks, "plan_marks": plan_marks,
    }


_TRAINING = _build_training()
CIRCUITS = _TRAINING["circuits"]
ROUTINES = _TRAINING["routines"]
ROUTINE_EXERCISES = _TRAINING["routine_exercises"]
EXERCISE_SETS = _TRAINING["exercise_sets"]
ROUTINE_CIRCUITS = _TRAINING["routine_circuits"]
PLANIFICATIONS = _TRAINING["planifications"]
ROUTINE_ASIGNATIONS = _TRAINING["routine_asignations"]
USER_PLANIFICATIONS = _TRAINING["user_planifications"]
ROUTINE_ASIGNATION_USERS = _TRAINING["individuals"]
ROUTINE_ASIGN_EXERCISE_FINISHED = _TRAINING["individual_marks"]
ROUTINE_EXERCISE_FINISHED = _TRAINING["plan_marks"]

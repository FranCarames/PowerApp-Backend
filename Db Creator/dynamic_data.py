# -*- coding: utf-8 -*-
"""
Modulo de DATOS DINAMICOS (de prueba) - PowerApp
User, Coach, Membership, Membership_Payment, User_RM.

Incluye:
 - Los registros originales del seed.
 - 5 alumnos nuevos + 2 entrenadores nuevos (Charly Tauros, Roman Koski).
 - Historial de membresias (>4 meses) por alumno: mezcla de diaria/mensual/trimestral.
 - RMs con progresion realista para los ejercicios principales por alumno.

UUIDs deterministas (uuid5 con namespace fijo) => re-ejecutable estable.
"""
import uuid
from datetime import date, datetime, timedelta

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

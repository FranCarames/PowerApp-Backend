# -*- coding: utf-8 -*-
"""
Generador del bloque SQL de seed para PowerApp.
- Reutiliza los UUIDs de Muscle_Group y Muscle existentes (no duplica).
- Agrega grupos/musculos nuevos necesarios para boxeo/crossfit/olimpico/cardio.
- Genera +200 ejercicios con description, safety_tips, activation_tips reales.
- Genera Exercised_Muscle vinculando cada ejercicio a sus musculos.
Salida determinista: UUIDs derivados de un namespace fijo => re-ejecutable estable.
"""
import uuid

NS = uuid.UUID("11111111-2222-3333-4444-555555555555")

def U(label):
    """UUID determinista a partir de una etiqueta."""
    return str(uuid.uuid5(NS, label))

def esc(s):
    if s is None:
        return "NULL"
    return "'" + s.replace("'", "''") + "'"

TS = "'2026-06-14 12:00:00-03'"

# ------------------------------------------------------------------
# GRUPOS MUSCULARES
# Los 6 existentes conservan su UUID real del seed actual.
# ------------------------------------------------------------------
GROUPS = {
    "Pecho":     "e743e972-e2ad-44aa-b40b-264255ab4756",
    "Espalda":   "22e7080f-a4a9-457c-aeb5-1bff538eeb3d",
    "Hombros":   "b4715f19-6de4-4735-a2c1-882d76bde9ba",
    "Brazos":    "0120ab64-2ec0-4b14-8c9f-b2646c542749",
    "Abdomen":   "a56fe120-6687-4e98-98c5-a553654e1626",
    "Piernas":   "964d1770-1aac-4cf7-825c-780f96b17bb2",
}
# Grupos NUEVOS
NEW_GROUPS = {
    "Antebrazos":      U("group:Antebrazos"),
    "Cardio/Full Body": U("group:CardioFullBody"),
}
for k, v in NEW_GROUPS.items():
    GROUPS[k] = v

# ------------------------------------------------------------------
# MUSCULOS
# Los existentes conservan su UUID real. Clave corta -> (uuid, grupo, nombre, desc)
# ------------------------------------------------------------------
MUSCLES = {}  # key -> dict

def add_muscle(key, mid, group, name, desc, is_new=False):
    MUSCLES[key] = {"id": mid, "group": GROUPS[group], "name": name,
                    "desc": desc, "is_new": is_new}

# --- Existentes (UUID real del seed) ---
add_muscle("cuadriceps", "ccf521a5-c910-4e9f-a86b-b5c2e202d80c", "Piernas", "Cuádriceps Femoral",
    "El cuádriceps se encuentra en la parte frontal del muslo. Es el músculo extensor de la rodilla más poderoso del cuerpo. Ejercicios principales: sentadilla, leg extension y press de piernas.")
add_muscle("isquios", "a356fd7c-ae2a-4813-bab0-fe70c2515c78", "Piernas", "Isquiotibiales",
    "Los isquiotibiales están en la parte posterior del muslo. Flexionan la rodilla y extienden la cadera. Son clave para evitar lesiones y equilibrar las piernas. Ejercicios principales: peso muerto rumano, curl de piernas y good mornings.")
add_muscle("gluteo_mayor", "870a269b-205c-4f8d-83db-7b557e819744", "Piernas", "Glúteo Mayor",
    "El glúteo mayor es el músculo más grande de las nalgas, ubicado en la parte posterior de la pelvis. Extiende y rota externamente la cadera. Ejercicios principales: hip thrust, sentadilla profunda y zancadas.")
add_muscle("gluteo_medio", "95f831db-8dd3-4477-b02f-4f675de81550", "Piernas", "Glúteo Medio",
    "El glúteo medio se localiza en la parte lateral de la cadera. Abduce la pierna y estabiliza la pelvis durante la marcha. Ejercicios principales: abducciones laterales, clamshells y side leg raises.")
add_muscle("gemelos", "4533e84e-c8c3-45f5-b523-f84770a5bd53", "Piernas", "Gemelos",
    "Los gemelos se sitúan en la parte posterior de la pantorrilla. Son responsables de la flexión plantar del pie y la elevación del talón. Ejercicios principales: elevaciones de talones de pie y sentado.")
add_muscle("aductores", "4421797a-3d58-414d-9bcf-bc29e65610c9", "Piernas", "Aductores",
    "Los aductores se encuentran en la parte interna del muslo. Aducen la pierna hacia el centro del cuerpo. Mejoran la estabilidad y previenen lesiones en la ingle. Ejercicios principales: aducción en máquina, sumo squat y Copenhagen plank.")
add_muscle("pec_superior", "f3d5019d-8520-410d-a32e-cdc697a941e7", "Pecho", "Pectoral Superior",
    "El pectoral superior (porción clavicular) se encuentra en la parte alta del pecho, cerca de las clavículas. Es responsable de la flexión y elevación del brazo hacia adelante y arriba. Ejercicios principales: press de banca inclinado, press inclinado con mancuernas y cruces altas en polea.")
add_muscle("pec_medio", "a7174ace-b220-47d7-a2e1-ba8ed314ea83", "Pecho", "Pectoral Medio",
    "El pectoral medio (porción esternal) ocupa la parte central del pecho, desde el esternón. Es el principal en la aducción horizontal del brazo y genera el grosor del pecho. Ejercicios principales: press de banca plano, aperturas con mancuernas y flyes en máquina.")
add_muscle("pec_inferior", "79db9e7e-f398-456f-a4ca-dbf5d825acc7", "Pecho", "Pectoral Inferior",
    "El pectoral inferior (porción costal) se localiza en la parte baja del pecho, cerca de las costillas. Ayuda en la aducción y rotación interna del brazo desde abajo. Ejercicios principales: press de banca declinado, dips en paralelas y cruces bajas en polea.")
add_muscle("recto_abdominal", "e04e1799-a9f2-4d6c-9a2b-57490ebf3c0d", "Abdomen", "Recto Abdominal",
    "El recto abdominal se ubica en la parte central frontal del abdomen, desde el esternón hasta el pubis. Flexiona el tronco hacia adelante. Ejercicios principales: crunch abdominal, abdominales en máquina y plank.")
add_muscle("oblicuo", "a037faea-eaab-4dff-9a70-4c26926f53d9", "Abdomen", "Oblicuo Externo",
    "El oblicuo externo está en los laterales del abdomen. Permite la rotación y flexión lateral del tronco. Da definición a los costados. Ejercicios principales: russian twists, crunch oblicuo y side plank.")
add_muscle("transverso", "bc05efd7-33b9-4ae2-8e2d-f4bcd815eba3", "Abdomen", "Transverso Abdominal",
    "El transverso abdominal es el músculo más profundo del abdomen, ubicado debajo de los oblicuos. Estabiliza el core y comprime los órganos internos. Ejercicios principales: plank, vacuum abdominal y dead bug.")
add_muscle("delt_anterior", "4e8c9dcc-81f7-48d0-8967-fb40e6d73a56", "Hombros", "Deltoide Anterior",
    "El deltoide anterior está en la parte frontal del hombro. Participa en la elevación del brazo hacia adelante y la flexión del hombro. Ejercicios principales: press militar, elevaciones frontales y press Arnold.")
add_muscle("delt_lateral", "0ffbb9ff-6d66-4390-b6f4-aea09f259310", "Hombros", "Deltoide Lateral",
    "El deltoide lateral se localiza en la parte media del hombro, dando anchura y forma redondeada. Abduce el brazo hacia los lados. Ejercicios principales: elevaciones laterales con mancuernas o cables.")
add_muscle("delt_posterior", "eea89e6c-5ec1-4952-98ac-0d9ec46aa9ba", "Hombros", "Deltoide Posterior",
    "El deltoide posterior se encuentra en la parte trasera del hombro. Extiende y rota externamente el brazo. Ejercicios principales: elevaciones posteriores, face pulls y remo en polea alta.")
add_muscle("biceps_larga", "f78961a0-9a1d-47a0-a8f9-a5d82281beb4", "Brazos", "Bíceps Braquial Cabeza Larga",
    "La cabeza larga del bíceps se origina en la escápula y cruza la articulación del hombro. Flexiona el codo, supina el antebrazo y ayuda a estabilizar el hombro. Ejercicios principales: curl con barra EZ, curl predicador y curl martillo.")
add_muscle("biceps_corta", "27184cf2-42e1-44a2-b717-0cd44016ca59", "Brazos", "Bíceps Braquial Cabeza Corta",
    "La cabeza corta del bíceps se origina en la apófisis coracoides. Flexiona el codo y supina el antebrazo, aportando grosor y pico al bíceps. Ejercicios principales: curl concentrado, curl en banco inclinado y curl con mancuernas.")
add_muscle("braquial", "c80658ae-2f3e-4d0a-8e08-4277c9a1be7f", "Brazos", "Braquial",
    "El braquial está ubicado debajo del bíceps en la parte frontal del brazo. Es el principal flexor del codo, independientemente de la posición de la mano. Ejercicios principales: curl reverso, curl martillo y curl con barra.")
add_muscle("triceps_larga", "0fd38e3b-37f5-4c2e-8776-62bad3bb5223", "Brazos", "Tríceps Braquial Cabeza Larga",
    "La cabeza larga del tríceps se origina en la escápula y cruza el hombro. Extiende el codo y ayuda en la aducción del brazo. Ejercicios principales: press francés overhead, extensiones overhead y fondos en paralelas.")
add_muscle("triceps_lateral", "1861a8ee-257a-41ff-9175-5b5f043ed130", "Brazos", "Tríceps Braquial Cabeza Lateral",
    "La cabeza lateral del tríceps se encuentra en la parte externa del brazo posterior. Extiende el codo y da la forma característica de \"caballito\" al tríceps. Ejercicios principales: extensiones en polea con barra recta y kickbacks.")
add_muscle("triceps_medial", "b1ec2878-d3b1-4a9a-be8a-f3f62a6ce2bf", "Brazos", "Tríceps Braquial Cabeza Medial",
    "La cabeza medial del tríceps está en la parte interna y profunda del brazo. Extiende el codo y es activa en todos los movimientos de empuje. Ejercicios principales: extensiones en polea con cuerda y press close grip.")
add_muscle("flexores_antebrazo", "647e2468-c7cc-4182-a278-14ac0a359816", "Brazos", "Flexores del Antebrazo",
    "Los flexores del antebrazo se sitúan en la parte interna del antebrazo. Flexionan la muñeca y los dedos, mejorando el agarre en ejercicios pesados. Ejercicios principales: curl de muñeca, farmer carry y ejercicios de agarre específico.")
add_muscle("extensores_antebrazo", "5e37e2ed-dc4f-4536-b867-8652cf0d15c1", "Brazos", "Extensores del Antebrazo",
    "Los extensores del antebrazo se localizan en la parte externa del antebrazo. Extienden la muñeca y los dedos, equilibrando los flexores y previniendo lesiones. Ejercicios principales: extensiones de muñeca inversas y reverse curl.")
add_muscle("dorsal", "3c7b40cd-4071-48ae-adb0-e4913c3a7ff2", "Espalda", "Dorsal Ancho",
    "El dorsal ancho es el músculo más grande de la espalda, ubicado en la zona media y baja. Le da la clásica forma en V al torso y permite tirar los brazos hacia abajo y atrás. Ejercicios principales: dominadas, remo con barra y pulldown en polea.")
add_muscle("trapecio", "052db8da-fc86-450b-8d84-08d5b2b8c30f", "Espalda", "Trapecio",
    "El trapecio se sitúa en la parte superior de la espalda y cuello, formando una capa ancha. Eleva y retrae los hombros y omóplatos. Ejercicios principales: encogimientos de hombros, remo al mentón y face pulls.")
add_muscle("romboide", "4f0a7f41-c316-4899-bbef-39df5ebfc1eb", "Espalda", "Romboide Mayor",
    "Los romboides se encuentran entre los omóplatos en la espalda media. Retraen y estabilizan los omóplatos durante movimientos de tirón. Ejercicios principales: remo sentado, remo con mancuernas y face pulls.")
add_muscle("erectores", "acd5bbf5-9665-4449-af63-a4251b78e579", "Espalda", "Erectores de la Columna",
    "Los erectores de la columna recorren la espalda baja a ambos lados de la columna vertebral. Mantienen la postura erguida y extienden la espalda. Ejercicios principales: peso muerto, hiperextensiones y good mornings.")
add_muscle("redondo_mayor", "ae8352a9-2568-4a4e-9e18-e7757e0be9d7", "Espalda", "Redondo Mayor",
    "El redondo mayor se localiza en la parte superior de la espalda, junto al omóplato. Ayuda en la aducción, extensión y rotación interna del brazo. Es clave en movimientos de tirón. Ejercicios principales: remo con mancuernas, pullover y dominadas.")
add_muscle("serrato", "63644457-1a46-4562-89d9-46ac7077a03b", "Espalda", "Serrato Anterior",
    "El serrato anterior se encuentra en los laterales del tórax, debajo de la escápula. Protrae y rota la escápula hacia arriba, esencial para la estabilidad en empujes. Ejercicios principales: push-up plus, scapular wall slides y dips en paralelas.")

print("Musculos existentes cargados:", len(MUSCLES))

# --- Musculos NUEVOS ---
add_muscle("braquiorradial", U("musc:braquiorradial"), "Antebrazos", "Braquiorradial",
    "El braquiorradial recorre la parte externa del antebrazo desde el húmero hasta la muñeca. Flexiona el codo, sobre todo con agarre neutro o prono. Da volumen al antebrazo. Ejercicios principales: curl martillo, curl reverso y hammer curl en polea.", is_new=True)
add_muscle("agarre", U("musc:agarre"), "Antebrazos", "Musculatura de Agarre",
    "La musculatura de agarre engloba los flexores profundos de los dedos y la mano. Es determinante para sostener cargas pesadas, dominadas y levantamientos olímpicos. Ejercicios principales: farmer carry, dead hang y plate pinch.", is_new=True)
add_muscle("cardiovascular", U("musc:cardiovascular"), "Cardio/Full Body", "Sistema Cardiovascular",
    "El sistema cardiovascular abarca corazón, pulmones y vasos sanguíneos. Se entrena con trabajo metabólico de alta demanda que mejora la capacidad aeróbica y anaeróbica. Ejercicios principales: assault bike, remo ergómetro, burpees y comba.", is_new=True)
add_muscle("full_body", U("musc:full_body"), "Cardio/Full Body", "Cuerpo Completo",
    "El trabajo de cuerpo completo integra cadenas musculares en un solo patrón coordinado. Característico del crossfit y el levantamiento olímpico, demanda potencia, estabilidad y transferencia de fuerza. Ejercicios principales: clean and jerk, thruster y snatch.", is_new=True)
add_muscle("flexores_cadera", U("musc:flexores_cadera"), "Piernas", "Flexores de Cadera",
    "Los flexores de cadera (psoas ilíaco principalmente) conectan la columna lumbar con el fémur. Elevan el muslo hacia el tronco y estabilizan la pelvis. Ejercicios principales: elevaciones de rodillas, knees to elbows y marcha.", is_new=True)
add_muscle("cuello", U("musc:cuello"), "Cardio/Full Body", "Musculatura del Cuello",
    "La musculatura del cuello (esternocleidomastoideo y trapecio superior) estabiliza la cabeza ante impactos. Es clave en deportes de contacto para absorber golpes y reducir el riesgo de conmoción. Ejercicios principales: neck flexion, neck bridge y trabajo isométrico.", is_new=True)

print("Total musculos (con nuevos):", len(MUSCLES))

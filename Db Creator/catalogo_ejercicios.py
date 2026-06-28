# -*- coding: utf-8 -*-
"""
Catalogo de ejercicios - PowerApp

Lista unica EXERCISES con los 206 ejercicios, organizada por secciones
(disciplina). Cada ejercicio es una tupla:
    (nombre, [keys_musculo], description, safety_tips, activation_tips)
El primer musculo de la lista es el primario.
Las keys de musculo validas estan definidas en gen_seed.py.
"""

EXERCISES = []

# =============================================================
# POWERLIFTING Y FUERZA BASICA (SENTADILLA, PESO MUERTO, PRESS, REMO)
# =============================================================
EXERCISES += [
    (
        "Sentadilla con Barra Alta", ["cuadriceps", "gluteo_mayor", "isquios", "erectores"],
        "La sentadilla con barra alta apoya la barra sobre el trapecio superior y mantiene el torso más vertical. Descendé flexionando cadera y rodillas a la vez hasta romper la paralela, manteniendo los talones apoyados, y empujá el piso para subir. Enfatiza el cuádriceps por el rango de rodilla amplio.",
        "Mantené la columna neutra y el core firme durante todo el recorrido. No dejes que las rodillas colapsen hacia adentro y evitá redondear la zona lumbar en el fondo.",
        "Antes de la serie hacé movilidad de tobillo y cadera, y activá glúteos con un par de sentadillas con banda. Buscá tensión en todo el cuerpo antes de descender.",
    ),
    (
        "Sentadilla Barra Baja", ["cuadriceps", "gluteo_mayor", "isquios", "erectores"],
        "La sentadilla barra baja coloca la barra sobre el deltoides posterior, generando un torso más inclinado y mayor participación de cadera e isquios. Es la variante preferida en powerlifting por permitir mover más carga. Descendé controlando la cadera hacia atrás y subí empujando con toda la pierna.",
        "Respirá y bracea el core antes de bajar como si tu vida dependiera de ello. Cuidá que la barra no se deslice por la espalda y mantené las muñecas neutras.",
        "Apretá las nalgas y retraé las escápulas para crear una repisa estable para la barra. Activá la espalda alta antes de cargar.",
    ),
    (
        "Peso Muerto Convencional", ["erectores", "gluteo_mayor", "isquios", "dorsal", "trapecio"],
        "El peso muerto convencional levanta la barra desde el suelo hasta la extensión completa de cadera. Colocá los pies a la anchura de cadera, agarrá la barra fuera de las piernas y empujá el piso manteniendo la espalda recta. Es el ejercicio rey para la cadena posterior.",
        "Mantené la barra pegada al cuerpo y la columna neutra en todo momento. Nunca tires con la espalda redondeada ni hiperextiendas el lumbar al bloquear arriba.",
        "Generá tensión tirando ligeramente de la barra antes de despegarla del suelo. Activá dorsales llevando la barra contra los muslos.",
    ),
    (
        "Peso Muerto Sumo", ["gluteo_mayor", "cuadriceps", "aductores", "erectores", "trapecio"],
        "El peso muerto sumo usa una postura ancha con los pies hacia afuera y las manos por dentro de las piernas. Reduce el rango de recorrido y la demanda lumbar, aumentando la participación de glúteos y aductores. Empujá las rodillas hacia afuera mientras extendés la cadera.",
        "Mantené el pecho alto y la espalda neutra durante el despegue. Evitá que las caderas suban antes que el pecho.",
        "Abrí las rodillas en línea con los pies y traccioná los dorsales antes de despegar. Activá aductores tomando posición ancha.",
    ),
    (
        "Press de Banca Plano", ["pec_medio", "delt_anterior", "triceps_lateral", "triceps_medial"],
        "El press de banca plano empuja la barra desde el pecho hasta la extensión de los codos acostado sobre un banco. Bajá la barra controlada hasta tocar la línea del pezón y empujá hacia arriba y ligeramente atrás. Es el principal ejercicio de fuerza de empuje horizontal.",
        "Mantené las escápulas retraídas y los pies firmes en el piso. Nunca rebotes la barra en el pecho ni dejes que los codos se abran en exceso.",
        "Retraé y deprimí las escápulas para crear una base estable. Apretá la barra fuerte para activar tríceps y pecho.",
    ),
    (
        "Press de Banca Inclinado", ["pec_superior", "delt_anterior", "triceps_lateral"],
        "El press inclinado se realiza con el banco a 30-45 grados, enfatizando la porción clavicular del pectoral. Bajá la barra hacia la parte alta del pecho y empujá hasta extender los codos. Construye la parte superior del pecho.",
        "No subas demasiado el ángulo del banco para no transferir el trabajo al hombro. Mantené las muñecas alineadas con los antebrazos.",
        "Activá el pectoral superior haciendo un par de aperturas inclinadas livianas. Fijá las escápulas antes de empezar.",
    ),
    (
        "Press Militar con Barra", ["delt_anterior", "delt_lateral", "triceps_larga", "trapecio"],
        "El press militar empuja la barra desde la altura de los hombros hasta encima de la cabeza, de pie. Mantené el core y los glúteos firmes para no arquear la espalda y empujá la cabeza levemente hacia adelante al pasar la barra. Es el rey del empuje vertical.",
        "Evitá hiperextender la zona lumbar; mantené el abdomen y los glúteos contraídos. No dejes la barra adelantada al bloquear.",
        "Activá el core y el glúteo antes de empujar. Hacé unas elevaciones frontales livianas para preparar el deltoides.",
    ),
    (
        "Remo con Barra Pendlay", ["dorsal", "romboide", "trapecio", "delt_posterior", "biceps_larga"],
        "El remo Pendlay parte de la barra en el suelo en cada repetición, con el torso paralelo al piso. Tirá explosivo hacia el abdomen bajo y bajá controlando. Desarrolla potencia y grosor en la espalda media.",
        "Mantené la espalda completamente neutra y paralela al suelo; no uses impulso de cadera excesivo. Cuidá la lumbar en la posición inclinada.",
        "Retraé las escápulas al iniciar el tirón y activá dorsales pensando en llevar los codos atrás.",
    ),
    (
        "Remo con Barra Inclinado", ["dorsal", "romboide", "trapecio", "biceps_larga", "delt_posterior"],
        "El remo con barra inclinado mantiene el torso a unos 45 grados y tira la barra hacia el abdomen de forma continua. Trabaja el grosor de la espalda permitiendo cargas altas. Bajá controlando el estiramiento del dorsal.",
        "Mantené la espalda neutra y evitá usar demasiado balanceo de cadera. No redondees la lumbar bajo carga.",
        "Activá el dorsal iniciando el tirón desde el codo, no desde la mano. Retraé escápulas antes de cada repetición.",
    ),
    (
        "Dominadas Pronas", ["dorsal", "redondo_mayor", "romboide", "biceps_larga", "braquial"],
        "Las dominadas pronas se ejecutan colgado de la barra con agarre prono más ancho que los hombros, traccionando hasta superar la barbilla. Desarrollan la amplitud del dorsal y la fuerza de tirón vertical. Bajá hasta la extensión completa controlando.",
        "Evitá los tirones bruscos y el balanceo descontrolado. No bajes de golpe para proteger los hombros y codos.",
        "Deprimí las escápulas antes de tirar e iniciá el movimiento llevando los codos hacia las costillas.",
    ),
    (
        "Dominadas Supinas", ["dorsal", "biceps_larga", "biceps_corta", "braquial"],
        "Las dominadas supinas usan agarre supino a la anchura de hombros, aumentando la participación del bíceps junto al dorsal. Traccioná hasta llevar el pecho a la barra y bajá controlado hasta extender los brazos.",
        "No fuerces los codos en el bloqueo inferior; mantené algo de tensión. Evitá el kipping si buscás trabajo de fuerza puro.",
        "Activá dorsales y bíceps imaginando que doblás la barra. Mantené el core firme para no oscilar.",
    ),
    (
        "Hip Thrust con Barra", ["gluteo_mayor", "isquios", "cuadriceps"],
        "El hip thrust apoya la espalda alta en un banco y eleva la cadera con una barra sobre la pelvis hasta la extensión completa. Es el ejercicio con mayor activación directa del glúteo mayor. Apretá fuerte arriba y bajá controlando.",
        "Usá una almohadilla en la barra y mantené el mentón metido para no hiperextender la lumbar. Pará la subida en la línea neutra de cadera.",
        "Activá los glúteos con un par de puentes sin peso. Pensá en empujar el piso con los talones.",
    ),
    (
        "Zancadas con Mancuernas", ["cuadriceps", "gluteo_mayor", "isquios", "aductores"],
        "Las zancadas dan un paso adelante flexionando ambas rodillas hasta que la trasera casi toca el piso, y vuelven empujando con la pierna delantera. Desarrollan fuerza unilateral y equilibrio. Mantené el torso erguido.",
        "Controlá que la rodilla delantera no sobrepase excesivamente la punta del pie. Mantené el equilibrio sin dejar caer la cadera.",
        "Activá glúteo medio para estabilizar la pelvis. Hacé unos pasos sin peso para preparar el patrón.",
    ),
    (
        "Prensa de Piernas 45 Grados", ["cuadriceps", "gluteo_mayor", "isquios"],
        "La prensa a 45 grados empuja una plataforma cargada con los pies, flexionando y extendiendo las rodillas. Permite cargar mucho peso con menor demanda de estabilización. Bajá hasta unos 90 grados y empujá sin bloquear de golpe.",
        "No bloquees las rodillas con golpe seco al final del recorrido. Mantené la zona lumbar pegada al respaldo.",
        "Activá cuádriceps y glúteos colocando los pies a la altura adecuada. Empezá con peso moderado para calibrar.",
    ),
    (
        "Curl de Piernas Tumbado", ["isquios", "gemelos"],
        "El curl femoral tumbado flexiona las rodillas llevando los talones hacia los glúteos contra la resistencia de la máquina. Aísla los isquiotibiales. Subí controlando y bajá resistiendo la carga.",
        "Evitá levantar la cadera de la camilla para no usar impulso. No uses recorridos parciales bruscos.",
        "Activá isquios con un par de repeticiones livianas. Pensá en llevar el talón al glúteo de forma controlada.",
    ),
    (
        "Extensión de Cuádriceps", ["cuadriceps"],
        "La extensión de cuádriceps en máquina extiende las rodillas contra una almohadilla cargada, aislando el cuádriceps. Subí hasta casi bloquear y bajá controlado. Útil para volumen y rehabilitación.",
        "Evitá el bloqueo brusco y los rebotes en la posición baja. Ajustá el respaldo para alinear la rodilla con el eje.",
        "Apretá el cuádriceps en la parte alta un segundo. Activá con repeticiones livianas previas.",
    ),
    (
        "Elevación de Talones de Pie", ["gemelos"],
        "La elevación de talones de pie eleva el cuerpo sobre las puntas de los pies contra resistencia, trabajando los gemelos. Subí lo máximo posible y bajá estirando bien la pantorrilla. Usá rango completo.",
        "Controlá el descenso para no rebotar con el tendón de Aquiles. No uses impulso de rodilla.",
        "Activá la pantorrilla con un par de elevaciones lentas. Buscá la máxima contracción arriba.",
    ),
    (
        "Good Morning con Barra", ["isquios", "erectores", "gluteo_mayor"],
        "El good morning coloca la barra en la espalda alta e inclina el torso hacia adelante con piernas casi rectas, hasta sentir el estiramiento de los isquios, y vuelve extendiendo la cadera. Fortalece la cadena posterior.",
        "Usá cargas conservadoras y mantené la columna neutra siempre. No bajes más allá de lo que permita tu movilidad sin redondear.",
        "Activá isquios y erectores con un par de repeticiones sin peso. Llevá la cadera atrás controlando.",
    ),
    (
        "Peso Muerto Rumano", ["isquios", "gluteo_mayor", "erectores"],
        "El peso muerto rumano parte de pie y baja la barra deslizándola por los muslos con piernas casi rectas hasta media tibia, estirando los isquios, y vuelve extendiendo la cadera. Es referencia para la cadena posterior.",
        "Mantené la barra pegada al cuerpo y la espalda neutra. No bajes más allá de tu rango sin perder la curvatura lumbar.",
        "Llevá la cadera hacia atrás antes de bajar. Activá glúteos e isquios con el patrón de bisagra.",
    ),
]

# =============================================================
# HIPERTROFIA DE TORSO, HOMBROS, BRAZOS Y ABDOMEN
# =============================================================
EXERCISES += [
    (
        "Press de Banca con Mancuernas", ["pec_medio", "delt_anterior", "triceps_lateral"],
        "El press con mancuernas permite un rango de movimiento mayor que la barra y trabaja cada lado de forma independiente. Bajá las mancuernas hasta la línea del pecho y empujá juntándolas levemente arriba. Mejora la simetría y el control.",
        "Controlá la fase excéntrica para no sobreestirar el hombro. Mantené las muñecas firmes y alineadas.",
        "Retraé las escápulas y fijá la espalda al banco. Activá el pectoral con un par de aperturas livianas.",
    ),
    (
        "Aperturas con Mancuernas", ["pec_medio", "pec_superior", "delt_anterior"],
        "Las aperturas abren los brazos en arco con los codos ligeramente flexionados, estirando el pectoral, y los cierran arriba sin chocar las mancuernas. Aíslan el pecho enfatizando el estiramiento. Movimiento controlado.",
        "No bajes en exceso para no estresar la cápsula del hombro. Mantené los codos semiflexionados y fijos.",
        "Pensá en abrazar un árbol al cerrar. Activá el pectoral con repeticiones lentas.",
    ),
    (
        "Fondos en Paralelas", ["pec_inferior", "triceps_lateral", "delt_anterior", "serrato"],
        "Los fondos en paralelas sostienen el cuerpo entre dos barras y descienden flexionando los codos hasta el estiramiento del pecho, luego empujan hasta la extensión. Inclinar el torso enfatiza el pectoral inferior.",
        "No bajes más allá de la movilidad cómoda del hombro. Mantené las escápulas controladas para evitar lesiones.",
        "Deprimí las escápulas antes de bajar. Activá pecho y tríceps con un par de repeticiones parciales.",
    ),
    (
        "Cruces en Polea", ["pec_medio", "pec_inferior"],
        "Los cruces en polea juntan las manos al frente desde dos poleas, manteniendo tensión constante sobre el pectoral en todo el rango. Variá la altura de las poleas para enfatizar distintas porciones del pecho.",
        "Mantené una ligera flexión de codo constante. Controlá la vuelta para no perder tensión bruscamente.",
        "Apretá el pecho un segundo al juntar las manos. Activá con un par de repeticiones livianas.",
    ),
    (
        "Press en Máquina de Pecho", ["pec_medio", "delt_anterior", "triceps_lateral"],
        "El press en máquina empuja dos agarres hacia adelante siguiendo una trayectoria fija, ideal para enfocar el pecho con seguridad. Permite acercarse al fallo con menor riesgo. Controlá el regreso.",
        "Ajustá el asiento para que los agarres queden a la altura del pecho. No bloquees los codos de golpe.",
        "Retraé las escápulas contra el respaldo. Apretá el pecho al final del empuje.",
    ),
    (
        "Jalón al Pecho en Polea", ["dorsal", "redondo_mayor", "romboide", "biceps_larga"],
        "El jalón al pecho tira de una barra desde arriba hacia la parte alta del pecho, replicando el patrón de dominada con carga regulable. Desarrolla la amplitud del dorsal. Controlá la subida sin soltar la tensión.",
        "Evitá inclinarte demasiado hacia atrás o usar impulso. No lleves la barra detrás de la nuca.",
        "Deprimí las escápulas antes de jalar e iniciá el movimiento desde los codos.",
    ),
    (
        "Remo Sentado en Polea", ["dorsal", "romboide", "trapecio", "delt_posterior", "biceps_larga"],
        "El remo sentado en polea baja tira del agarre hacia el abdomen manteniendo el torso erguido, trabajando el grosor de la espalda media. Estirá bien adelante y retraé las escápulas al traccionar.",
        "No uses balanceo de torso para mover la carga. Mantené la lumbar neutra durante todo el recorrido.",
        "Retraé las escápulas al iniciar el tirón. Activá dorsales pensando en llevar los codos atrás.",
    ),
    (
        "Remo con Mancuerna a una Mano", ["dorsal", "redondo_mayor", "romboide", "biceps_larga"],
        "El remo a una mano apoya rodilla y mano en un banco y tira la mancuerna hacia la cadera, permitiendo un gran rango y trabajo unilateral. Estirá abajo y llevá el codo arriba y atrás.",
        "Mantené la espalda paralela al piso y neutra. No rotes el torso para subir más peso.",
        "Activá el dorsal iniciando desde el codo. Retraé la escápula en cada repetición.",
    ),
    (
        "Pullover con Mancuerna", ["dorsal", "serrato", "pec_superior"],
        "El pullover lleva una mancuerna desde encima del pecho hacia atrás de la cabeza en arco, estirando el dorsal y el serrato, y vuelve. Trabaja la caja torácica y la expansión del dorsal.",
        "Controlá el rango hacia atrás según tu movilidad de hombro. No hiperextiendas la lumbar.",
        "Activá dorsal y serrato con un par de repeticiones livianas. Mantené el core firme.",
    ),
    (
        "Encogimientos con Barra", ["trapecio"],
        "Los encogimientos elevan los hombros hacia las orejas sosteniendo una barra, aislando el trapecio superior. Subí lo máximo posible y bajá estirando. No rotes los hombros.",
        "Evitá rotar los hombros en círculos para no estresar la articulación. Mantené la cabeza neutra.",
        "Apretá el trapecio un segundo arriba. Activá con un par de repeticiones controladas.",
    ),
    (
        "Hiperextensiones Lumbares", ["erectores", "gluteo_mayor", "isquios"],
        "Las hiperextensiones en banco romano flexionan y extienden el torso desde la cadera, fortaleciendo la zona lumbar y la cadena posterior. Subí hasta la línea neutra sin hiperextender.",
        "No hiperextiendas la columna al subir; pará en la línea recta. Controlá el descenso.",
        "Activá glúteos y erectores con repeticiones sin peso. Mantené el cuello alineado.",
    ),
    (
        "Elevaciones Laterales", ["delt_lateral", "trapecio"],
        "Las elevaciones laterales suben las mancuernas hacia los lados hasta la altura de los hombros con codos ligeramente flexionados, aislando el deltoides lateral. Bajá controlando sin impulso.",
        "Evitá usar impulso de cadera y encoger excesivamente el trapecio. No subas por encima de la línea del hombro.",
        "Activá el deltoide lateral con un par de repeticiones livianas. Liderá el movimiento con los codos.",
    ),
    (
        "Press Arnold", ["delt_anterior", "delt_lateral", "triceps_larga"],
        "El press Arnold parte con las palmas hacia el cuerpo y rota los antebrazos mientras empuja las mancuernas arriba, trabajando varias porciones del deltoides. Bajá rotando de regreso.",
        "Controlá la rotación para no forzar el manguito rotador. Mantené el core firme sin arquear la lumbar.",
        "Activá deltoides con elevaciones livianas. Coordiná la rotación con la subida.",
    ),
    (
        "Elevaciones Frontales", ["delt_anterior"],
        "Las elevaciones frontales suben la mancuerna o disco al frente hasta la altura de los ojos, aislando el deltoides anterior. Bajá controlado sin balanceo.",
        "No uses impulso de cadera ni subas por encima de la cabeza. Mantené el core firme.",
        "Activá el deltoide anterior con repeticiones lentas. Mantené una ligera flexión de codo.",
    ),
    (
        "Face Pull en Polea", ["delt_posterior", "romboide", "trapecio"],
        "El face pull tira de una cuerda hacia la cara separando las manos al final, fortaleciendo el deltoides posterior y los rotadores externos. Excelente para la salud del hombro y la postura.",
        "Usá carga moderada y priorizá la técnica sobre el peso. Mantené los codos altos.",
        "Activá deltoides posterior y romboides. Pensá en separar la cuerda hacia las orejas.",
    ),
    (
        "Press Militar con Mancuernas Sentado", ["delt_anterior", "delt_lateral", "triceps_larga"],
        "El press de hombros sentado con mancuernas empuja las cargas desde la altura de los hombros hasta arriba con respaldo, reduciendo el impulso. Bajá controlando hasta la línea de las orejas.",
        "No arquees la espalda contra el respaldo. Mantené las muñecas alineadas con los antebrazos.",
        "Activá deltoides y core. Retraé ligeramente las escápulas para estabilizar.",
    ),
    (
        "Curl con Barra", ["biceps_larga", "biceps_corta", "braquial"],
        "El curl con barra flexiona los codos llevando la barra hacia los hombros con los codos fijos a los costados, aislando el bíceps. Bajá controlando hasta extender los brazos. Es básico para el volumen de bíceps.",
        "No balancees el torso para subir la barra. Mantené los codos quietos a los lados.",
        "Apretá el bíceps arriba un segundo. Activá con un par de repeticiones livianas.",
    ),
    (
        "Curl Martillo", ["braquiorradial", "braquial", "biceps_larga"],
        "El curl martillo flexiona los codos con agarre neutro (palmas enfrentadas), enfatizando el braquiorradial y el braquial además del bíceps. Da grosor al antebrazo y brazo. Controlá la bajada.",
        "Evitá el balanceo de hombros y cadera. Mantené las muñecas firmes en neutro.",
        "Activá braquiorradial y braquial. Subí sin rotar la muñeca.",
    ),
    (
        "Curl Concentrado", ["biceps_corta", "biceps_larga"],
        "El curl concentrado apoya el codo en el muslo sentado y flexiona el brazo aislando el bíceps con máxima contracción. Ideal para el pico del bíceps. Bajá controlando el estiramiento.",
        "No uses impulso del hombro; mantené el codo fijo en el muslo. Controlá toda la fase negativa.",
        "Apretá fuerte en la contracción máxima. Activá con repeticiones lentas.",
    ),
    (
        "Press Francés", ["triceps_larga", "triceps_lateral", "triceps_medial"],
        "El press francés acostado baja la barra EZ hacia la frente flexionando solo los codos y la extiende de nuevo, aislando el tríceps con énfasis en la cabeza larga. Mantené los codos apuntando arriba.",
        "Controlá la barra cerca de la frente sin golpearla. Mantené los codos fijos sin abrirlos.",
        "Activá el tríceps con un par de extensiones livianas. Estabilizá los codos antes de empezar.",
    ),
    (
        "Extensión de Tríceps en Polea con Cuerda", ["triceps_lateral", "triceps_medial", "triceps_larga"],
        "La extensión en polea con cuerda empuja hacia abajo separando los extremos al final, extendiendo los codos y aislando el tríceps. Mantené los codos pegados al cuerpo durante todo el recorrido.",
        "No abras los codos ni uses el peso del cuerpo. Mantené el torso estable.",
        "Apretá el tríceps separando la cuerda abajo. Activá con repeticiones controladas.",
    ),
    (
        "Curl de Muñeca con Barra", ["flexores_antebrazo", "agarre"],
        "El curl de muñeca apoya los antebrazos en un banco y flexiona las muñecas elevando la barra, aislando los flexores del antebrazo y mejorando el agarre. Rango corto y controlado.",
        "Usá cargas moderadas para no estresar las muñecas. Controlá el descenso completo.",
        "Activá los flexores con un par de repeticiones livianas. Buscá el rango completo de muñeca.",
    ),
    (
        "Curl Reverso con Barra", ["braquiorradial", "extensores_antebrazo", "braquial"],
        "El curl reverso flexiona los codos con agarre prono, enfatizando el braquiorradial y los extensores del antebrazo. Fortalece la parte superior del antebrazo y mejora el agarre. Controlá la bajada.",
        "Mantené las muñecas firmes en pronación sin dejarlas caer. No uses balanceo.",
        "Activá braquiorradial y extensores. Subí lento manteniendo la pronación.",
    ),
    (
        "Plancha Abdominal", ["transverso", "recto_abdominal", "oblicuo"],
        "La plancha sostiene el cuerpo en línea recta apoyado en antebrazos y puntas de los pies, activando isométricamente todo el core con énfasis en el transverso. Mantené la posición sin dejar caer la cadera.",
        "No dejes que la cadera se hunda ni se eleve en exceso. Mantené el cuello alineado con la columna.",
        "Activá el transverso metiendo el ombligo hacia adentro. Apretá glúteos para estabilizar.",
    ),
    (
        "Crunch Abdominal", ["recto_abdominal"],
        "El crunch flexiona el tronco elevando los hombros del suelo con las rodillas flexionadas, aislando el recto abdominal en su porción superior. Subí exhalando y bajá controlando.",
        "No tires del cuello con las manos. Mantené la zona lumbar en contacto con el piso.",
        "Activá el recto abdominal exhalando al subir. Concentrá el movimiento en el abdomen.",
    ),
    (
        "Elevación de Piernas Colgado", ["recto_abdominal", "flexores_cadera", "oblicuo"],
        "La elevación de piernas colgado de la barra eleva las piernas rectas o las rodillas hacia el pecho, trabajando el abdomen inferior y los flexores de cadera. Controlá la bajada sin balanceo.",
        "Evitá el balanceo del cuerpo para usar impulso. Controlá tanto la subida como la bajada.",
        "Activá el abdomen inferior antes de elevar. Deprimí las escápulas para estabilizar el cuerpo.",
    ),
    (
        "Russian Twist", ["oblicuo", "recto_abdominal"],
        "El russian twist sentado con el torso inclinado rota el tronco de lado a lado, opcionalmente con peso, trabajando los oblicuos. Mantené el core firme y los pies elevados para mayor dificultad.",
        "Controlá la rotación desde el tronco, no solo con los brazos. Mantené la espalda recta sin redondear.",
        "Activá los oblicuos rotando de forma controlada. Mantené el abdomen contraído.",
    ),
    (
        "Rueda Abdominal", ["recto_abdominal", "transverso", "dorsal"],
        "La rueda abdominal rueda hacia adelante extendiendo el cuerpo desde las rodillas y vuelve contrayendo el core, demandando gran fuerza del abdomen y antirotación. Avanzá solo hasta donde controles.",
        "No dejes que la lumbar se arquee al extender. Avanzá progresivamente en el rango.",
        "Activá el core antes de rodar. Mantené la cadera ligeramente metida.",
    ),
    (
        "Dead Bug", ["transverso", "recto_abdominal", "flexores_cadera"],
        "El dead bug acostado extiende brazo y pierna opuestos manteniendo la zona lumbar pegada al suelo, entrenando la estabilidad del core. Movimiento lento y controlado con respiración coordinada.",
        "Mantené la lumbar pegada al piso en todo momento. No extiendas más allá de lo que puedas controlar.",
        "Activá el transverso antes de mover las extremidades. Coordiná la respiración con el movimiento.",
    ),
]

# =============================================================
# LEVANTAMIENTO OLIMPICO Y CROSSFIT / CONDICIONAMIENTO METABOLICO
# =============================================================
EXERCISES += [
    (
        "Arranque (Snatch)", ["full_body", "trapecio", "gluteo_mayor", "cuadriceps", "delt_lateral", "erectores"],
        "El arranque levanta la barra desde el suelo hasta encima de la cabeza en un solo movimiento explosivo con agarre ancho. Combina un tirón potente, una recepción en sentadilla profunda y la estabilización overhead. Es el levantamiento olímpico más técnico.",
        "Dominá la técnica con carga ligera antes de añadir peso. Mantené la barra cerca del cuerpo y la columna neutra en el tirón.",
        "Movilizá hombros, muñecas y tobillos a fondo. Activá la cadena posterior con tirones livianos antes de la serie.",
    ),
    (
        "Cargada (Clean)", ["full_body", "trapecio", "gluteo_mayor", "cuadriceps", "erectores"],
        "La cargada lleva la barra del suelo a los hombros en posición de recepción frontal, mediante un tirón explosivo y una sentadilla. Es la base del clean and jerk y desarrolla potencia de cadera.",
        "Mantené la barra pegada al cuerpo durante el tirón. Recibí con los codos altos y la columna neutra.",
        "Activá glúteos e isquios con tirones desde la rodilla. Movilizá muñecas para la recepción frontal.",
    ),
    (
        "Envión (Jerk)", ["full_body", "delt_anterior", "triceps_larga", "cuadriceps", "gluteo_mayor"],
        "El envión impulsa la barra desde los hombros hasta overhead mediante un empuje de piernas y una recepción con un pie adelante (split jerk). Permite mover más peso que un press estricto.",
        "Coordiná el impulso de piernas con el empuje de brazos. Estabilizá la barra sobre la cabeza con el core firme.",
        "Activá piernas y hombros con dip-drives livianos. Practicá el split sin carga primero.",
    ),
    (
        "Clean and Jerk", ["full_body", "trapecio", "gluteo_mayor", "cuadriceps", "delt_anterior", "erectores"],
        "El clean and jerk combina la cargada y el envión: lleva la barra del suelo a los hombros y luego overhead. Es uno de los dos levantamientos de competición olímpica y demanda potencia y técnica completas.",
        "Trabajá cada fase por separado antes de unirlas. Mantené la columna neutra y la barra cerca del cuerpo.",
        "Movilizá todo el cuerpo y activá la cadena posterior. Hacé repeticiones técnicas con barra vacía.",
    ),
    (
        "Sentadilla Frontal", ["cuadriceps", "gluteo_mayor", "erectores", "recto_abdominal"],
        "La sentadilla frontal apoya la barra sobre los deltoides anteriores con los codos altos, manteniendo el torso muy vertical. Enfatiza el cuádriceps y el core, y transfiere a la recepción del clean.",
        "Mantené los codos altos para que la barra no caiga. Cuidá la muñeca y la columna neutra.",
        "Movilizá muñecas y dorsal para la posición de rack. Activá el core antes de descender.",
    ),
    (
        "Tirón de Arranque (Snatch Pull)", ["trapecio", "erectores", "gluteo_mayor", "isquios"],
        "El tirón de arranque ejecuta la primera y segunda fase del snatch sin la recepción, enfatizando la potencia del tirón y la extensión de cadera con agarre ancho. Acelerá fuerte en la extensión.",
        "Mantené la espalda neutra y la barra cerca del cuerpo. No redondees la lumbar en el despegue.",
        "Activá la cadena posterior con tirones desde la rodilla. Generá tensión antes de despegar.",
    ),
    (
        "Power Clean", ["full_body", "trapecio", "gluteo_mayor", "cuadriceps", "erectores"],
        "El power clean recibe la barra en los hombros en una posición de cuarto de sentadilla, sin bajar a la sentadilla completa. Desarrolla potencia explosiva y es muy usado en preparación deportiva.",
        "Recibí con los codos rápidos y altos. Mantené la columna neutra durante el tirón explosivo.",
        "Activá glúteos e isquios con tirones livianos. Practicá la recepción alta con barra vacía.",
    ),
    (
        "Overhead Squat", ["cuadriceps", "gluteo_mayor", "delt_lateral", "recto_abdominal", "erectores"],
        "La sentadilla overhead sostiene la barra con los brazos extendidos sobre la cabeza mientras se realiza una sentadilla completa. Demanda movilidad y estabilidad extremas de hombro, cadera y tobillo.",
        "Requiere buena movilidad; empezá con un palo o barra vacía. Mantené la barra estable sobre la línea media.",
        "Movilizá hombros, tobillos y cadera a fondo. Activá el core y los estabilizadores del hombro.",
    ),
    (
        "Push Press", ["delt_anterior", "triceps_larga", "cuadriceps", "gluteo_mayor"],
        "El push press empuja la barra desde los hombros hasta overhead usando un impulso inicial de piernas. Permite cargar más que un press estricto y entrena la transferencia de fuerza pierna-brazo.",
        "Coordiná el dip de piernas con el empuje. No arquees la lumbar al bloquear arriba.",
        "Activá piernas y hombros con dip-drives livianos. Mantené el core firme antes de impulsar.",
    ),
    (
        "Thruster", ["full_body", "cuadriceps", "gluteo_mayor", "delt_anterior", "triceps_larga"],
        "El thruster combina una sentadilla frontal con un push press en un movimiento fluido: desde el fondo de la sentadilla, la extensión de cadera impulsa la barra overhead. Es uno de los movimientos más demandantes del crossfit.",
        "Mantené los codos altos en la sentadilla y el core firme. No arquees la lumbar al empujar arriba.",
        "Activá piernas y hombros con repeticiones livianas. Movilizá muñecas para el rack frontal.",
    ),
    (
        "Burpee", ["full_body", "cardiovascular", "pec_medio", "cuadriceps"],
        "El burpee baja a posición de plancha, hace una flexión, recoge los pies y salta con las manos arriba. Es un ejercicio de cuerpo completo y alta demanda cardiovascular, pilar del acondicionamiento metabólico.",
        "Cuidá la zona lumbar al caer en plancha; bajá controlado. Amortiguá la recepción del salto con las rodillas.",
        "Activá el core y entrá en calor con saltos suaves. Mantené un ritmo sostenible.",
    ),
    (
        "Wall Ball", ["full_body", "cuadriceps", "gluteo_mayor", "delt_anterior", "cardiovascular"],
        "El wall ball realiza una sentadilla y lanza un balón medicinal a un objetivo en la pared, recibiéndolo y encadenando repeticiones. Combina potencia de piernas, empuje y resistencia cardiovascular.",
        "Mantené la espalda neutra al recibir el balón. Atrapalo con los brazos amortiguando hacia la próxima sentadilla.",
        "Activá piernas y hombros con sentadillas y empujes livianos. Calibrá la distancia al objetivo.",
    ),
    (
        "Box Jump", ["cuadriceps", "gluteo_mayor", "gemelos", "cardiovascular"],
        "El box jump salta sobre un cajón desde el suelo extendiendo cadera, rodilla y tobillo, y baja controlado. Desarrolla potencia explosiva del tren inferior y se usa en circuitos metabólicos.",
        "Bajá del cajón con control, idealmente paso a paso, para cuidar el tendón de Aquiles. Aterrizá con rodillas flexionadas.",
        "Activá glúteos y cuádriceps con saltos suaves. Calibrá la altura del cajón a tu nivel.",
    ),
    (
        "Kettlebell Swing", ["gluteo_mayor", "isquios", "erectores", "delt_anterior", "cardiovascular"],
        "El kettlebell swing impulsa la pesa rusa desde entre las piernas hasta la altura del pecho mediante una potente extensión de cadera (bisagra), no con los brazos. Desarrolla potencia de cadera y resistencia.",
        "Mové la pesa con la cadera, no con la espalda baja ni los hombros. Mantené la columna neutra en la bisagra.",
        "Activá glúteos e isquios con bisagras sin peso. Generá el impulso desde la cadera.",
    ),
    (
        "Muscle Up en Anillas", ["dorsal", "pec_medio", "triceps_lateral", "delt_anterior", "agarre"],
        "El muscle up combina una dominada explosiva con una transición a fondo sobre las anillas, terminando en soporte con los brazos extendidos. Es un movimiento avanzado de gimnasia en crossfit.",
        "Dominá la dominada estricta y el fondo antes de intentarlo. Controlá la transición para no estresar el hombro.",
        "Activá dorsal, pecho y tríceps. Practicá transiciones con asistencia de banda.",
    ),
    (
        "Toes to Bar", ["recto_abdominal", "flexores_cadera", "dorsal", "agarre"],
        "El toes to bar cuelga de la barra y lleva las puntas de los pies a tocarla mediante una flexión potente del abdomen y la cadera. Entrena el core y la coordinación del kipping.",
        "Controlá el balanceo para no perder el agarre. Protegé la lumbar evitando la hiperextensión en el back swing.",
        "Activá el abdomen y deprimí las escápulas. Practicá el ritmo de kipping sin tocar la barra.",
    ),
    (
        "Double Under", ["gemelos", "cardiovascular", "agarre"],
        "El double under pasa la soga dos veces por salto, exigiendo timing, coordinación y resistencia de pantorrillas. Es un clásico del acondicionamiento en crossfit que eleva mucho la frecuencia cardíaca.",
        "Saltá con rebotes bajos y eficientes para cuidar las articulaciones. Mantené los codos cerca del cuerpo.",
        "Activá pantorrillas con saltos simples. Coordiná el giro de muñeca con el salto.",
    ),
    (
        "Handstand Push Up", ["delt_anterior", "triceps_larga", "trapecio", "serrato"],
        "El handstand push up baja y empuja el cuerpo en posición de parada de manos contra la pared, trabajando el empuje vertical con el peso corporal. Es un referente de fuerza de hombros en crossfit.",
        "Asegurá un buen apoyo en pared y protegé el cuello al bajar. Controlá el descenso hasta tocar suavemente.",
        "Activá hombros y tríceps con pikes. Verificá la estabilidad de muñecas y el espacio.",
    ),
    (
        "Remo en Ergómetro", ["dorsal", "cuadriceps", "gluteo_mayor", "cardiovascular", "erectores"],
        "El remo en ergómetro reproduce la remada combinando un empuje de piernas, una apertura de cadera y un tirón de brazos en secuencia. Es un ejercicio cardiovascular de cuerpo completo de bajo impacto.",
        "Seguí la secuencia piernas-cadera-brazos y volvé en orden inverso. Mantené la espalda neutra sin redondear.",
        "Activá piernas y espalda con remadas suaves. Ajustá el damper a un nivel cómodo.",
    ),
    (
        "Assault Bike", ["cardiovascular", "cuadriceps", "full_body"],
        "La assault bike pedalea y empuja los brazos simultáneamente, generando una resistencia que aumenta con el esfuerzo. Es de las herramientas más intensas para el acondicionamiento metabólico.",
        "Ajustá el asiento para no hiperextender la rodilla. Comenzá a ritmo moderado para calibrar la intensidad.",
        "Entrá en calor con un par de minutos suaves. Coordiná brazos y piernas en cada pedalada.",
    ),
    (
        "Snatch con Mancuerna", ["full_body", "delt_lateral", "gluteo_mayor", "trapecio", "cardiovascular"],
        "El snatch con mancuerna lleva una sola pesa desde el suelo o entre las piernas hasta overhead en un movimiento explosivo y unilateral. Muy usado en WODs por su demanda de potencia y coordinación.",
        "Mantené la columna neutra y la mancuerna cerca del cuerpo. Estabilizá el hombro en el bloqueo overhead.",
        "Activá cadera y hombro con repeticiones livianas. Alterná brazos para equilibrar.",
    ),
    (
        "Clean and Jerk con Mancuernas", ["full_body", "delt_anterior", "cuadriceps", "gluteo_mayor", "cardiovascular"],
        "El clean and jerk con mancuernas lleva las pesas del suelo a los hombros y luego overhead, replicando el patrón olímpico con mancuernas. Permite trabajar potencia con menor exigencia técnica que la barra.",
        "Coordiná la recepción de la cargada con los codos altos. Estabilizá ambas mancuernas overhead.",
        "Activá piernas y hombros con dip-drives. Practicá la transición con poco peso.",
    ),
    (
        "Farmer Carry", ["agarre", "trapecio", "erectores", "full_body", "cuadriceps"],
        "El farmer carry camina sosteniendo cargas pesadas en cada mano, desafiando el agarre, el trapecio y la estabilidad del core. Desarrolla fuerza funcional y resistencia muscular general.",
        "Mantené el torso erguido y los hombros atrás. No dejes que la carga te incline hacia un lado.",
        "Activá el agarre y el core antes de levantar. Caminá con pasos cortos y controlados.",
    ),
    (
        "Devil Press", ["full_body", "cardiovascular", "delt_anterior", "pec_medio", "gluteo_mayor"],
        "El devil press combina un burpee sobre dos mancuernas con un snatch hasta overhead, encadenando flexión de pecho y empuje explosivo. Es uno de los movimientos más exigentes del crossfit metabólico.",
        "Cuidá la lumbar al bajar y al levantar las mancuernas. Mantené la columna neutra en el swing hacia arriba.",
        "Activá pecho, hombros y cadera. Empezá con cargas livianas para dominar el patrón.",
    ),
]

# =============================================================
# BOXEO Y DEPORTES DE COMBATE
# =============================================================
EXERCISES += [
    (
        "Jab al Saco", ["delt_anterior", "pec_medio", "triceps_lateral", "cardiovascular", "oblicuo"],
        "El jab es el golpe recto del brazo adelantado, que sale directo desde la guardia rotando ligeramente el puño al impactar. Es el golpe más usado en boxeo para medir distancia y abrir la ofensiva. Trabajá velocidad y retorno rápido a la guardia.",
        "Vendá las manos y usá guantes adecuados para proteger muñecas y nudillos. Mantené la muñeca firme al impactar.",
        "Activá hombros y core con sombra liviana. Soltá los golpes relajado y exhalá en cada impacto.",
    ),
    (
        "Cross (Recto de Derecha) al Saco", ["pec_medio", "delt_anterior", "triceps_lateral", "oblicuo", "gluteo_mayor"],
        "El cross es el recto de la mano trasera, que gana potencia al rotar la cadera y el pie trasero transfiriendo fuerza desde el suelo. Es uno de los golpes más potentes del boxeo. Coordiná el giro de cadera con la extensión del brazo.",
        "Protegé las manos con vendas y guantes. No bloquees el codo de golpe al extender.",
        "Activá la cadena rotando cadera y pie trasero. Mantené la otra mano en guardia.",
    ),
    (
        "Hook (Gancho) al Saco", ["oblicuo", "pec_medio", "delt_anterior", "gluteo_mayor"],
        "El hook es un golpe lateral con el brazo flexionado en ángulo recto que gira con la cadera y los pies para impactar de costado. Genera potencia desde la rotación del tronco. Mantené el codo a la altura del puño.",
        "Cuidá la muñeca y mantené el puño firme al impactar. No sobreextiendas el hombro.",
        "Activá oblicuos y cadera con rotaciones de tronco. Pivoteá el pie al golpear.",
    ),
    (
        "Uppercut al Saco", ["oblicuo", "biceps_larga", "delt_anterior", "gluteo_mayor"],
        "El uppercut es un golpe ascendente que sube desde abajo flexionando ligeramente las piernas y extendiéndolas con la rotación de cadera. Apunta al mentón o al cuerpo. Generá la fuerza desde las piernas y el tronco.",
        "No bajes demasiado la guardia al cargar el golpe. Mantené la muñeca firme en la trayectoria ascendente.",
        "Activá piernas y core con sentadillas ligeras. Coordiná el impulso de piernas con el golpe.",
    ),
    (
        "Trabajo de Sombra (Shadow Boxing)", ["cardiovascular", "delt_anterior", "oblicuo", "gemelos", "full_body"],
        "El shadow boxing practica combinaciones de golpes y desplazamientos sin saco, frente al espejo o al aire, perfeccionando técnica, ritmo y juego de pies. Es fundamental para el calentamiento y la técnica en boxeo.",
        "Mantené las articulaciones algo flexionadas y no bloquees los codos en el aire. Cuidá el equilibrio en los desplazamientos.",
        "Activá el cuerpo con movilidad de hombros y cadera. Empezá lento y subí el ritmo gradualmente.",
    ),
    (
        "Salto a la Comba (Boxeo)", ["gemelos", "cardiovascular", "agarre", "delt_lateral"],
        "El salto a la comba es base del acondicionamiento del boxeador: mejora el juego de pies, la coordinación, el ritmo y la resistencia cardiovascular. Saltá con rebotes bajos sobre las puntas de los pies.",
        "Saltá con rebotes bajos para cuidar tobillos y rodillas. Mantené los hombros relajados.",
        "Activá pantorrillas con saltos suaves. Coordiná el giro de muñeca con el salto.",
    ),
    (
        "Esquivas con Cuerda Horizontal", ["oblicuo", "cuadriceps", "gemelos", "cardiovascular"],
        "Las esquivas (slips y bobbing) practican el movimiento de cabeza y tronco para evitar golpes flexionando las rodillas y rotando levemente. Mejoran la defensa y el trabajo de piernas. Mantené la guardia en todo momento.",
        "No bajes la guardia al esquivar. Cuidá las rodillas al flexionar repetidamente.",
        "Activá piernas y core con sentadillas ligeras. Mantené la vista al frente.",
    ),
    (
        "Golpeo de Manoplas (Pad Work)", ["delt_anterior", "pec_medio", "triceps_lateral", "oblicuo", "cardiovascular"],
        "El trabajo de manoplas golpea las paletas que sostiene un entrenador, encadenando combinaciones con precisión, timing y potencia. Es clave para integrar técnica, reacción y acondicionamiento en boxeo.",
        "Vendá y enguantá las manos correctamente. Mantené la muñeca firme en cada impacto.",
        "Activá hombros y core con sombra. Soltá las combinaciones relajado y respirando.",
    ),
    (
        "Golpeo al Saco Pesado", ["pec_medio", "delt_anterior", "triceps_lateral", "oblicuo", "cardiovascular"],
        "El saco pesado permite descargar potencia real en golpes y combinaciones, desarrollando fuerza de impacto, resistencia y técnica bajo fatiga. Variá golpes, ángulos y desplazamientos por rounds.",
        "Vendá bien las manos y no golpees con la muñeca floja. Mantené la distancia para no impactar con el antebrazo.",
        "Activá todo el cuerpo con sombra previa. Exhalá en cada golpe y volvé siempre a la guardia.",
    ),
    (
        "Golpeo al Pera Loca (Doble End Bag)", ["delt_anterior", "oblicuo", "cardiovascular", "cuello"],
        "La pera loca es una bola sujeta por arriba y abajo con elásticos que rebota de forma impredecible, entrenando la precisión, el timing y los reflejos. Mejora la coordinación ojo-mano del boxeador.",
        "Mantené la guardia alta porque la pera rebota rápido hacia la cara. Cuidá las muñecas en los impactos.",
        "Activá hombros y reflejos con golpes suaves. Concentrate en el timing antes que en la potencia.",
    ),
    (
        "Trabajo de Cuello (Neck Bridge Boxeo)", ["cuello", "trapecio"],
        "El trabajo de cuello fortalece la musculatura cervical para absorber impactos y reducir el riesgo de conmoción, mediante movimientos isométricos y de rango controlado. Es esencial en deportes de contacto.",
        "Trabajá con rango controlado y sin cargas bruscas. Progresá lentamente para no lesionar las cervicales.",
        "Activá el cuello con movimientos suaves en todas las direcciones. Mantené la respiración constante.",
    ),
]

# =============================================================
# PLIOMETRIA/ATLETISMO, CALISTENIA, ESCALADA, KETTLEBELL Y ACCESORIOS
# =============================================================
EXERCISES += [
    (
        "Salto al Cajón con Caída (Depth Jump)", ["cuadriceps", "gluteo_mayor", "gemelos", "full_body"],
        "El depth jump baja de un cajón y, al tocar el suelo, salta inmediatamente lo más alto posible, entrenando el ciclo estiramiento-acortamiento y la potencia reactiva. Es avanzado y propio del entrenamiento atlético.",
        "Requiere base de fuerza previa; usá alturas moderadas. Aterrizá suave con rodillas flexionadas para proteger las articulaciones.",
        "Activá el sistema nervioso con saltos submáximos. Buscá el mínimo tiempo de contacto con el suelo.",
    ),
    (
        "Salto Vertical (Squat Jump)", ["cuadriceps", "gluteo_mayor", "gemelos"],
        "El squat jump desciende a media sentadilla y salta verticalmente con máxima potencia, extendiendo cadera, rodilla y tobillo. Desarrolla la potencia explosiva del tren inferior para muchos deportes.",
        "Aterrizá con las rodillas flexionadas para amortiguar. No redondees la espalda al descender.",
        "Activá glúteos y cuádriceps con sentadillas. Buscá la máxima altura en cada salto.",
    ),
    (
        "Salto en Largo sin Carrera (Broad Jump)", ["gluteo_mayor", "cuadriceps", "isquios", "gemelos"],
        "El broad jump salta hacia adelante la mayor distancia posible desde parado, proyectando la cadera y los brazos. Mide y entrena la potencia horizontal, relevante para sprints y deportes de campo.",
        "Aterrizá con las rodillas flexionadas y el control del torso. Evitá caer con las piernas rígidas.",
        "Activá la cadena posterior con saltos suaves. Coordiná el balanceo de brazos con el despegue.",
    ),
    (
        "Sprint en Cuesta", ["cuadriceps", "gluteo_mayor", "isquios", "gemelos", "cardiovascular"],
        "El sprint en cuesta corre a máxima intensidad sobre una pendiente, aumentando la demanda de potencia y reduciendo el impacto frente al sprint en llano. Mejora la aceleración y la fuerza de zancada.",
        "Entrá en calor a fondo antes de los sprints máximos. Bajá caminando para recuperar y cuidar los isquios.",
        "Activá glúteos e isquios con skipping. Proyectá el cuerpo con zancadas potentes.",
    ),
    (
        "Skipping Alto", ["flexores_cadera", "cuadriceps", "gemelos", "cardiovascular"],
        "El skipping alto eleva las rodillas de forma rápida y alternada coordinando los brazos, mejorando la técnica de carrera, la frecuencia de zancada y el acondicionamiento. Es un clásico del calentamiento atlético.",
        "Mantené el tronco erguido sin echarte atrás. Apoyá sobre el metatarso para cuidar las articulaciones.",
        "Activá flexores de cadera y pantorrillas. Coordiná brazos y piernas con ritmo.",
    ),
    (
        "Flexiones de Brazos", ["pec_medio", "triceps_lateral", "delt_anterior", "serrato"],
        "La flexión baja y empuja el cuerpo en plancha apoyado en manos y pies, trabajando pecho, tríceps y hombros con el peso corporal. Es un ejercicio fundamental de empuje sin equipamiento. Mantené el cuerpo en línea.",
        "No dejes caer la cadera ni eleves los glúteos. Mantené los codos a unos 45 grados del torso.",
        "Activá pecho y core antes de bajar. Mantené la línea recta de la cabeza a los talones.",
    ),
    (
        "Flexiones Diamante", ["triceps_lateral", "triceps_medial", "pec_medio", "delt_anterior"],
        "La flexión diamante junta las manos formando un triángulo bajo el pecho, enfatizando el tríceps. Bajá controlando hasta rozar las manos con el pecho y empujá. Es excelente para el desarrollo del tríceps con peso corporal.",
        "Mantené los codos cerca del cuerpo. No dejes caer la cadera durante el movimiento.",
        "Activá tríceps y core. Mantené la línea recta del cuerpo en todo el rango.",
    ),
    (
        "Sentadilla con Peso Corporal", ["cuadriceps", "gluteo_mayor", "isquios"],
        "La sentadilla libre desciende flexionando cadera y rodillas con el peso del cuerpo y vuelve extendiendo, siendo la base del patrón de sentadilla. Ideal para calentar, aprender la técnica y trabajar resistencia.",
        "Mantené los talones apoyados y la espalda neutra. No dejes que las rodillas colapsen hacia adentro.",
        "Activá glúteos y cuádriceps con repeticiones lentas. Mantené el pecho alto.",
    ),
    (
        "Fondo de Tríceps en Banco", ["triceps_lateral", "triceps_medial", "delt_anterior"],
        "El fondo en banco apoya las manos en un banco detrás del cuerpo y baja flexionando los codos para luego empujar, trabajando el tríceps con el peso corporal. Mantené los codos apuntando hacia atrás.",
        "No bajes en exceso para no estresar el hombro. Mantené los codos cerca del cuerpo.",
        "Activá tríceps con repeticiones parciales. Mantené la espalda cerca del banco.",
    ),
    (
        "Plancha Lateral", ["oblicuo", "transverso", "gluteo_medio"],
        "La plancha lateral sostiene el cuerpo de costado apoyado en un antebrazo y el canto del pie, activando los oblicuos y el glúteo medio de forma isométrica. Mantené la cadera elevada y el cuerpo en línea.",
        "No dejes caer la cadera hacia el suelo. Mantené el cuello alineado con la columna.",
        "Activá oblicuos y glúteo medio antes de elevar. Apretá el core para mantener la línea.",
    ),
    (
        "Superman", ["erectores", "gluteo_mayor", "delt_posterior"],
        "El superman acostado boca abajo eleva simultáneamente brazos y piernas extendiendo la espalda, fortaleciendo los erectores y la cadena posterior. Subí controlando y mantené brevemente la contracción.",
        "No hiperextiendas el cuello; mantené la mirada al piso. Subí de forma controlada sin tirones.",
        "Activá glúteos y erectores. Elevá brazos y piernas a la vez con control.",
    ),
    (
        "Pistol Squat", ["cuadriceps", "gluteo_mayor", "isquios", "transverso"],
        "El pistol squat es una sentadilla a una pierna con la otra extendida al frente, demandando fuerza unilateral, equilibrio y movilidad. Es un ejercicio avanzado de calistenia para el tren inferior.",
        "Requiere movilidad y fuerza; usá apoyo o asistencia al inicio. Controlá el descenso para proteger la rodilla.",
        "Activá cuádriceps y glúteos con sentadillas. Mejorá la movilidad de tobillo previamente.",
    ),
    (
        "Dead Hang en Barra", ["agarre", "flexores_antebrazo", "dorsal", "redondo_mayor"],
        "El dead hang cuelga de la barra con los brazos extendidos manteniendo la posición el mayor tiempo posible, fortaleciendo el agarre, los antebrazos y la salud del hombro. Es base para escalada y dominadas.",
        "Mantené los hombros activos, no completamente relajados. Progresá el tiempo de forma gradual.",
        "Activá el agarre y deprimí levemente las escápulas. Respirá de forma constante.",
    ),
    (
        "Dominadas con Toalla", ["agarre", "flexores_antebrazo", "dorsal", "biceps_larga"],
        "Las dominadas con toalla agarran una toalla sobre la barra en lugar de la barra misma, aumentando enormemente la demanda del agarre y los antebrazos. Es un favorito de escaladores y luchadores.",
        "Asegurá la toalla firmemente sobre la barra. Bajá controlado para cuidar codos y hombros.",
        "Activá el agarre apretando fuerte la toalla. Deprimí las escápulas antes de tirar.",
    ),
    (
        "Trabajo en Hangboard", ["agarre", "flexores_antebrazo"],
        "El hangboard cuelga de pequeñas regletas o agarres de distintos tamaños, desarrollando fuerza específica de dedos y agarre para la escalada. Trabajá con tiempos y agarres progresivos.",
        "Calentá los dedos a fondo antes de cargar; es exigente para las poleas de los dedos. Evitá agarres de máxima dificultad sin base.",
        "Activá antebrazos y dedos con colgadas suaves. Progresá agarres de forma conservadora.",
    ),
    (
        "Turkish Get Up", ["full_body", "delt_anterior", "oblicuo", "gluteo_mayor", "transverso"],
        "El turkish get up pasa de estar acostado a de pie sosteniendo una pesa overhead, a través de una secuencia de transiciones controladas. Entrena estabilidad de hombro, core y coordinación de cuerpo completo.",
        "Aprendé la secuencia sin peso o con carga muy ligera. Mantené la vista en la pesa y el brazo siempre vertical.",
        "Activá hombro y core. Practicá cada transición lentamente antes de encadenar.",
    ),
    (
        "Goblet Squat", ["cuadriceps", "gluteo_mayor", "recto_abdominal", "aductores"],
        "El goblet squat sostiene una pesa rusa o mancuerna contra el pecho mientras se hace una sentadilla, lo que ayuda a mantener el torso erguido y enseña el patrón. Excelente para principiantes y para calentar.",
        "Mantené los codos dentro de las rodillas y la espalda neutra. No dejes caer el pecho.",
        "Activá cuádriceps y core. Mantené la pesa pegada al cuerpo durante todo el rango.",
    ),
    (
        "Kettlebell Clean and Press", ["delt_anterior", "gluteo_mayor", "triceps_larga", "trapecio", "full_body"],
        "El clean and press con kettlebell lleva la pesa del suelo al rack frontal y luego overhead, combinando potencia de cadera y empuje de hombro. Es un movimiento funcional completo y unilateral.",
        "Controlá la cargada para que la pesa no golpee el antebrazo. Estabilizá el hombro en el bloqueo overhead.",
        "Activá cadera y hombro con limpias livianas. Coordiná el impulso con el empuje.",
    ),
    (
        "Renegade Row", ["dorsal", "oblicuo", "transverso", "delt_posterior", "triceps_lateral"],
        "El renegade row parte en plancha sobre dos mancuernas y rema una hacia la cadera mientras el core resiste la rotación. Combina trabajo de espalda con estabilidad antirotación intensa.",
        "Mantené la cadera estable sin rotarla al remar. Abrí los pies para mayor base si lo necesitás.",
        "Activá core y dorsal. Apretá el abdomen para evitar el balanceo de cadera.",
    ),
    (
        "Curl en Banco Inclinado", ["biceps_larga", "biceps_corta"],
        "El curl en banco inclinado sentado deja los brazos colgar atrás del torso, estirando el bíceps al máximo antes de flexionar. Enfatiza la cabeza larga del bíceps. Controlá la fase negativa por completo.",
        "No balancees los hombros para subir. Mantené los codos atrás y fijos durante el movimiento.",
        "Activá el bíceps en el estiramiento. Subí de forma controlada y apretá arriba.",
    ),
    (
        "Curl Predicador", ["biceps_corta", "braquial"],
        "El curl predicador apoya los brazos sobre un soporte inclinado, aislando el bíceps e impidiendo el impulso. Enfatiza la cabeza corta. Bajá controlando sin extender bruscamente el codo.",
        "No extiendas el codo de golpe en la bajada para proteger el tendón. Mantené los brazos firmes en el soporte.",
        "Activá el bíceps con repeticiones livianas. Controlá toda la fase excéntrica.",
    ),
    (
        "Patada de Tríceps (Kickback)", ["triceps_lateral", "triceps_medial"],
        "El kickback inclina el torso y extiende el codo hacia atrás con una mancuerna, aislando el tríceps con énfasis en la contracción final. Mantené el brazo paralelo al torso y solo movés el antebrazo.",
        "No balancees el hombro; mantené el brazo fijo. Usá cargas moderadas para mantener la técnica.",
        "Apretá el tríceps al extender completamente. Activá con repeticiones controladas.",
    ),
    (
        "Elevación de Talones Sentado", ["gemelos"],
        "La elevación sentado flexiona las rodillas y eleva los talones contra una almohadilla cargada sobre los muslos, enfocando el sóleo de la pantorrilla. Subí al máximo y bajá estirando bien.",
        "Controlá el descenso para estirar el sóleo sin rebotar. Ajustá el peso de forma progresiva.",
        "Activá la pantorrilla con repeticiones lentas. Buscá el rango completo.",
    ),
    (
        "Abducción de Cadera en Máquina", ["gluteo_medio", "gluteo_mayor"],
        "La abducción separa las piernas contra la resistencia de la máquina, aislando el glúteo medio. Es útil para la estabilidad de cadera y la estética del glúteo. Controlá la vuelta sin soltar la tensión.",
        "Evitá usar impulso del torso. Controlá tanto la apertura como el cierre.",
        "Activá el glúteo medio con repeticiones livianas. Apretá en la máxima apertura.",
    ),
    (
        "Aducción de Cadera en Máquina", ["aductores"],
        "La aducción junta las piernas contra la resistencia de la máquina, aislando los aductores del muslo interno. Mejora la estabilidad de cadera y previene lesiones de ingle. Controlá la apertura.",
        "No abras más allá de tu rango cómodo. Controlá la fase de regreso.",
        "Activá los aductores con repeticiones lentas. Apretá al juntar las piernas.",
    ),
    (
        "Crunch en Polea Alta", ["recto_abdominal", "oblicuo"],
        "El crunch en polea alta (arrodillado) flexiona el tronco hacia abajo contra la resistencia de la polea con una cuerda, permitiendo cargar el abdomen progresivamente. Concentrá el movimiento en el recto abdominal.",
        "No tires con los brazos; el movimiento viene del abdomen. Mantené la cadera fija.",
        "Activá el recto abdominal exhalando al flexionar. Mantené la tensión en todo el rango.",
    ),
    (
        "Hollow Hold", ["recto_abdominal", "transverso", "flexores_cadera"],
        "El hollow hold acostado eleva piernas y hombros del suelo manteniendo la zona lumbar pegada, creando una posición isométrica de tensión total del core. Es base de la gimnasia y el crossfit.",
        "Mantené la lumbar pegada al piso; si se despega, elevá más las piernas. No contengas la respiración.",
        "Activá el transverso antes de elevar. Mantené la tensión sin perder la forma.",
    ),
    (
        "Face Pull con Banda Elástica", ["delt_posterior", "romboide", "trapecio"],
        "El face pull con banda tira de una banda elástica hacia la cara separando las manos, fortaleciendo el deltoides posterior y los rotadores con resistencia variable. Ideal para casa y prehabilitación.",
        "Mantené los codos altos y la carga moderada. Priorizá la técnica sobre la tensión de la banda.",
        "Activá deltoides posterior y romboides. Separá la banda hacia las orejas.",
    ),
    (
        "Remo Invertido", ["dorsal", "romboide", "trapecio", "biceps_larga"],
        "El remo invertido cuelga el cuerpo bajo una barra fija y tira del pecho hacia ella manteniendo el cuerpo recto, trabajando la espalda con el peso corporal. Variá la inclinación para regular la dificultad.",
        "Mantené el cuerpo en línea sin dejar caer la cadera. Retraé las escápulas en cada tirón.",
        "Activá dorsal y romboides. Iniciá el tirón desde los codos.",
    ),
    (
        "Bird Dog", ["erectores", "transverso", "gluteo_mayor", "delt_posterior"],
        "El bird dog en cuadrupedia extiende brazo y pierna opuestos manteniendo la columna estable, entrenando la coordinación y la estabilidad lumbo-pélvica. Es excelente para la salud de la espalda.",
        "Mantené la columna neutra sin rotar la cadera. Extendé solo hasta donde controles la estabilidad.",
        "Activá el core antes de extender. Coordiná brazo y pierna con control.",
    ),
    (
        "Encogimientos con Mancuernas", ["trapecio"],
        "Los encogimientos con mancuernas elevan los hombros hacia las orejas sosteniendo una mancuerna en cada mano, aislando el trapecio superior con mayor rango que la barra. Subí y apretá arriba.",
        "No rotes los hombros en círculos. Mantené el cuello relajado y la mirada al frente.",
        "Apretá el trapecio un segundo arriba. Activá con repeticiones controladas.",
    ),
    (
        "Press Cerrado en Banca", ["triceps_lateral", "triceps_medial", "pec_medio", "delt_anterior"],
        "El press de banca con agarre cerrado acerca las manos a la anchura de hombros, trasladando gran parte del trabajo al tríceps además del pecho. Mantené los codos cerca del cuerpo al bajar.",
        "No cierres tanto el agarre como para estresar las muñecas. Mantené los codos pegados al torso.",
        "Activá tríceps y pecho. Bajá controlando hacia la parte baja del pecho.",
    ),
]

# =============================================================
# VARIANTES DE FUERZA, ACCESORIOS OLIMPICOS Y MAQUINAS
# =============================================================
EXERCISES += [
    (
        "Sentadilla Búlgara", ["cuadriceps", "gluteo_mayor", "aductores", "isquios"],
        "La sentadilla búlgara apoya el pie trasero elevado en un banco y desciende con la pierna delantera, intensificando el trabajo unilateral de cuádriceps y glúteo. Desarrolla fuerza, equilibrio y corrige asimetrías.",
        "Mantené el torso estable y la rodilla delantera alineada con el pie. No dejes caer la cadera hacia un lado.",
        "Activá glúteo y cuádriceps con repeticiones sin peso. Buscá el equilibrio antes de cargar.",
    ),
    (
        "Sentadilla Hack en Máquina", ["cuadriceps", "gluteo_mayor"],
        "La sentadilla hack en máquina apoya la espalda en un respaldo inclinado y empuja la plataforma con los pies, enfocando el cuádriceps con la columna protegida. Bajá controlado y empujá sin bloquear de golpe.",
        "Mantené la espalda pegada al respaldo. No bloquees las rodillas bruscamente arriba.",
        "Activá el cuádriceps con repeticiones livianas. Colocá los pies según el énfasis buscado.",
    ),
    (
        "Peso Muerto con Trap Bar", ["gluteo_mayor", "cuadriceps", "erectores", "trapecio", "agarre"],
        "El peso muerto con barra hexagonal se realiza de pie dentro de la barra, con agarre neutro a los lados, lo que reduce la demanda lumbar y reparte la carga entre piernas y espalda. Ideal para aprender el patrón.",
        "Mantené la espalda neutra y empujá el piso con los pies. No tires con la lumbar redondeada.",
        "Activá glúteos y cuádriceps generando tensión antes de despegar. Agarrá firme a los lados.",
    ),
    (
        "Sentadilla Goblet con Pausa", ["cuadriceps", "gluteo_mayor", "aductores", "recto_abdominal"],
        "La sentadilla goblet con pausa sostiene la carga al pecho y mantiene unos segundos el fondo de la sentadilla antes de subir, reforzando el control, la movilidad y la fuerza en posición profunda.",
        "Mantené el torso erguido durante la pausa. No rebotes desde el fondo.",
        "Activá el core y los glúteos. Respirá manteniendo la tensión en la pausa.",
    ),
    (
        "Press de Banca con Pausa", ["pec_medio", "triceps_lateral", "delt_anterior"],
        "El press con pausa detiene la barra sobre el pecho 1-2 segundos antes de empujar, eliminando el rebote y reforzando la fuerza desde el punto muerto. Es un accesorio clave para el powerlifting.",
        "Mantené la tensión del cuerpo durante la pausa sin relajar. No hundas la barra en el pecho.",
        "Retraé las escápulas y activá el tríceps. Apretá la barra fuerte en la pausa.",
    ),
    (
        "Press Inclinado con Mancuernas", ["pec_superior", "delt_anterior", "triceps_lateral"],
        "El press inclinado con mancuernas empuja las cargas desde la parte alta del pecho con el banco inclinado, permitiendo un rango amplio y trabajo independiente de cada lado. Enfatiza el pectoral superior.",
        "Controlá el estiramiento sin sobrecargar el hombro. Mantené las muñecas firmes.",
        "Activá el pectoral superior con aperturas inclinadas livianas. Fijá las escápulas.",
    ),
    (
        "Press Pin (Pin Press)", ["pec_medio", "triceps_lateral", "delt_anterior"],
        "El pin press empuja la barra desde pines fijos a la altura del pecho, eliminando la fase excéntrica y entrenando la fuerza desde el punto muerto. Es un accesorio para superar estancamientos en el press.",
        "Ajustá los pines a la altura adecuada. Generá tensión antes de empujar desde parado.",
        "Activá tríceps y pecho. Empujá explosivo desde los pines.",
    ),
    (
        "Remo en T (T-Bar Row)", ["dorsal", "romboide", "trapecio", "biceps_larga", "delt_posterior"],
        "El remo en T usa una barra anclada por un extremo y un agarre en V, traccionando hacia el abdomen con el torso inclinado. Permite cargas altas y desarrolla el grosor de la espalda media.",
        "Mantené la espalda neutra y evitá el balanceo excesivo. No redondees la lumbar.",
        "Retraé las escápulas e iniciá el tirón desde los codos. Activá el dorsal.",
    ),
    (
        "Pull Over en Polea", ["dorsal", "redondo_mayor", "triceps_larga"],
        "El pull over en polea con los brazos extendidos lleva la barra desde arriba hacia los muslos en arco, aislando el dorsal con tensión constante. Mantené una ligera flexión de codo fija.",
        "No flexiones los codos para convertirlo en jalón. Mantené el core firme sin balancearte.",
        "Activá el dorsal con repeticiones livianas. Sentí el estiramiento arriba.",
    ),
    (
        "Pulldown con Agarre Neutro", ["dorsal", "biceps_larga", "braquial", "redondo_mayor"],
        "El pulldown con agarre neutro tira de un agarre en V hacia el pecho, enfatizando la parte baja del dorsal con una posición de hombro más cómoda. Controlá la subida sin perder tensión.",
        "Evitá inclinarte demasiado atrás. No uses impulso para bajar el agarre.",
        "Deprimí las escápulas y tirá desde los codos. Activá el dorsal.",
    ),
    (
        "Press Landmine", ["delt_anterior", "pec_superior", "triceps_lateral", "serrato"],
        "El press landmine empuja una barra anclada por un extremo en diagonal hacia arriba y adelante, trabajando el hombro con una trayectoria amable para la articulación. Ideal para hombros sensibles.",
        "Mantené el core firme sin arquear la lumbar. Controlá la diagonal del empuje.",
        "Activá deltoides y serrato. Empujá la barra siguiendo el ángulo natural.",
    ),
    (
        "Elevación Posterior en Pec Deck", ["delt_posterior", "romboide", "trapecio"],
        "La elevación posterior en máquina (pec deck invertido) abre los brazos hacia atrás contra la resistencia, aislando el deltoides posterior. Controlá el regreso sin perder la tensión.",
        "No uses impulso del torso. Mantené una ligera flexión de codo constante.",
        "Activá el deltoides posterior. Apretá las escápulas al abrir.",
    ),
    (
        "Press Militar Sentado en Máquina", ["delt_anterior", "delt_lateral", "triceps_larga"],
        "El press de hombros en máquina empuja los agarres hacia arriba siguiendo una trayectoria guiada, permitiendo enfocar el deltoides con seguridad. Útil para acercarse al fallo sin estabilización.",
        "Ajustá el asiento para alinear los agarres con los hombros. No bloquees los codos de golpe.",
        "Activá deltoides con repeticiones livianas. Mantené la espalda apoyada.",
    ),
    (
        "Curl Spider", ["biceps_corta", "biceps_larga"],
        "El curl spider apoya el pecho en un banco inclinado con los brazos colgando verticales, flexionando los codos para aislar el bíceps con máxima tensión en la contracción. Sin impulso posible.",
        "Mantené los brazos verticales y los codos fijos. No balancees el cuerpo.",
        "Apretá fuerte el bíceps arriba. Controlá la fase negativa.",
    ),
    (
        "Curl con Cable", ["biceps_larga", "biceps_corta", "braquial"],
        "El curl con cable flexiona los codos contra la polea baja, manteniendo tensión constante en el bíceps en todo el rango, a diferencia de los pesos libres. Controlá la bajada sin soltar la tensión.",
        "No balancees el torso. Mantené los codos pegados al cuerpo.",
        "Activá el bíceps y apretá arriba. Mantené la tensión en la bajada.",
    ),
    (
        "Extensión Overhead con Mancuerna", ["triceps_larga", "triceps_medial"],
        "La extensión overhead sostiene una mancuerna con ambas manos sobre la cabeza y la baja por detrás flexionando los codos, estirando y enfatizando la cabeza larga del tríceps. Mantené los codos apuntando arriba.",
        "Controlá la bajada sin abrir los codos. Cuidá la zona del hombro en el estiramiento.",
        "Activá el tríceps en el estiramiento. Extendé controlando arriba.",
    ),
    (
        "Extensión de Tríceps en Polea con Barra", ["triceps_lateral", "triceps_medial"],
        "La extensión en polea con barra recta empuja hacia abajo extendiendo los codos pegados al cuerpo, enfatizando las cabezas lateral y medial del tríceps. Controlá el regreso resistiendo la carga.",
        "Mantené los codos fijos a los costados. No uses el peso del cuerpo para empujar.",
        "Apretá el tríceps abajo. Activá con repeticiones controladas.",
    ),
    (
        "Gironda / Curl Inclinado en Polea", ["biceps_larga", "biceps_corta"],
        "El curl inclinado en polea estira el bíceps con el brazo detrás del torso, generando una contracción aislada similar al curl en banco inclinado pero con tensión constante del cable. Controlá todo el rango.",
        "Mantené los codos fijos y atrás. No balancees el hombro.",
        "Activá el bíceps en el estiramiento. Apretá en la contracción.",
    ),
    (
        "Elevación Lateral en Polea", ["delt_lateral"],
        "La elevación lateral en polea baja sube el brazo hacia el costado contra la tensión del cable, manteniendo carga constante sobre el deltoides lateral incluso en el inicio del rango. Controlá la bajada.",
        "No uses impulso de cadera. Mantené una ligera flexión de codo.",
        "Activá el deltoide lateral. Liderá con el codo y controlá el regreso.",
    ),
    (
        "Sentadilla Sissy", ["cuadriceps"],
        "La sentadilla sissy inclina el torso hacia atrás mientras flexiona las rodillas adelantándolas, estirando intensamente el cuádriceps. Es un ejercicio de aislamiento avanzado del cuádriceps con peso corporal.",
        "Requiere buena salud de rodilla; progresá con apoyo. Controlá el rango sin forzar la articulación.",
        "Activá el cuádriceps con repeticiones parciales. Mantené el core firme para equilibrar.",
    ),
    (
        "Nordic Curl", ["isquios", "gemelos"],
        "El nordic curl arrodillado con los tobillos fijos baja el torso al frente resistiendo con los isquiotibiales, siendo uno de los ejercicios más potentes para la fuerza excéntrica de isquios y la prevención de lesiones.",
        "Bajá lo más controlado posible y amortiguá con las manos. No te dejes caer de golpe.",
        "Activá los isquios con repeticiones asistidas. Progresá el rango gradualmente.",
    ),
    (
        "Hip Thrust a una Pierna", ["gluteo_mayor", "isquios", "gluteo_medio"],
        "El hip thrust unilateral eleva la cadera apoyando una sola pierna, intensificando el trabajo del glúteo y exponiendo asimetrías. Apretá fuerte arriba manteniendo la pelvis nivelada.",
        "Mantené la pelvis nivelada sin rotar. No hiperextiendas la lumbar arriba.",
        "Activá el glúteo con puentes a una pierna. Empujá con el talón apoyado.",
    ),
    (
        "Step Up con Mancuernas", ["cuadriceps", "gluteo_mayor", "isquios"],
        "El step up sube a un cajón con una pierna sosteniendo mancuernas y baja controlado, trabajando la fuerza unilateral del tren inferior y el equilibrio. Empujá con la pierna de arriba sin impulsarte con la de abajo.",
        "Controlá el descenso sin dejarte caer. Apoyá completamente el pie sobre el cajón.",
        "Activá glúteo y cuádriceps. Subí empujando con el talón de la pierna superior.",
    ),
]

# =============================================================
# MAS COMBATE/MMA, CROSSFIT, ATLETISMO Y OTROS DEPORTES
# =============================================================
EXERCISES += [
    (
        "Combinación 1-2 al Saco", ["delt_anterior", "pec_medio", "triceps_lateral", "oblicuo", "cardiovascular"],
        "La combinación 1-2 encadena un jab seguido de un cross, el dúo fundamental del boxeo. Practicá la transición fluida entre ambos golpes manteniendo la guardia y el equilibrio. Desarrolla coordinación y ritmo ofensivo.",
        "Vendá y enguantá las manos. Volvé siempre a la guardia tras la combinación.",
        "Activá hombros y core con sombra. Coordiná la rotación de cadera en el cross.",
    ),
    (
        "Golpeo de Rodillas (Muay Thai)", ["flexores_cadera", "recto_abdominal", "gluteo_mayor", "gemelos", "oblicuo"],
        "El rodillazo del muay thai impulsa la rodilla hacia arriba o adelante con un fuerte cierre de cadera y abdomen, típicamente en el clinch. Genera gran potencia desde el core y los flexores de cadera.",
        "Cuidá el equilibrio al impactar; mantené el agarre o la guardia. No hiperextiendas la zona lumbar.",
        "Activá core y flexores de cadera. Cerrá la cadera con potencia en cada rodillazo.",
    ),
    (
        "Patada Baja (Low Kick)", ["gluteo_mayor", "oblicuo", "aductores", "gemelos"],
        "la patada baja del kickboxing golpea con la espinilla a la altura del muslo rival, rotando la cadera y pivotando sobre el pie de apoyo. La potencia viene de la rotación de toda la cadena.",
        "Pivoteá el pie de apoyo para no lesionar la rodilla. Acondicioná la espinilla progresivamente.",
        "Activá cadera y oblicuos. Rotá todo el cuerpo en la patada.",
    ),
    (
        "Teep / Patada Frontal", ["flexores_cadera", "cuadriceps", "gluteo_mayor", "recto_abdominal"],
        "El teep o patada frontal empuja con la planta del pie hacia adelante extendiendo la cadera y la rodilla, usado para mantener distancia. Es el jab de las piernas en muay thai. Retraé rápido a la guardia.",
        "Mantené el equilibrio sobre la pierna de apoyo. No bloquees la rodilla al extender.",
        "Activá flexores de cadera y core. Proyectá la cadera al empujar.",
    ),
    (
        "Sprawl", ["full_body", "cuadriceps", "recto_abdominal", "cardiovascular"],
        "El sprawl es la defensa antiderribo: desde de pie se lanzan las piernas hacia atrás cayendo en plancha para frenar un tackle. Es un movimiento explosivo clave en MMA y lucha, muy usado en circuitos.",
        "Cuidá la lumbar al caer; mantené el core firme. Amortiguá con los brazos.",
        "Activá core y piernas con saltos suaves. Reaccioná rápido bajando la cadera.",
    ),
    (
        "Shadow Boxing con Mancuernas Livianas", ["delt_anterior", "delt_lateral", "oblicuo", "cardiovascular"],
        "El shadow boxing con mancuernas livianas ejecuta combinaciones sosteniendo poco peso, aumentando la resistencia de los hombros y la potencia de los golpes. No debe comprometer la técnica ni la velocidad.",
        "Usá cargas muy livianas para no forzar el hombro ni los codos. No bloquees los codos al extender.",
        "Activá hombros con movilidad. Mantené la técnica limpia pese al peso.",
    ),
    (
        "Golpeo al Speed Bag (Pera Veloz)", ["delt_anterior", "delt_lateral", "trapecio", "cardiovascular"],
        "El speed bag golpea una pequeña pera con un ritmo constante de los puños, desarrollando timing, coordinación y resistencia de hombros. Es un clásico del entrenamiento de boxeo para la velocidad de manos.",
        "Mantené los codos arriba y los hombros relajados pero activos. Cuidá las muñecas.",
        "Activá hombros con círculos suaves. Encontrá un ritmo constante antes de acelerar.",
    ),
    (
        "Clean Wall Ball Complex", ["full_body", "cuadriceps", "gluteo_mayor", "delt_anterior", "cardiovascular"],
        "Este complejo encadena una cargada con un wall ball, combinando potencia de cadera con lanzamiento y sentadilla en un patrón metabólico continuo. Muy común en WODs para elevar la intensidad cardiovascular.",
        "Mantené la espalda neutra en cada cargada. Recibí el balón amortiguando hacia la sentadilla.",
        "Activá piernas y hombros. Mantené un ritmo sostenible en las repeticiones.",
    ),
    (
        "Dumbbell Thruster", ["full_body", "cuadriceps", "gluteo_mayor", "delt_anterior", "triceps_larga"],
        "El thruster con mancuernas hace una sentadilla frontal con las mancuernas en los hombros y las empuja overhead con la extensión de cadera. Permite trabajar el patrón de thruster con cargas independientes por lado.",
        "Mantené el core firme y los codos algo elevados. No arquees la lumbar al empujar.",
        "Activá piernas y hombros con repeticiones livianas. Coordiná la subida con el empuje.",
    ),
    (
        "Sandbag Carry", ["full_body", "erectores", "agarre", "gluteo_mayor", "cardiovascular"],
        "El transporte de sandbag carga un saco de arena al pecho o al hombro y camina una distancia, demandando fuerza de core, agarre y resistencia. Es un ejercicio funcional típico de strongman y crossfit.",
        "Mantené la espalda neutra al levantar y caminar. No dejes que el saco te incline.",
        "Activá core y piernas antes de levantar. Abrazá firme el saco.",
    ),
    (
        "Ball Slam", ["full_body", "recto_abdominal", "dorsal", "delt_anterior", "cardiovascular"],
        "El ball slam eleva un balón medicinal por encima de la cabeza y lo estrella contra el suelo con toda la fuerza, extendiendo y luego flexionando el cuerpo. Es un descargador de potencia y un clásico metabólico.",
        "Flexioná las rodillas al recoger el balón, no la espalda. Mantené la columna neutra.",
        "Activá core y dorsal. Extendé el cuerpo arriba antes de lanzar con fuerza.",
    ),
    (
        "Rope Climb (Trepar la Cuerda)", ["dorsal", "agarre", "biceps_larga", "braquial", "cuadriceps"],
        "La trepa de cuerda asciende usando brazos y piernas con una técnica de bloqueo de pies, desarrollando una enorme fuerza de agarre y tirón. Es un movimiento icónico del crossfit y el entrenamiento militar.",
        "Aprendé la técnica de bloqueo de pies antes de subir. Bajá controlado para no quemarte las manos.",
        "Activá agarre y dorsal con dead hangs. Coordiná el empuje de piernas con el tirón.",
    ),
    (
        "Box Step Over", ["cuadriceps", "gluteo_mayor", "cardiovascular", "gemelos"],
        "El box step over sube sobre un cajón y baja por el otro lado de forma continua, una alternativa de menor impacto al box jump usada en WODs largos. Mantené un ritmo constante y el control del paso.",
        "Apoyá completamente el pie en el cajón. Controlá el descenso del otro lado.",
        "Activá glúteos y cuádriceps. Mantené un ritmo sostenible.",
    ),
    (
        "Power Snatch", ["full_body", "trapecio", "gluteo_mayor", "delt_lateral", "cardiovascular"],
        "El power snatch lleva la barra del suelo a overhead en un movimiento explosivo recibiéndola en cuarto de sentadilla, sin bajar a la sentadilla completa. Entrena la potencia del tirón olímpico, muy usado en WODs.",
        "Mantené la barra cerca del cuerpo y la columna neutra. Estabilizá el hombro en el bloqueo overhead.",
        "Activá la cadena posterior con tirones livianos. Movilizá hombros y muñecas.",
    ),
    (
        "Sled Push (Empuje de Trineo)", ["cuadriceps", "gluteo_mayor", "gemelos", "cardiovascular", "full_body"],
        "El sled push empuja un trineo cargado caminando o corriendo, desarrollando potencia de piernas y capacidad anaeróbica con cero fase excéntrica, lo que reduce el daño muscular. Excelente para velocistas y deportistas.",
        "Mantené los brazos firmes y la espalda neutra. Empujá con pasos potentes sin redondear la lumbar.",
        "Activá glúteos y cuádriceps. Inclinate hacia adelante y empujá con fuerza constante.",
    ),
    (
        "Sled Pull (Arrastre de Trineo)", ["isquios", "gluteo_mayor", "dorsal", "trapecio", "cardiovascular"],
        "El sled pull arrastra un trineo cargado caminando hacia atrás o tirando con una cuerda, trabajando la cadena posterior y el agarre. Complementa al empuje y mejora la aceleración.",
        "Mantené la espalda neutra y traccioná con piernas y espalda. No tires solo con los brazos.",
        "Activá isquios y dorsal. Mantené la tensión constante en el arrastre.",
    ),
    (
        "A-Skip", ["flexores_cadera", "gemelos", "cuadriceps", "cardiovascular"],
        "El A-skip es un ejercicio de técnica de carrera que combina un salto con elevación de rodilla y apoyo activo en el metatarso, mejorando la mecánica, la rigidez del tobillo y la frecuencia de zancada.",
        "Apoyá en el metatarso y mantené el tobillo rígido. No te eches hacia atrás.",
        "Activá flexores de cadera y pantorrillas. Coordiná brazos y piernas con ritmo.",
    ),
    (
        "Salto al Cajón Lateral", ["gluteo_medio", "cuadriceps", "gemelos", "gluteo_mayor"],
        "El salto lateral al cajón se proyecta de costado hacia el cajón, entrenando la potencia en el plano frontal y el glúteo medio, relevante para deportes con cambios de dirección. Aterrizá con control.",
        "Aterrizá con la rodilla flexionada y alineada. Empezá con cajones bajos.",
        "Activá glúteo medio y cuádriceps. Proyectá la cadera hacia el lado.",
    ),
    (
        "Pull Buoy / Lat Pull en Seco (Banda)", ["dorsal", "delt_posterior", "triceps_larga", "redondo_mayor"],
        "El trabajo en seco para natación con banda simula la fase de tracción de la brazada, fortaleciendo el dorsal y los hombros en el patrón específico del nado. Mantené la técnica de la brazada controlada.",
        "Mantené los hombros estables y la técnica limpia. No tires con balanceo de torso.",
        "Activá dorsal y hombros. Reproducí la trayectoria de la brazada.",
    ),
    (
        "Rotación Externa de Hombro con Banda", ["delt_posterior", "trapecio"],
        "La rotación externa con banda fortalece el manguito rotador, esencial para la salud del hombro de nadadores y lanzadores. Con el codo pegado al cuerpo, rotá el antebrazo hacia afuera contra la banda.",
        "Usá poca resistencia y prioriza la técnica. Mantené el codo pegado al costado.",
        "Activá los rotadores con repeticiones lentas. No uses impulso.",
    ),
    (
        "Pallof Press", ["oblicuo", "transverso", "recto_abdominal"],
        "El pallof press empuja un cable o banda al frente desde el costado del cuerpo, resistiendo la rotación que genera la carga. Entrena la fuerza antirotación del core, clave para todos los deportes.",
        "Mantené la cadera y los hombros estables sin rotar. No contengas la respiración.",
        "Activá el core antes de empujar. Resistí la rotación durante todo el rango.",
    ),
    (
        "Copenhagen Plank", ["aductores", "oblicuo", "transverso"],
        "La plancha de Copenhague apoya el pie superior en un banco y sostiene el cuerpo de costado con la pierna de arriba, exigiendo intensamente los aductores. Es excelente para la prevención de lesiones de ingle.",
        "Progresá desde la versión con rodilla apoyada. Mantené la cadera elevada sin rotar.",
        "Activá aductores y core. Mantené el cuerpo en línea.",
    ),
    (
        "Cargada Colgante (Hang Clean)", ["full_body", "trapecio", "gluteo_mayor", "cuadriceps", "cardiovascular"],
        "El hang clean inicia la cargada desde la posición colgante (barra a la altura de las rodillas o muslos) en lugar del suelo, enfatizando la segunda fase del tirón y la potencia de cadera. Muy usado para enseñar el clean.",
        "Mantené la barra cerca del cuerpo y la columna neutra. Recibí con los codos altos.",
        "Activá glúteos e isquios con tirones colgantes. Generá potencia desde la cadera.",
    ),
    (
        "Arranque Colgante (Hang Snatch)", ["full_body", "trapecio", "delt_lateral", "gluteo_mayor", "cuadriceps"],
        "El hang snatch ejecuta el arranque desde la posición colgante, reforzando la potencia de la segunda fase del tirón y la velocidad de recepción overhead. Es un ejercicio de técnica para el snatch completo.",
        "Mantené la barra cerca y la espalda neutra. Estabilizá el hombro en la recepción overhead.",
        "Movilizá hombros y muñecas. Acelerá fuerte en la extensión de cadera.",
    ),
    (
        "Push Press con Mancuernas", ["delt_anterior", "triceps_larga", "cuadriceps", "gluteo_mayor"],
        "El push press con mancuernas usa un impulso de piernas para ayudar a empujar las cargas overhead, permitiendo mover más peso que el press estricto y entrenando la transferencia de fuerza pierna-hombro.",
        "Coordiná el dip de piernas con el empuje. No arquees la lumbar al bloquear.",
        "Activá piernas y hombros con dip-drives. Mantené el core firme.",
    ),
    (
        "Clean Pull (Tirón de Cargada)", ["trapecio", "erectores", "gluteo_mayor", "isquios"],
        "El clean pull realiza el tirón de la cargada sin la recepción, enfatizando la extensión explosiva de cadera y el encogimiento de trapecios con cargas potencialmente altas. Acelerá al máximo en la extensión.",
        "Mantené la columna neutra y la barra cerca. No redondees la lumbar en el despegue.",
        "Activá la cadena posterior. Generá tensión antes de despegar y acelerá arriba.",
    ),
]

# =============================================================
# VARIANTES FINALES (AISLAMIENTO, GIMNASIA, ANTEBRAZO, CORE, CARDIO)
# =============================================================
EXERCISES += [
    (
        "Aperturas en Pec Deck", ["pec_medio", "pec_inferior"],
        "Las aperturas en pec deck juntan los brazos al frente contra las almohadillas de la máquina, aislando el pectoral con una trayectoria guiada y tensión constante. Apretá el pecho al juntar y controlá el regreso.",
        "Ajustá el asiento para alinear los codos con los hombros. No fuerces el estiramiento hacia atrás.",
        "Activá el pectoral con repeticiones livianas. Apretá un segundo al juntar.",
    ),
    (
        "Remo en Máquina Hammer", ["dorsal", "romboide", "trapecio", "biceps_larga"],
        "El remo en máquina Hammer tira de los agarres hacia el torso con apoyo del pecho, permitiendo enfocar la espalda sin estabilizar la lumbar. Ideal para cargar y acercarse al fallo con seguridad.",
        "Apoyá bien el pecho y no despegues el torso. Retraé las escápulas en cada tirón.",
        "Activá el dorsal iniciando desde los codos. Apretá la espalda al final.",
    ),
    (
        "Pulldown a un Brazo", ["dorsal", "redondo_mayor", "biceps_larga"],
        "El pulldown a un brazo tira de la polea alta de forma unilateral, permitiendo un rango mayor y corregir asimetrías del dorsal. Controlá la subida sintiendo el estiramiento del dorsal.",
        "Evitá rotar el torso para ayudarte. Mantené la cadera estable.",
        "Deprimí la escápula y tirá desde el codo. Activá el dorsal de cada lado.",
    ),
    (
        "Curl Femoral Sentado", ["isquios", "gemelos"],
        "El curl femoral sentado flexiona las rodillas hacia abajo contra la almohadilla con el torso apoyado, aislando los isquiotibiales en una posición de mayor estiramiento que la versión tumbada.",
        "Ajustá la almohadilla sobre los tobillos. No uses impulso de cadera.",
        "Activá los isquios con repeticiones livianas. Controlá la fase de regreso.",
    ),
    (
        "Extensión Lumbar en Máquina", ["erectores", "gluteo_mayor"],
        "La extensión lumbar en máquina extiende el torso hacia atrás contra el respaldo acolchado, fortaleciendo los erectores de la columna de forma guiada y segura. Subí hasta la línea neutra controlando.",
        "No hiperextiendas la columna; pará en la posición neutra. Controlá el regreso.",
        "Activá los erectores con repeticiones livianas. Mantené el movimiento controlado.",
    ),
    (
        "Abducción de Cadera con Banda (Monster Walk)", ["gluteo_medio", "gluteo_mayor"],
        "El monster walk coloca una banda alrededor de las rodillas o tobillos y camina lateralmente manteniendo la tensión, activando intensamente el glúteo medio. Es base para el calentamiento de cadera y rodilla.",
        "Mantené las rodillas alineadas sin que colapsen hacia adentro. Conservá la tensión de la banda.",
        "Activá el glúteo medio. Caminá con pasos controlados manteniendo la semisentadilla.",
    ),
    (
        "Press de Hombro Landmine de Rodillas", ["delt_anterior", "serrato", "triceps_lateral"],
        "El press landmine de rodillas empuja la barra anclada en diagonal desde una posición arrodillada, eliminando el impulso de piernas y enfocando el hombro y el serrato. Mantené el core firme.",
        "No arquees la lumbar al empujar. Mantené la cadera extendida y el core activo.",
        "Activá deltoides y serrato. Empujá siguiendo la diagonal natural.",
    ),
    (
        "Dips en Anillas", ["pec_inferior", "triceps_lateral", "delt_anterior", "serrato"],
        "Los dips en anillas descienden y empujan el cuerpo sobre anillas inestables, añadiendo una enorme demanda de estabilización frente a los dips en barra fija. Desarrollan fuerza y control del empuje vertical.",
        "Estabilizá las anillas pegándolas al cuerpo. Bajá solo hasta donde controles el hombro.",
        "Activá pecho, tríceps y estabilizadores. Mantené las anillas firmes y rotadas hacia afuera.",
    ),
    (
        "L-Sit", ["recto_abdominal", "flexores_cadera", "triceps_lateral", "cuadriceps"],
        "El L-sit sostiene el cuerpo apoyado en las manos con las piernas extendidas al frente formando una L, exigiendo intensamente el core, los flexores de cadera y el tríceps de forma isométrica.",
        "Deprimí las escápulas y mantené los brazos firmes. Progresá desde piernas flexionadas.",
        "Activá core y tríceps. Empujá el suelo manteniendo los hombros bajos.",
    ),
    (
        "Remo Australiano en Anillas", ["dorsal", "romboide", "trapecio", "biceps_larga"],
        "El remo en anillas tira del cuerpo hacia las anillas manteniéndolo recto, con la inestabilidad sumando demanda de estabilización a la espalda. Regulá la dificultad cambiando la inclinación del cuerpo.",
        "Mantené el cuerpo en línea sin dejar caer la cadera. Retraé las escápulas al tirar.",
        "Activá dorsal y romboides. Iniciá el tirón desde los codos.",
    ),
    (
        "Pike Push Up", ["delt_anterior", "triceps_lateral", "serrato"],
        "El pike push up coloca el cuerpo en forma de V invertida y baja la cabeza hacia el suelo flexionando los codos, trabajando el empuje vertical de los hombros con el peso corporal. Es progresión hacia el handstand push up.",
        "Protegé el cuello bajando controlado. Mantené la cadera elevada en V.",
        "Activá hombros y tríceps. Bajá la coronilla hacia el suelo con control.",
    ),
    (
        "Sentadilla con Salto a una Pierna", ["cuadriceps", "gluteo_mayor", "gemelos", "gluteo_medio"],
        "La sentadilla con salto unilateral desciende sobre una pierna y salta con potencia, demandando fuerza, equilibrio y control reactivo del tren inferior. Es avanzada y útil para deportes de salto.",
        "Aterrizá con la rodilla flexionada y alineada. Dominá la fuerza unilateral antes de saltar.",
        "Activá glúteo y cuádriceps. Controlá el aterrizaje en cada repetición.",
    ),
    (
        "Plate Pinch", ["agarre", "flexores_antebrazo"],
        "El plate pinch sostiene uno o varios discos por sus caras lisas con los dedos, desarrollando la fuerza de pinza del agarre. Es muy específico para escaladores, levantadores y deportes de lucha.",
        "Empezá con discos livianos y superficies que controles. Soltá con cuidado para no golpearte los pies.",
        "Activá los dedos y antebrazos. Apretá con firmeza durante el sostén.",
    ),
    (
        "Wrist Roller (Enrollador de Muñeca)", ["flexores_antebrazo", "extensores_antebrazo", "agarre"],
        "El wrist roller enrolla una cuerda con peso alrededor de una barra girando las muñecas, trabajando intensamente flexores y extensores del antebrazo. Hacé subir y bajar la carga de forma controlada.",
        "Usá cargas moderadas para no estresar las muñecas. Mantené los brazos extendidos sin balancear.",
        "Activá los antebrazos con un par de giros suaves. Controlá la bajada de la carga.",
    ),
    (
        "Reverse Wrist Curl", ["extensores_antebrazo"],
        "El reverse wrist curl apoya los antebrazos y eleva el dorso de las manos con una barra en agarre prono, aislando los extensores del antebrazo. Equilibra el trabajo de los flexores y previene lesiones de codo.",
        "Usá poco peso; los extensores son pequeños. Controlá el rango completo de muñeca.",
        "Activá los extensores con repeticiones lentas. Elevá el dorso de la mano controlando.",
    ),
    (
        "Ab Wheel de Pie", ["recto_abdominal", "transverso", "dorsal", "oblicuo"],
        "La rueda abdominal de pie rueda hacia adelante desde la posición erguida y vuelve contrayendo el core, siendo la versión más avanzada del ejercicio. Demanda una fuerza y antiextensión del abdomen extremas.",
        "Requiere base previa con la versión de rodillas. No dejes que la lumbar se arquee.",
        "Activá el core al máximo antes de rodar. Avanzá solo hasta donde controles.",
    ),
    (
        "Cable Woodchopper", ["oblicuo", "transverso", "recto_abdominal", "delt_anterior"],
        "El woodchopper en polea lleva el cable en diagonal de arriba a abajo (o viceversa) rotando el tronco, entrenando la potencia rotacional del core. Es transferible a golpes, lanzamientos y swings deportivos.",
        "Generá la rotación desde el tronco, no solo los brazos. Mantené la cadera controlada.",
        "Activá los oblicuos. Acompañá la diagonal con la rotación del torso.",
    ),
    (
        "Neck Flexion con Disco", ["cuello", "trapecio"],
        "La flexión de cuello acostado con un disco apoyado en la frente flexiona la cabeza hacia el pecho contra la resistencia, fortaleciendo la musculatura cervical anterior. Esencial en deportes de contacto.",
        "Usá cargas muy livianas y rango controlado. Detené el ejercicio ante cualquier molestia cervical.",
        "Activá el cuello con movimientos suaves sin peso. Progresá la carga muy gradualmente.",
    ),
    (
        "Suitcase Carry", ["oblicuo", "transverso", "agarre", "trapecio", "erectores"],
        "El suitcase carry camina sosteniendo una carga pesada en un solo lado, obligando al core a resistir la flexión lateral. Entrena la estabilidad antilateral y el agarre de forma muy funcional.",
        "Mantené el torso completamente erguido sin inclinarte. No dejes que el hombro caiga.",
        "Activá oblicuos y core antes de levantar. Caminá con pasos controlados y firmes.",
    ),
    (
        "Sentadilla Frontal con Mancuernas", ["cuadriceps", "gluteo_mayor", "recto_abdominal"],
        "La sentadilla frontal con mancuernas apoya las cargas sobre los hombros y desciende manteniendo el torso vertical, enfatizando el cuádriceps con una alternativa accesible a la barra. Mantené los codos elevados.",
        "Mantené el torso erguido y los codos altos. No dejes caer el pecho en el descenso.",
        "Activá cuádriceps y core. Mantené las mancuernas estables sobre los hombros.",
    ),
    (
        "Zancada Caminando con Barra", ["cuadriceps", "gluteo_mayor", "isquios", "aductores"],
        "La zancada caminando avanza alternando piernas con una barra en la espalda, desarrollando fuerza unilateral, equilibrio y resistencia del tren inferior bajo carga. Mantené el torso erguido en cada paso.",
        "Controlá que la rodilla delantera no colapse hacia adentro. Mantené el equilibrio antes de avanzar.",
        "Activá glúteos y cuádriceps. Dá pasos controlados manteniendo el torso firme.",
    ),
    (
        "Peso Muerto a una Pierna con Mancuerna", ["isquios", "gluteo_mayor", "erectores", "gluteo_medio"],
        "El peso muerto a una pierna baja la mancuerna mientras la pierna libre se extiende hacia atrás, entrenando la cadena posterior, el equilibrio y la estabilidad de cadera de forma unilateral.",
        "Mantené la columna neutra y la cadera nivelada. No redondees la espalda al bajar.",
        "Activá glúteo e isquios con el patrón de bisagra. Buscá el equilibrio antes de cargar.",
    ),
    (
        "Sentadilla en Caja (Box Squat)", ["gluteo_mayor", "cuadriceps", "isquios", "erectores"],
        "La sentadilla en caja desciende hasta sentarse brevemente en un cajón antes de subir, reforzando el patrón de cadera, el control y la fuerza desde el punto muerto. Es un accesorio clásico de powerlifting.",
        "No te dejes caer sobre la caja; sentate controlado. Mantené la tensión en la pausa.",
        "Activá glúteos e isquios. Empujá el piso para subir sin perder la tensión.",
    ),
    (
        "Battle Ropes", ["delt_anterior", "cardiovascular", "agarre", "oblicuo"],
        "Las battle ropes ondean dos cuerdas pesadas de forma alternada o simultánea, generando un estímulo cardiovascular y de resistencia de hombros muy intenso. Mantené una semisentadilla y un ritmo constante.",
        "Mantené la espalda neutra y las rodillas algo flexionadas. No encojas los hombros en exceso.",
        "Activá hombros y core. Generá las ondas desde todo el cuerpo, no solo los brazos.",
    ),
    (
        "Mountain Climbers", ["recto_abdominal", "flexores_cadera", "cardiovascular", "delt_anterior"],
        "Los mountain climbers en plancha llevan las rodillas al pecho de forma rápida y alternada, combinando trabajo de core con un fuerte estímulo cardiovascular. Mantené la cadera baja y estable.",
        "No dejes que la cadera suba o se hunda. Mantené los hombros sobre las muñecas.",
        "Activá el core antes de empezar. Mantené un ritmo constante y controlado.",
    ),
    (
        "Jumping Jacks", ["cardiovascular", "delt_lateral", "aductores", "gemelos"],
        "Los jumping jacks abren y cierran brazos y piernas con un salto, un ejercicio de calentamiento y acondicionamiento cardiovascular de cuerpo completo, accesible y de bajo equipamiento. Mantené un ritmo fluido.",
        "Aterrizá suave sobre el metatarso para cuidar las articulaciones. Mantené los hombros relajados.",
        "Activá el cuerpo con un ritmo progresivo. Coordiná brazos y piernas.",
    ),
    (
        "Burpee Box Jump Over", ["full_body", "cuadriceps", "gluteo_mayor", "cardiovascular", "pec_medio"],
        "El burpee box jump over encadena un burpee con un salto sobre el cajón, combinando flexión de pecho, potencia de salto y alta demanda metabólica. Es uno de los movimientos más exigentes en WODs.",
        "Cuidá la lumbar en el burpee y la recepción del salto. Bajá del cajón con control.",
        "Activá el cuerpo con saltos y planchas suaves. Mantené un ritmo sostenible.",
    ),
    (
        "Thruster con Kettlebells", ["full_body", "cuadriceps", "gluteo_mayor", "delt_anterior", "cardiovascular"],
        "El thruster con kettlebells hace una sentadilla frontal con las pesas en el rack y las empuja overhead con la extensión de cadera. La posición del rack con kettlebells añade demanda de estabilidad del core.",
        "Mantené el core firme y los codos cerca del cuerpo. No arquees la lumbar al empujar.",
        "Activá piernas y hombros con repeticiones livianas. Coordiná la subida con el empuje.",
    ),
    (
        "Inchworm", ["recto_abdominal", "transverso", "pec_medio", "delt_anterior"],
        "El inchworm desde de pie baja las manos al suelo, camina hasta la plancha, hace opcionalmente una flexión y regresa caminando las manos. Combina movilidad, core y trabajo de empuje, ideal para calentar.",
        "Mantené las piernas lo más extendidas que tu movilidad permita. No dejes caer la cadera en plancha.",
        "Activá el core y entrá en calor con movimiento suave. Controlá cada fase.",
    ),
    (
        "Sentadilla Isométrica en Pared (Wall Sit)", ["cuadriceps", "gluteo_mayor"],
        "La wall sit mantiene una posición de sentadilla con la espalda apoyada en la pared y los muslos paralelos al suelo, entrenando la resistencia isométrica del cuádriceps. Sostené la posición el tiempo objetivo.",
        "Mantené las rodillas a 90 grados sin pasar la punta del pie. No contengas la respiración.",
        "Activá el cuádriceps al adoptar la posición. Mantené la espalda pegada a la pared.",
    ),
    (
        "Press de Banca Declinado", ["pec_inferior", "triceps_lateral", "delt_anterior"],
        "El press declinado empuja la barra con el banco inclinado hacia abajo, enfatizando la porción inferior del pectoral. Bajá la barra hacia la parte baja del pecho y empujá controlando. Complementa el desarrollo del pecho.",
        "Asegurá bien las piernas en los soportes. No bajes la barra demasiado alto hacia el cuello.",
        "Activá el pectoral inferior con repeticiones livianas. Retraé las escápulas.",
    ),
    (
        "Remo al Mentón con Barra", ["delt_lateral", "trapecio", "biceps_larga"],
        "El remo al mentón eleva la barra cerca del cuerpo hasta la altura del pecho con los codos liderando, trabajando el deltoides lateral y el trapecio. Usá un agarre que no fuerce los hombros.",
        "No subas la barra por encima de los hombros si genera pinzamiento. Mantené los codos por encima de las muñecas.",
        "Activá deltoides y trapecio. Liderá el movimiento con los codos.",
    ),
    (
        "Curl 21s", ["biceps_larga", "biceps_corta", "braquial"],
        "El curl 21s combina 7 repeticiones de medio rango inferior, 7 de medio rango superior y 7 completas, generando una enorme tensión metabólica en el bíceps. Es una técnica de intensidad para el brazo.",
        "Usá una carga menor a la habitual. Mantené los codos fijos durante las 21 repeticiones.",
        "Activá el bíceps antes de empezar. Mantené la técnica pese a la fatiga.",
    ),
    (
        "Sentadilla Zercher", ["cuadriceps", "gluteo_mayor", "erectores", "recto_abdominal"],
        "La sentadilla Zercher sostiene la barra en el pliegue de los codos frente al cuerpo, exigiendo mucho al core y la espalda alta mientras se hace la sentadilla. Es un accesorio de fuerza muy demandante del torso.",
        "Usá una almohadilla en los codos por comodidad. Mantené el torso erguido y el core firme.",
        "Activá core y erectores. Mantené los codos altos sosteniendo la barra.",
    ),
    (
        "Patada de Glúteo en Polea", ["gluteo_mayor", "isquios"],
        "La patada de glúteo en polea extiende una pierna hacia atrás contra la resistencia del cable con una tobillera, aislando el glúteo mayor. Apretá el glúteo en la extensión y controlá el regreso.",
        "No hiperextiendas la lumbar; el movimiento viene de la cadera. Mantené el torso estable.",
        "Activá el glúteo apretando en la extensión. Controlá toda la fase de regreso.",
    ),
    (
        "Encogimiento de Hombros en Máquina", ["trapecio"],
        "El encogimiento en máquina eleva los hombros contra la resistencia guiada, aislando el trapecio superior sin necesidad de estabilizar pesos libres. Subí y apretá arriba un instante.",
        "No rotes los hombros. Mantené el cuello relajado.",
        "Apretá el trapecio arriba. Activá con repeticiones controladas.",
    ),
    (
        "Flexión Pliométrica", ["pec_medio", "triceps_lateral", "delt_anterior", "full_body"],
        "La flexión pliométrica empuja el cuerpo con fuerza explosiva hasta despegar las manos del suelo, entrenando la potencia del empuje horizontal. Es avanzada y requiere base de fuerza previa.",
        "Aterrizá con los codos flexionados para amortiguar. Requiere fuerza previa en flexiones estándar.",
        "Activá pecho y tríceps con flexiones normales. Generá potencia desde el pecho.",
    ),
    (
        "Clean and Jerk con Kettlebell", ["full_body", "delt_anterior", "gluteo_mayor", "cuadriceps", "cardiovascular"],
        "El clean and jerk con kettlebell lleva la pesa al rack y luego overhead con impulso de piernas, combinando potencia de cadera y empuje en un patrón unilateral funcional muy completo.",
        "Controlá la cargada para que la pesa no golpee el antebrazo. Estabilizá el hombro overhead.",
        "Activá cadera y hombro. Coordiná el dip de piernas con el empuje.",
    ),
    (
        "Snatch Grip Deadlift", ["erectores", "trapecio", "gluteo_mayor", "isquios", "agarre"],
        "El peso muerto con agarre de arranque usa un agarre muy ancho, aumentando el rango de recorrido y la demanda de la espalda alta y el agarre. Es un accesorio para fortalecer el tirón del snatch.",
        "Mantené la espalda neutra pese al mayor rango. No redondees la lumbar en el despegue.",
        "Activá la cadena posterior y el agarre. Generá tensión antes de despegar.",
    ),
    (
        "Deficit Push Up (Flexión con Déficit)", ["pec_medio", "triceps_lateral", "delt_anterior"],
        "La flexión con déficit eleva las manos sobre apoyos para aumentar el rango de descenso del pecho, intensificando el estiramiento y el trabajo del pectoral. Bajá controlado hasta el máximo rango cómodo.",
        "No fuerces el estiramiento del hombro. Mantené el cuerpo en línea recta.",
        "Activá el pecho antes de bajar. Mantené la cadera firme.",
    ),
    (
        "Glute Bridge con Barra", ["gluteo_mayor", "isquios"],
        "El glute bridge eleva la cadera desde el suelo con una barra apoyada sobre la pelvis, aislando el glúteo con un rango menor que el hip thrust. Es accesible y excelente para activar el glúteo.",
        "Usá una almohadilla en la barra. Apretá el glúteo arriba sin hiperextender la lumbar.",
        "Activá el glúteo con puentes sin peso. Empujá con los talones.",
    ),
    (
        "Sentadilla Cossack", ["aductores", "cuadriceps", "gluteo_mayor", "gluteo_medio"],
        "La sentadilla cossack desplaza el peso lateralmente sobre una pierna flexionada mientras la otra se extiende, trabajando aductores, movilidad de cadera y fuerza en el plano frontal. Mantené el talón apoyado.",
        "Controlá el rango según tu movilidad. Mantené el talón de la pierna activa en el suelo.",
        "Activá aductores y glúteos. Movilizá la cadera antes de cargar peso.",
    ),
]

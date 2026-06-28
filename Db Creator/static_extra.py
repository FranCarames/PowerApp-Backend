# -*- coding: utf-8 -*-
"""
Datos estaticos que vienen del seed original y se integran al catalogo:
- Los 2 ejercicios "Sentadilla" originales (con sus textos y UUID reales).
- Sus vinculos Exercised_Muscle originales.
Se generan desde Python para que TODO el seed estatico salga del script.
"""

# Ejercicios originales (id, name, description, safety_tips, activation_tips, created_at, updated_at)
ORIGINAL_EXERCISES = [
    ("2c164517-e18f-4c97-a3a7-d31b9865640e", "Sentadilla",
     "Tenes que bajar y despues subir", "Respira como si tu vida dependiera de ello",
     "Apreta las nalgas", "2026-04-26 20:21:55.452574-03", "2026-04-26 20:21:55.452574-03"),
    ("e66c5580-d397-471f-85f0-13bc74655b64", "Sentadilla Barra Baja",
     "Tenes que bajar y despues subir", "Respira como si tu vida dependiera de ello",
     "Apreta las nalgas", "2026-05-07 19:54:30.419425-03", "2026-05-07 19:54:30.419425-03"),
]

# Vinculos Exercised_Muscle originales
# (id, exercise_id, muscle_id, created_at, updated_at)
ORIGINAL_EXERCISED_MUSCLE = [
    ("9289c812-d605-4e71-8523-b3e482f3bd18", "2c164517-e18f-4c97-a3a7-d31b9865640e", "ccf521a5-c910-4e9f-a86b-b5c2e202d80c", "2026-04-26 20:21:55.956833-03", "2026-04-26 20:21:55.956833-03"),
    ("85eba518-bafd-4fb2-a8f2-e5f779d48d41", "2c164517-e18f-4c97-a3a7-d31b9865640e", "95f831db-8dd3-4477-b02f-4f675de81550", "2026-04-26 20:21:57.278818-03", "2026-04-26 20:21:57.278818-03"),
    ("8cb8f18c-fcaa-4d21-98f9-5e59bbcf7138", "2c164517-e18f-4c97-a3a7-d31b9865640e", "870a269b-205c-4f8d-83db-7b557e819744", "2026-04-26 20:21:57.649347-03", "2026-04-26 20:21:57.649347-03"),
    ("a78d989d-c207-48f9-8103-216facb79cce", "2c164517-e18f-4c97-a3a7-d31b9865640e", "a356fd7c-ae2a-4813-bab0-fe70c2515c78", "2026-04-26 20:21:57.757338-03", "2026-04-26 20:21:57.757338-03"),
    ("3b3a846e-a731-4102-982d-2d5dcd6bf959", "e66c5580-d397-471f-85f0-13bc74655b64", "ccf521a5-c910-4e9f-a86b-b5c2e202d80c", "2026-05-07 19:54:30.951098-03", "2026-05-07 19:54:30.951098-03"),
    ("4c1655d6-3d0a-4aba-a437-e4020a349d6c", "e66c5580-d397-471f-85f0-13bc74655b64", "870a269b-205c-4f8d-83db-7b557e819744", "2026-05-07 19:54:32.377731-03", "2026-05-07 19:54:32.377731-03"),
    ("2d43753c-fbd0-42a3-9898-7a32e4c6dfe1", "e66c5580-d397-471f-85f0-13bc74655b64", "95f831db-8dd3-4477-b02f-4f675de81550", "2026-05-07 19:54:32.405671-03", "2026-05-07 19:54:32.405671-03"),
    ("37fa36ce-ae8b-46df-b766-b5a0992806d8", "e66c5580-d397-471f-85f0-13bc74655b64", "a356fd7c-ae2a-4813-bab0-fe70c2515c78", "2026-05-07 19:54:32.437564-03", "2026-05-07 19:54:32.437564-03"),
]

# Timestamps originales de los grupos musculares (para fidelidad con el seed real)
GROUP_TIMESTAMPS = {
    "e743e972-e2ad-44aa-b40b-264255ab4756": ("2026-04-10 08:55:11.054355-03", "2026-04-10 08:55:11.054355-03"),
    "22e7080f-a4a9-457c-aeb5-1bff538eeb3d": ("2026-04-10 09:00:40.534356-03", "2026-04-10 09:00:40.534356-03"),
    "b4715f19-6de4-4735-a2c1-882d76bde9ba": ("2026-04-10 09:00:53.124043-03", "2026-04-10 09:00:53.124043-03"),
    "0120ab64-2ec0-4b14-8c9f-b2646c542749": ("2026-04-10 09:01:01.263399-03", "2026-04-10 09:01:01.263399-03"),
    "a56fe120-6687-4e98-98c5-a553654e1626": ("2026-04-10 09:01:11.012242-03", "2026-04-10 09:01:11.012242-03"),
    "964d1770-1aac-4cf7-825c-780f96b17bb2": ("2026-04-10 09:01:15.692963-03", "2026-04-10 09:01:15.692963-03"),
}

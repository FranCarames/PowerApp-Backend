# -*- coding: utf-8 -*-
"""
URLs de las imagenes del catalogo (BE-47).

Las imagenes viven en el repo PowerApp-Assets, publicado con GitHub Pages.
Cada archivo se llama como el id de su fila, asi que la URL sale del id:

    Exercise.preview_image   <base>/exercise/preview/<id>.svg
    Exercise.bg_image        <base>/exercise/bg/<id>.jpg   (solo si tiene foto)
    Muscle.image_url y preview_image        <base>/muscle/<id>.svg
    Muscle_Group.image_url y preview_image  <base>/muscle-group/<id>.svg

Que ejercicios tienen foto lo dice imagenes_manifiesto.py, que genera el repo
de assets (`py generator/export_manifest.py`). Este archivo no importa ese repo.
"""
from imagenes_manifiesto import EXERCISES_WITH_PHOTO

# Unica constante con la URL: si el repo se muda, se cambia aca y se regenera.
ASSETS_BASE = "https://francarames.github.io/PowerApp-Assets"


def exercise_preview(exercise_id):
    return "{}/exercise/preview/{}.svg".format(ASSETS_BASE, exercise_id)


def exercise_bg(exercise_id):
    """La foto del detalle, o None si el ejercicio no tiene (queda NULL)."""
    if exercise_id not in EXERCISES_WITH_PHOTO:
        return None
    return "{}/exercise/bg/{}.jpg".format(ASSETS_BASE, exercise_id)


def muscle_image(muscle_id):
    return "{}/muscle/{}.svg".format(ASSETS_BASE, muscle_id)


def group_image(group_id):
    return "{}/muscle-group/{}.svg".format(ASSETS_BASE, group_id)

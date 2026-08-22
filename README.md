# PowerApp — Backend

Backend de **PowerApp**, una aplicación de gimnasio y entrenamiento. Expone una API REST para la gestión de usuarios, entrenadores, membresías, ejercicios, planificaciones, rutinas y récords máximos (RM).

![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?logo=postgresql&logoColor=white)
![TypeORM](https://img.shields.io/badge/TypeORM-0.3-FE0803)
[![Swagger](https://img.shields.io/badge/Swagger-API%20en%20vivo-85EA2D?logo=swagger&logoColor=000)](https://powerapp-backend.onrender.com/docs)

> 🔌 **Todos los servicios de la API están documentados en Swagger:** **[powerapp-backend.onrender.com/docs](https://powerapp-backend.onrender.com/docs)**
> Documentación interactiva, lista para probar desde el navegador (parámetros, DTOs, respuestas y autenticación Bearer JWT).

---

## 📚 Documentación

La documentación visual está publicada en **[francarames.github.io/PowerApp-Backend](https://francarames.github.io/PowerApp-Backend/)** y la de la API, en **Swagger**. Todo es accesible desde la portada:

| Vista | Dónde | Descripción |
|---|---|---|
| 🔌 **[API — Swagger](https://powerapp-backend.onrender.com/docs)** | Render | **Documentación de todos los servicios REST**: endpoints, parámetros, esquemas y pruebas en vivo |
| 🧭 **[Portada](https://francarames.github.io/PowerApp-Backend/)** | GitHub Pages | Índice de toda la documentación |
| 📱 **[Prototipo de interfaces](https://francarames.github.io/PowerApp-Backend/UI%20Front/powerapp-prototype.html)** | GitHub Pages | Mockups navegables de las pantallas, por rol |
| 📊 **[Estado de implementación](https://francarames.github.io/PowerApp-Backend/Status/dashboard-estado-CU.html)** | GitHub Pages | Dashboard de avance: cada CU vs. el código |
| 📄 **[Especificaciones de CU](https://francarames.github.io/PowerApp-Backend/Use%20Cases/)** | GitHub Pages | Las 72 especificaciones de casos de uso, por rol y paquete |

---

## 🛠️ Stack

- **[NestJS](https://nestjs.com/)** 11 (Node.js + TypeScript)
- **[TypeORM](https://typeorm.io/)** sobre **PostgreSQL**
- **JWT** (`@nestjs/jwt` + `bcrypt`) para autenticación
- **Swagger / OpenAPI** (`@nestjs/swagger`) para documentar la API
- **class-validator** / **class-transformer** para validación de DTOs

---

## 📁 Estructura del repositorio

```
power-app/         → Código de la API (NestJS). Entidades en src/entities.
Use Cases/         → Especificaciones de los 72 casos de uso (1 .md por CU) + índice.
Status/            → Informe y dashboard del avance de implementación por CU.
Db Creator/        → Scripts (Python) que regeneran la base desde cero → 3 archivos .sql.
Doc/               → Documentación vigente del proyecto (modelo de datos actualizado).
UI Front/          → Prototipo HTML de las interfaces.
index.html         → Portada de GitHub Pages.
```

> Las **entidades TypeORM** (`power-app/src/entities`) son la fuente de verdad del modelo ("código primero"): `synchronize` está en `false` y no hay migraciones, así que los cambios de schema se aplican **regenerando la base** con los scripts de `Db Creator/`.

---

## 🚀 Puesta en marcha

### Requisitos
- Node.js 18+ y npm
- Una instancia de PostgreSQL

### 1. Instalar dependencias
```bash
cd power-app
npm install
```

### 2. Variables de entorno
Crear un archivo `power-app/.env`:
```env
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=tu_usuario
POSTGRES_PASSWORD=tu_password
POSTGRES_DB=powerapp
JWT_SECRET=un_secreto_largo_y_aleatorio
PORT=3000
```

### 3. Crear la base de datos
Aplicar los scripts de `Db Creator/` **en orden** sobre la base:
```
01_estructura.sql  →  02_datos_estaticos.sql  →  03_datos_dinamicos.sql
```
Se pueden regenerar con `python build_sql.py` dentro de `Db Creator/`.

### 4. Levantar la API
```bash
npm run start:dev     # desarrollo (watch)
npm run start:prod    # producción (requiere build previo)
npm run build         # compilar
```

---

## 🔌 API

**Todos los servicios están documentados en Swagger** — es la referencia de la API: cada endpoint con su verbo, parámetros, DTO de entrada, esquema de respuesta y códigos de error, y se puede probar desde el propio navegador (botón *Authorize* para el Bearer JWT).

| | Desplegado (Render) | Local |
|---|---|---|
| **Swagger** | **<https://powerapp-backend.onrender.com/docs>** | `http://localhost:3000/docs` |
| **Base URL** | `https://powerapp-backend.onrender.com/api/v1` | `http://localhost:3000/api/v1` |

- **Auth:** Bearer JWT (`Authorization: Bearer <token>`). El token de `login` / `register` vuelve en el **header `Authorization` de la respuesta**.
- El prefijo `api/v1` es global; `/docs` queda **fuera** del prefijo.

Módulos: `users`, `coach`, `membership`, `muscles`, `exercise`, `planification`, `routine`, `user_rm`.

> ⏱️ El deploy corre en el free tier de Render: si el servicio estuvo inactivo, la primera carga de `/docs` puede demorar unos segundos mientras arranca.

---

## 📊 Estado del proyecto

El avance se sigue caso de uso por caso de uso. Ver el **[dashboard de estado](https://francarames.github.io/PowerApp-Backend/Status/dashboard-estado-CU.html)** o el informe en [`Status/estado-implementacion-CU.md`](Status/estado-implementacion-CU.md).

> ℹ️ La base de datos del proyecto es de un tier gratuito y puede expirar; si no hay una base viva, los cambios se verifican por **compilación**: `npm --prefix power-app run build`.

# PowerApp — Backend

Backend de **PowerApp**, una aplicación de gimnasio y entrenamiento. Expone una API REST para la gestión de usuarios, entrenadores, membresías, ejercicios, planificaciones, rutinas y récords máximos (RM).

![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?logo=postgresql&logoColor=white)
![TypeORM](https://img.shields.io/badge/TypeORM-0.3-FE0803)

---

## 📚 Documentación (GitHub Pages)

Toda la documentación visual está publicada en **[francarames.github.io/PowerApp-Backend](https://francarames.github.io/PowerApp-Backend/)**:

| Vista | Descripción |
|---|---|
| 🧭 **[Portada](https://francarames.github.io/PowerApp-Backend/)** | Índice de toda la documentación |
| 📱 **[Prototipo de interfaces](https://francarames.github.io/PowerApp-Backend/UI%20Front/powerapp-prototype.html)** | Mockups navegables de las pantallas, por rol |
| 📊 **[Estado de implementación](https://francarames.github.io/PowerApp-Backend/Status/dashboard-estado-CU.html)** | Dashboard de avance: cada CU vs. el código |
| 📄 **[Especificaciones de CU](https://francarames.github.io/PowerApp-Backend/Use%20Cases/)** | Las 72 especificaciones de casos de uso, por rol y paquete |

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

- **Base URL:** `http://localhost:3000/api/v1`
- **Documentación interactiva (Swagger):** `http://localhost:3000/docs`
- **Auth:** Bearer JWT (`Authorization: Bearer <token>`)

Módulos principales: `users`, `coach`, `membership`, `muscles`, `exercise`, `planification`, `routine`, `user_rm`.

---

## 📊 Estado del proyecto

El avance se sigue caso de uso por caso de uso. Ver el **[dashboard de estado](https://francarames.github.io/PowerApp-Backend/Status/dashboard-estado-CU.html)** o el informe en [`Status/estado-implementacion-CU.md`](Status/estado-implementacion-CU.md).

> ℹ️ La base de datos del proyecto es de un tier gratuito y puede expirar; si no hay una base viva, los cambios se verifican por **compilación**: `npm --prefix power-app run build`.

# QuizApp

Aplicacion de quizzes interactivos con autenticacion de usuarios, creacion de cuestionarios y sistema de compartir.

## Tecnologias

### Backend
- FastAPI
- PostgreSQL
- SQLAlchemy
- JWT (python-jose)

### Frontend
- React Native / Expo
- TypeScript
- expo-router

## Estructura del Proyecto

```
backend/          # API REST con FastAPI
frontend/QuizApp/ # Aplicacion movil y web con Expo
```

## Funcionalidades

- Registro e inicio de sesion de usuarios
- Crear, editar y eliminar quizzes
- Agregar preguntas con multiples opciones
- Ejecutar quizzes con temporizador y puntuacion
- Compartir quizzes mediante codigos de 6 caracteres
- Historial y estadisticas de intentos

## Instalacion

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend

```bash
cd frontend/QuizApp
npm install
npm start
```

## Despliegue

- Backend: Railway (Nixpacks)
- Frontend Web: Railway con Expo export
- Mobile: APK generado con EAS Build

## API Endpoints

- `/auth/register` - Registro de usuario
- `/auth/login` - Inicio de sesion
- `/quizzes/` - CRUD de quizzes
- `/questions/` - CRUD de preguntas
- `/share/` - Compartir y unirse a quizzes
- `/history/` - Historial de intentos

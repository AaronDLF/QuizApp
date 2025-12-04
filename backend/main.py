from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

import models
from database import engine
from routers import auth, quizzes, questions, share, history

app = FastAPI(title="Quiz App API", version="1.0.0")

# Configurar CORS para permitir peticiones desde el frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Crear tablas
models.Base.metadata.create_all(bind=engine)

# Registrar routers
app.include_router(auth.router)
app.include_router(quizzes.router)
app.include_router(questions.router)
app.include_router(share.router)
app.include_router(history.router)


@app.get("/")
async def root():
    return {"message": "Quiz App API", "version": "1.0.0"}


if __name__ == "__main__":
    # Ejecutar en 0.0.0.0 para aceptar conexiones de cualquier IP (red local)
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

from fastapi import APIRouter, HTTPException, status
from datetime import timedelta

from auth import (
    db_dependency,
    verify_password,
    get_password_hash,
    create_access_token,
    ACCESS_TOKEN_EXPIRE_MINUTES,
    current_user_dependency,
)
from schemas.user import UserCreate, UserLogin, UserResponse, Token
import models

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate, db: db_dependency):
    """Registrar un nuevo usuario"""
    # Verificar si el email ya existe
    existing_user = db.query(models.Users).filter(
        models.Users.email == user_data.email
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Crear el usuario
    hashed_password = get_password_hash(user_data.password)
    db_user = models.Users(
        email=user_data.email,
        hashed_password=hashed_password,
        name=user_data.name
    )

    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return db_user


@router.post("/login", response_model=Token)
async def login(user_data: UserLogin, db: db_dependency):
    """Iniciar sesión y obtener token"""
    # Buscar usuario
    user = db.query(models.Users).filter(
        models.Users.email == user_data.email
    ).first()

    if not user or not verify_password(user_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Crear token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id)},  # Convertir a string
        expires_delta=access_token_expires
    )

    return Token(access_token=access_token, token_type="bearer")


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: current_user_dependency):
    """Obtener información del usuario actual"""
    return current_user

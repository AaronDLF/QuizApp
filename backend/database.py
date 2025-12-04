import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base

# Cargar variables de entorno desde .env.local
load_dotenv('.env.local')

DATABASE_URL = os.getenv('DATABASE_URL')

if not DATABASE_URL:
    raise ValueError("DATABASE_URL no está configurada en .env.local")

engine = create_engine(DATABASE_URL)

session_local = sessionmaker(autocommit=False,autoflush=False, bind=engine)

Base = declarative_base()



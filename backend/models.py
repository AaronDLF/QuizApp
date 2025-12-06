from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, DateTime
from sqlalchemy.sql import func
from database import Base


class Users(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    name = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Quizzes(Base):
    __tablename__ = 'quizzes'

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    user_id = Column(Integer, ForeignKey("users.id"))
    share_code = Column(String(8), unique=True, nullable=True, index=True)
    is_public = Column(Boolean, default=False)


class Questions(Base):
    __tablename__ = 'questions'

    id = Column(Integer, primary_key=True, index=True)
    question_text = Column(String, index=True)
    answer_type = Column(String, default="options")  # "text" o "options"
    quiz_id = Column(Integer, ForeignKey("quizzes.id"))


class Choices(Base):
    __tablename__ = "choices"

    id = Column(Integer, primary_key=True, index=True)
    choice_text = Column(String, index=True)
    is_correct = Column(Boolean, default=False)
    question_id = Column(Integer, ForeignKey("questions.id"))


class QuizHistory(Base):
    __tablename__ = "quiz_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    quiz_id = Column(Integer, ForeignKey("quizzes.id"), nullable=True)  # Puede ser null si el quiz fue eliminado
    quiz_title = Column(String)  # Guardamos el título para mantenerlo aunque se elimine el quiz
    score = Column(Integer)  # Porcentaje 0-100
    correct_answers = Column(Integer)
    total_questions = Column(Integer)
    time_spent = Column(Integer)  # Segundos
    is_external = Column(Boolean, default=False)  # True si vino de un código compartido
    owner_name = Column(String, nullable=True)  # Nombre del dueño si es externo
    completed_at = Column(DateTime(timezone=True), server_default=func.now())




from fastapi import APIRouter, HTTPException, status

from auth import db_dependency, current_user_dependency
from schemas.quiz import (
    QuizBase,
    QuizResponse,
    QuizListResponse,
    QuestionBase,
    QuestionResponse,
    ChoiceResponse,
)
import models

router = APIRouter(prefix="/quizzes", tags=["Quizzes"])


# ==================== QUIZ ENDPOINTS ====================

@router.get("/", response_model=list[QuizListResponse])
async def get_all_quizzes(db: db_dependency, current_user: current_user_dependency):
    """Obtener todos los quizzes del usuario actual"""
    quizzes = db.query(models.Quizzes).filter(
        models.Quizzes.user_id == current_user.id
    ).all()

    result = []
    for quiz in quizzes:
        question_count = db.query(models.Questions).filter(
            models.Questions.quiz_id == quiz.id
        ).count()
        result.append(QuizListResponse(
            id=quiz.id,
            title=quiz.title,
            created_at=quiz.created_at,
            question_count=question_count
        ))
    return result


@router.get("/{quiz_id}", response_model=QuizResponse)
async def get_quiz(quiz_id: int, db: db_dependency, current_user: current_user_dependency):
    """Obtener un quiz con todas sus preguntas y opciones"""
    quiz = db.query(models.Quizzes).filter(
        models.Quizzes.id == quiz_id,
        models.Quizzes.user_id == current_user.id
    ).first()

    if not quiz:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quiz not found")

    questions = db.query(models.Questions).filter(models.Questions.quiz_id == quiz_id).all()

    questions_response = []
    for question in questions:
        choices = db.query(models.Choices).filter(
            models.Choices.question_id == question.id
        ).all()
        questions_response.append(QuestionResponse(
            id=question.id,
            question_text=question.question_text,
            answer_type=question.answer_type,
            quiz_id=question.quiz_id,
            choices=[ChoiceResponse(
                id=c.id,
                choice_text=c.choice_text,
                is_correct=c.is_correct,
                question_id=c.question_id
            ) for c in choices]
        ))

    return QuizResponse(
        id=quiz.id,
        title=quiz.title,
        created_at=quiz.created_at,
        user_id=quiz.user_id,
        questions=questions_response
    )


@router.post("/", response_model=QuizResponse, status_code=status.HTTP_201_CREATED)
async def create_quiz(quiz: QuizBase, db: db_dependency, current_user: current_user_dependency):
    """Crear un nuevo quiz"""
    db_quiz = models.Quizzes(title=quiz.title, user_id=current_user.id)
    db.add(db_quiz)
    db.commit()
    db.refresh(db_quiz)

    return QuizResponse(
        id=db_quiz.id,
        title=db_quiz.title,
        created_at=db_quiz.created_at,
        user_id=db_quiz.user_id,
        questions=[]
    )


@router.put("/{quiz_id}", response_model=QuizResponse)
async def update_quiz(quiz_id: int, quiz_data: QuizBase, db: db_dependency, current_user: current_user_dependency):
    """Actualizar el título de un quiz"""
    quiz = db.query(models.Quizzes).filter(
        models.Quizzes.id == quiz_id,
        models.Quizzes.user_id == current_user.id
    ).first()

    if not quiz:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quiz not found")

    quiz.title = quiz_data.title
    db.commit()
    db.refresh(quiz)

    # Obtener preguntas para la respuesta
    questions = db.query(models.Questions).filter(models.Questions.quiz_id == quiz_id).all()
    questions_response = []
    for question in questions:
        choices = db.query(models.Choices).filter(
            models.Choices.question_id == question.id
        ).all()
        questions_response.append(QuestionResponse(
            id=question.id,
            question_text=question.question_text,
            answer_type=question.answer_type,
            quiz_id=question.quiz_id,
            choices=[ChoiceResponse(
                id=c.id,
                choice_text=c.choice_text,
                is_correct=c.is_correct,
                question_id=c.question_id
            ) for c in choices]
        ))

    return QuizResponse(
        id=quiz.id,
        title=quiz.title,
        created_at=quiz.created_at,
        user_id=quiz.user_id,
        questions=questions_response
    )


@router.delete("/{quiz_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_quiz(quiz_id: int, db: db_dependency, current_user: current_user_dependency):
    """Eliminar un quiz y todas sus preguntas"""
    quiz = db.query(models.Quizzes).filter(
        models.Quizzes.id == quiz_id,
        models.Quizzes.user_id == current_user.id
    ).first()

    if not quiz:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quiz not found")

    # Eliminar choices de todas las preguntas del quiz
    questions = db.query(models.Questions).filter(models.Questions.quiz_id == quiz_id).all()
    for question in questions:
        db.query(models.Choices).filter(models.Choices.question_id == question.id).delete()

    # Eliminar preguntas
    db.query(models.Questions).filter(models.Questions.quiz_id == quiz_id).delete()

    # Eliminar quiz
    db.delete(quiz)
    db.commit()


# ==================== QUESTION ENDPOINTS ====================

@router.post("/{quiz_id}/questions/", response_model=QuestionResponse, status_code=status.HTTP_201_CREATED)
async def add_question_to_quiz(
    quiz_id: int,
    question: QuestionBase,
    db: db_dependency,
    current_user: current_user_dependency
):
    """Agregar una pregunta a un quiz"""
    # Verificar que el quiz existe y pertenece al usuario
    quiz = db.query(models.Quizzes).filter(
        models.Quizzes.id == quiz_id,
        models.Quizzes.user_id == current_user.id
    ).first()

    if not quiz:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quiz not found")

    # Crear la pregunta
    db_question = models.Questions(
        question_text=question.question_text,
        answer_type=question.answer_type,
        quiz_id=quiz_id
    )
    db.add(db_question)
    db.commit()
    db.refresh(db_question)

    # Crear las opciones
    choices_list = []
    for choice in question.choices:
        db_choice = models.Choices(
            choice_text=choice.choice_text,
            is_correct=choice.is_correct,
            question_id=db_question.id
        )
        db.add(db_choice)
        db.commit()
        db.refresh(db_choice)
        choices_list.append(db_choice)

    return QuestionResponse(
        id=db_question.id,
        question_text=db_question.question_text,
        answer_type=db_question.answer_type,
        quiz_id=db_question.quiz_id,
        choices=[ChoiceResponse(
            id=c.id,
            choice_text=c.choice_text,
            is_correct=c.is_correct,
            question_id=c.question_id
        ) for c in choices_list]
    )

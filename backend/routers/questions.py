from fastapi import APIRouter, HTTPException, status

from auth import db_dependency, current_user_dependency
from schemas.quiz import QuestionBase, QuestionResponse, ChoiceResponse
import models

router = APIRouter(prefix="/questions", tags=["Questions"])


@router.put("/{question_id}", response_model=QuestionResponse)
async def update_question(
    question_id: int,
    question_data: QuestionBase,
    db: db_dependency,
    current_user: current_user_dependency
):
    """Actualizar una pregunta y sus opciones"""
    # Obtener la pregunta
    question = db.query(models.Questions).filter(
        models.Questions.id == question_id
    ).first()

    if not question:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question not found")

    # Verificar que el quiz pertenece al usuario
    quiz = db.query(models.Quizzes).filter(
        models.Quizzes.id == question.quiz_id,
        models.Quizzes.user_id == current_user.id
    ).first()

    if not quiz:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")

    # Actualizar texto
    question.question_text = question_data.question_text
    question.answer_type = question_data.answer_type  # Actualizar tipo de respuesta

    # Eliminar opciones antiguas
    db.query(models.Choices).filter(models.Choices.question_id == question_id).delete()

    # Crear nuevas opciones
    new_choices = []
    for choice in question_data.choices:
        db_choice = models.Choices(
            choice_text=choice.choice_text,
            is_correct=choice.is_correct,
            question_id=question.id
        )
        new_choices.append(db_choice)

    db.add_all(new_choices)
    db.commit()
    db.refresh(question)
    for choice in new_choices:
        db.refresh(choice)

    return QuestionResponse(
        id=question.id,
        question_text=question.question_text,
        quiz_id=question.quiz_id,
        choices=[ChoiceResponse(
            id=c.id,
            choice_text=c.choice_text,
            is_correct=c.is_correct,
            question_id=c.question_id
        ) for c in new_choices]
    )


@router.delete("/{question_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_question(
    question_id: int,
    db: db_dependency,
    current_user: current_user_dependency
):
    """Eliminar una pregunta y sus opciones"""
    # Obtener la pregunta
    question = db.query(models.Questions).filter(
        models.Questions.id == question_id
    ).first()

    if not question:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question not found")

    # Verificar que el quiz pertenece al usuario
    quiz = db.query(models.Quizzes).filter(
        models.Quizzes.id == question.quiz_id,
        models.Quizzes.user_id == current_user.id
    ).first()

    if not quiz:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")

    # Eliminar opciones
    db.query(models.Choices).filter(models.Choices.question_id == question_id).delete()

    # Eliminar pregunta
    db.delete(question)
    db.commit()

from fastapi import APIRouter, HTTPException, status
import secrets
import string

from auth import db_dependency, current_user_dependency
from schemas.quiz import QuizResponse, QuestionResponse, ChoiceResponse
from schemas.share import ShareCodeResponse, SharedQuizInfo
import models

router = APIRouter(prefix="/share", tags=["Share"])


# ==================== HELPERS ====================

def generate_share_code(length: int = 6) -> str:
    """Genera un código único alfanumérico de compartir"""
    characters = string.ascii_uppercase + string.digits
    # Excluir caracteres confusos: 0, O, I, 1, L
    characters = characters.replace('0', '').replace('O', '').replace('I', '').replace('1', '').replace('L', '')
    return ''.join(secrets.choice(characters) for _ in range(length))


# ==================== ENDPOINTS ====================

@router.post("/{quiz_id}/generate-code", response_model=ShareCodeResponse)
async def generate_quiz_share_code(
    quiz_id: int,
    db: db_dependency,
    current_user: current_user_dependency
):
    """Generar un código único para compartir el quiz"""
    quiz = db.query(models.Quizzes).filter(
        models.Quizzes.id == quiz_id,
        models.Quizzes.user_id == current_user.id
    ).first()

    if not quiz:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Quiz no encontrado o no tienes permiso"
        )

    # Si ya tiene código, devolver el existente
    if quiz.share_code:
        return ShareCodeResponse(
            share_code=quiz.share_code,
            message="Código existente"
        )

    # Generar nuevo código único
    max_attempts = 10
    for _ in range(max_attempts):
        code = generate_share_code()
        existing = db.query(models.Quizzes).filter(
            models.Quizzes.share_code == code
        ).first()
        if not existing:
            break
    else:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="No se pudo generar un código único"
        )

    quiz.share_code = code
    quiz.is_public = True
    db.commit()

    return ShareCodeResponse(
        share_code=code,
        message="Código generado exitosamente"
    )


@router.delete("/{quiz_id}/revoke-code")
async def revoke_share_code(
    quiz_id: int,
    db: db_dependency,
    current_user: current_user_dependency
):
    """Revocar el código de compartir de un quiz"""
    quiz = db.query(models.Quizzes).filter(
        models.Quizzes.id == quiz_id,
        models.Quizzes.user_id == current_user.id
    ).first()

    if not quiz:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Quiz no encontrado"
        )

    quiz.share_code = None
    quiz.is_public = False
    db.commit()

    return {"message": "Código revocado exitosamente"}


@router.get("/code/{share_code}", response_model=SharedQuizInfo)
async def get_quiz_info_by_code(
    share_code: str,
    db: db_dependency,
    current_user: current_user_dependency
):
    """Obtener información de un quiz por su código (sin las respuestas correctas)"""
    quiz = db.query(models.Quizzes).filter(
        models.Quizzes.share_code == share_code.upper(),
        models.Quizzes.is_public.is_(True)
    ).first()

    if not quiz:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Código inválido o quiz no disponible"
        )

    # Obtener información del propietario
    owner = db.query(models.Users).filter(
        models.Users.id == quiz.user_id
    ).first()

    # Contar preguntas
    question_count = db.query(models.Questions).filter(
        models.Questions.quiz_id == quiz.id
    ).count()

    return SharedQuizInfo(
        id=quiz.id,
        title=quiz.title,
        created_at=quiz.created_at,
        owner_name=owner.name if owner else "Desconocido",
        question_count=question_count,
        share_code=quiz.share_code
    )


@router.get("/code/{share_code}/full", response_model=QuizResponse)
async def get_shared_quiz_full(
    share_code: str,
    db: db_dependency,
    current_user: current_user_dependency
):
    """Obtener un quiz compartido completo con preguntas y opciones para jugarlo"""
    quiz = db.query(models.Quizzes).filter(
        models.Quizzes.share_code == share_code.upper(),
        models.Quizzes.is_public.is_(True)
    ).first()

    if not quiz:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Código inválido o quiz no disponible"
        )

    # Obtener preguntas con sus opciones
    questions = db.query(models.Questions).filter(
        models.Questions.quiz_id == quiz.id
    ).all()

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


@router.get("/my-shared", response_model=list[SharedQuizInfo])
async def get_my_shared_quizzes(
    db: db_dependency,
    current_user: current_user_dependency
):
    """Obtener mis quizzes que tienen código de compartir activo"""
    quizzes = db.query(models.Quizzes).filter(
        models.Quizzes.user_id == current_user.id,
        models.Quizzes.share_code.isnot(None),
        models.Quizzes.is_public.is_(True)
    ).all()

    result = []
    for quiz in quizzes:
        question_count = db.query(models.Questions).filter(
            models.Questions.quiz_id == quiz.id
        ).count()
        result.append(SharedQuizInfo(
            id=quiz.id,
            title=quiz.title,
            created_at=quiz.created_at,
            owner_name=current_user.name,
            question_count=question_count,
            share_code=quiz.share_code
        ))

    return result

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from auth import get_db, get_current_user
from models import QuizHistory, Users
from schemas.history import QuizHistoryCreate, QuizHistoryResponse

router = APIRouter(
    prefix="/history",
    tags=["history"]
)


@router.post("/", response_model=QuizHistoryResponse)
def save_quiz_result(
    history: QuizHistoryCreate,
    db: Session = Depends(get_db),
    current_user: Users = Depends(get_current_user)
):
    """Guardar resultado de un quiz completado"""
    db_history = QuizHistory(
        user_id=current_user.id,
        quiz_id=history.quiz_id,
        quiz_title=history.quiz_title,
        score=history.score,
        correct_answers=history.correct_answers,
        total_questions=history.total_questions,
        time_spent=history.time_spent,
        is_external=history.is_external,
        owner_name=history.owner_name
    )
    db.add(db_history)
    db.commit()
    db.refresh(db_history)
    return db_history


@router.get("/", response_model=List[QuizHistoryResponse])
def get_my_history(
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: Users = Depends(get_current_user)
):
    """Obtener historial de quizzes completados por el usuario"""
    history = db.query(QuizHistory).filter(
        QuizHistory.user_id == current_user.id
    ).order_by(QuizHistory.completed_at.desc()).limit(limit).all()
    return history


@router.get("/stats")
def get_my_stats(
    db: Session = Depends(get_db),
    current_user: Users = Depends(get_current_user)
):
    """Obtener estadísticas generales del usuario"""
    history = db.query(QuizHistory).filter(
        QuizHistory.user_id == current_user.id
    ).all()

    if not history:
        return {
            "total_quizzes": 0,
            "average_score": 0,
            "total_correct": 0,
            "total_questions": 0,
            "total_time": 0,
            "external_quizzes": 0
        }

    total_quizzes = len(history)
    total_score = sum(h.score for h in history)
    total_correct = sum(h.correct_answers for h in history)
    total_questions = sum(h.total_questions for h in history)
    total_time = sum(h.time_spent for h in history)
    external_quizzes = sum(1 for h in history if h.is_external)

    return {
        "total_quizzes": total_quizzes,
        "average_score": round(total_score / total_quizzes) if total_quizzes > 0 else 0,
        "total_correct": total_correct,
        "total_questions": total_questions,
        "total_time": total_time,
        "external_quizzes": external_quizzes
    }


@router.delete("/{history_id}")
def delete_history_entry(
    history_id: int,
    db: Session = Depends(get_db),
    current_user: Users = Depends(get_current_user)
):
    """Eliminar una entrada del historial"""
    entry = db.query(QuizHistory).filter(
        QuizHistory.id == history_id,
        QuizHistory.user_id == current_user.id
    ).first()

    if not entry:
        raise HTTPException(status_code=404, detail="Entrada no encontrada")

    db.delete(entry)
    db.commit()
    return {"message": "Entrada eliminada"}

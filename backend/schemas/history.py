from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class QuizHistoryCreate(BaseModel):
    quiz_id: Optional[int] = None
    quiz_title: str
    score: int
    correct_answers: int
    total_questions: int
    time_spent: int
    is_external: bool = False
    owner_name: Optional[str] = None


class QuizHistoryResponse(BaseModel):
    id: int
    quiz_id: Optional[int]
    quiz_title: str
    score: int
    correct_answers: int
    total_questions: int
    time_spent: int
    is_external: bool
    owner_name: Optional[str]
    completed_at: datetime

    class Config:
        from_attributes = True

from pydantic import BaseModel
from typing import List
from datetime import datetime


class ChoiceBase(BaseModel):
    choice_text: str
    is_correct: bool


class ChoiceResponse(ChoiceBase):
    id: int
    question_id: int

    class Config:
        from_attributes = True


class QuestionBase(BaseModel):
    question_text: str
    answer_type: str = "options"  # "text" o "options"
    choices: List[ChoiceBase] = []


class QuestionResponse(BaseModel):
    id: int
    question_text: str
    answer_type: str
    quiz_id: int | None
    choices: List[ChoiceResponse]

    class Config:
        from_attributes = True


class QuizBase(BaseModel):
    title: str


class QuizResponse(BaseModel):
    id: int
    title: str
    created_at: datetime
    user_id: int
    questions: List[QuestionResponse]

    class Config:
        from_attributes = True


class QuizListResponse(BaseModel):
    id: int
    title: str
    created_at: datetime
    question_count: int

    class Config:
        from_attributes = True

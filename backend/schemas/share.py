from pydantic import BaseModel
from datetime import datetime


class ShareCodeResponse(BaseModel):
    share_code: str
    message: str


class SharedQuizInfo(BaseModel):
    id: int
    title: str
    created_at: datetime
    owner_name: str
    question_count: int
    share_code: str | None

    class Config:
        from_attributes = True

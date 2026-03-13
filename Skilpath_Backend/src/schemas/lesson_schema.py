from pydantic import BaseModel
from typing import Optional, List, Any
from datetime import datetime
from enum import Enum


class MarkStatus(str, Enum):
    completed = "completed"
    missed = "missed"
    difficult = "difficult"


class MarkLessonRequest(BaseModel):
    lesson_id: int
    plan_id: int
    status: MarkStatus

    class Config:
        use_enum_values = True


class ReferenceLink(BaseModel):
    label: str
    url: str


class LessonContentResponse(BaseModel):
    analogy: Optional[str] = None
    explanation: Optional[str] = None
    code: Optional[str] = None
    exercises: Optional[List[str]] = None
    references: Optional[List[ReferenceLink]] = None


class LessonResponse(BaseModel):
    id: int
    plan_id: int
    day_number: int
    scheduled_date: datetime
    topic: str
    phase: str
    difficulty: str
    estimated_minutes: int
    status: str
    is_regenerated: bool
    content_json: Optional[Any] = None

    class Config:
        from_attributes = True


class WeekGroup(BaseModel):
    week_number: int
    lessons: List[LessonResponse]


class TodayLessonResponse(BaseModel):
    lesson: Optional[LessonResponse]
    health: str
    days_behind: int
    message: Optional[str] = None
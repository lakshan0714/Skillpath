from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean, JSON, Enum as SqlEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from src.config.database import Base
import enum


class LessonStatus(str, enum.Enum):
    pending = "pending"
    completed = "completed"
    missed = "missed"
    difficult = "difficult"


class DifficultyLevel(str, enum.Enum):
    easy = "easy"
    medium = "medium"
    hard = "hard"


class Lesson(Base):
    __tablename__ = "lessons"

    id = Column(Integer, primary_key=True, index=True)
    plan_id = Column(Integer, ForeignKey("learning_plans.id", ondelete="CASCADE"), nullable=False)
    day_number = Column(Integer, nullable=False)
    scheduled_date = Column(DateTime(timezone=True), nullable=False)
    topic = Column(String(255), nullable=False)
    phase = Column(String(100), nullable=False)
    difficulty = Column(SqlEnum(DifficultyLevel, name="difficultylevel", create_type=True), nullable=False)
    estimated_minutes = Column(Integer, nullable=False)
    content_json = Column(JSON, nullable=True)
    source_doc_url = Column(String(255), nullable=True)
    is_regenerated = Column(Boolean, default=False)
    original_day_number = Column(Integer, nullable=True)
    status = Column(SqlEnum(LessonStatus, name="lessonstatus", create_type=True), default=LessonStatus.pending)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    plan = relationship("LearningPlan", back_populates="lessons")
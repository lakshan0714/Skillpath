from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum as SqlEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from src.config.database import Base
import enum


class EventType(str, enum.Enum):
    completed = "completed"
    missed = "missed"
    difficult = "difficult"
    regenerated = "regenerated"
    extended = "extended"


class PlanEvent(Base):
    __tablename__ = "plan_events"

    id = Column(Integer, primary_key=True, index=True)
    plan_id = Column(Integer, ForeignKey("learning_plans.id", ondelete="CASCADE"), nullable=False)
    lesson_id = Column(Integer, ForeignKey("lessons.id", ondelete="SET NULL"), nullable=True)
    event_type = Column(SqlEnum(EventType, name="eventtype", create_type=True), nullable=False)
    shift_amount = Column(Integer, default=0)
    triggered_at = Column(DateTime(timezone=True), server_default=func.now())

    plan = relationship("LearningPlan", back_populates="events")
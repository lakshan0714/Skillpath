from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, ARRAY, Enum as SqlEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from src.config.database import Base
import enum


class PlanStatus(str, enum.Enum):
    active = "active"
    completed = "completed"


class UserLevel(str, enum.Enum):
    beginner = "beginner"
    basics = "basics"
    intermediate = "intermediate"


class LearningPlan(Base):
    __tablename__ = "learning_plans"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    skill_id = Column(Integer, ForeignKey("skills.id", ondelete="CASCADE"), nullable=False)
    original_end_date = Column(DateTime(timezone=True), nullable=False)
    current_end_date = Column(DateTime(timezone=True), nullable=False)
    hours_per_day = Column(Integer, nullable=False)
    available_days = Column(String(100), nullable=False)
    level = Column(SqlEnum(UserLevel, name="userlevel", create_type=True), nullable=False)
    status = Column(SqlEnum(PlanStatus, name="planstatus", create_type=True), default=PlanStatus.active)
    days_behind = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", backref="learning_plans")
    skill = relationship("Skill", back_populates="learning_plans")
    lessons = relationship("Lesson", back_populates="plan", cascade="all, delete-orphan")
    events = relationship("PlanEvent", back_populates="plan", cascade="all, delete-orphan")
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from src.repository.lesson_repository import LessonRepository
from src.repository.plan_repository import PlanRepository
from src.repository.event_repository import EventRepository
from src.repository.skill_repository import SkillRepository
from src.services.plan_service import PlanService
from src.models.lesson import LessonStatus
import logging

logger = logging.getLogger(__name__)


class DashboardService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.lesson_repo = LessonRepository(db)
        self.plan_repo = PlanRepository(db)
        self.event_repo = EventRepository(db)
        self.skill_repo = SkillRepository(db)
        self.plan_service = PlanService(db)

    async def get_dashboard(self, user_id: int) -> dict:
        """
        Returns everything needed for the dashboard in one call.
        """
        # Get active plan
        plan = await self.plan_repo.get_active_plan_by_user(user_id)
        if not plan:
            return {"status_code": 200, "has_plan": False}

        # Get all lessons
        all_lessons = await self.lesson_repo.get_all_lessons_by_plan(plan.id)
        total_lessons = len(all_lessons)
        completed_count = len([l for l in all_lessons if l.status == LessonStatus.completed])
        missed_count = len([l for l in all_lessons if l.status == LessonStatus.missed])
        regenerated_count = len([l for l in all_lessons if l.is_regenerated])
        completion_percentage = round((completed_count / total_lessons) * 100) if total_lessons > 0 else 0

        # Get today's lesson
        today = datetime.now(timezone.utc).date()
        today_lesson = await self.lesson_repo.get_today_lesson(plan.id, today)

        # Get health
        health = await self.plan_service.get_health_status(plan.id)

        # Get streak
        streak = await self.plan_service.calculate_streak(plan.id)

        # Get recent activity
        recent_events = await self.event_repo.get_recent_events(plan.id, limit=5)

        # Current week progress
        current_day = completed_count + 1
        current_week = ((current_day - 1) // 5) + 1
        lessons_this_week = [
            l for l in all_lessons
            if ((l.day_number - 1) // 5) + 1 == current_week
        ]
        completed_this_week = len([l for l in lessons_this_week if l.status == LessonStatus.completed])

        # Get skill name
        skill = await self.skill_repo.get_skill_by_id(plan.skill_id)

        return {
            "status_code": 200,
            "has_plan": True,
            "plan_id": plan.id,
            "skill_name": skill.name if skill else "Unknown",
            "level": plan.level,
            "start_date": plan.created_at,
            "original_end_date": plan.original_end_date,
            "current_end_date": plan.current_end_date,
            "total_lessons": total_lessons,
            "completed_count": completed_count,
            "missed_count": missed_count,
            "regenerated_count": regenerated_count,
            "completion_percentage": completion_percentage,
            "streak": streak,
            "days_behind": health["days_behind"],
            "health_status": health["status"],
            "today_lesson": today_lesson,
            "recent_events": recent_events,
            "current_week": {
                "week_number": current_week,
                "completed": completed_this_week,
                "total": len(lessons_this_week)
            }
        }
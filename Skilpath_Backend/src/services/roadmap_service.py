from sqlalchemy.ext.asyncio import AsyncSession
from src.repository.lesson_repository import LessonRepository
from src.repository.plan_repository import PlanRepository
from src.repository.skill_repository import SkillRepository
from src.services.plan_service import PlanService
import logging

logger = logging.getLogger(__name__)


class RoadmapService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.lesson_repo = LessonRepository(db)
        self.plan_repo = PlanRepository(db)
        self.skill_repo = SkillRepository(db)
        self.plan_service = PlanService(db)

    async def get_full_roadmap(self, plan_id: int) -> dict:
        """
        Returns all lessons grouped by week number.
        Week is calculated from day_number.
        """
        plan = await self.plan_repo.get_plan_by_id(plan_id)
        if not plan:
            raise Exception("Plan not found")

        lessons = await self.lesson_repo.get_all_lessons_by_plan(plan_id)
        health = await self.plan_service.get_health_status(plan_id)

        # Group lessons by week
        weeks = {}
        for lesson in lessons:
            week_num = ((lesson.day_number - 1) // 5) + 1
            if week_num not in weeks:
                weeks[week_num] = []
            weeks[week_num].append(lesson)

        week_list = [
            {"week_number": k, "lessons": v}
            for k, v in sorted(weeks.items())
        ]

        return {
            "status_code": 200,
            "plan": plan,
            "weeks": week_list,
            "health": health["status"],
            "days_behind": health["days_behind"]
        }
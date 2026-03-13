from datetime import datetime, timezone, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from src.repository.skill_repository import SkillRepository
from src.repository.plan_repository import PlanRepository
from src.repository.lesson_repository import LessonRepository
from src.models.learning_plan import LearningPlan, UserLevel
from src.models.lesson import Lesson, DifficultyLevel, LessonStatus
from src.agents.roadmap_agent import generate_roadmap
from src.services.schedule_service import ScheduleService
from src.schemas.onboarding_schema import OnboardingCreate
import logging

logger = logging.getLogger(__name__)


class OnboardingService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.skill_repo = SkillRepository(db)
        self.plan_repo = PlanRepository(db)
        self.lesson_repo = LessonRepository(db)
        self.schedule_service = ScheduleService()

    async def create_plan(self, user_id: int, data: OnboardingCreate) -> dict:
        """
        Full onboarding flow:
        1. Get or create skill
        2. Call roadmap agent
        3. Assign dates to lessons
        4. Save plan and lessons to DB
        """
        try:
            # Step 1 — Get or create skill
            skill = await self.skill_repo.get_or_create_skill(data.skill_name)

            # Step 2 — Call AI agent
            raw_lessons = await generate_roadmap(
                skill=data.skill_name,
                level=data.level,
                timeline_weeks=data.timeline_weeks,
                hours_per_day=data.hours_per_day,
                available_days=data.available_days
            )

            # Step 3 — Assign calendar dates
            start_date = datetime.now(timezone.utc).date()
            lessons_with_dates = self.schedule_service.assign_dates_to_lessons(
                lessons=raw_lessons,
                start_date=start_date,
                available_days=data.available_days
            )

            # Step 4 — Calculate end date
            end_date = lessons_with_dates[-1]["scheduled_date"]

            # Step 5 — Create learning plan
            plan = LearningPlan(
                user_id=user_id,
                skill_id=skill.id,
                original_end_date=end_date,
                current_end_date=end_date,
                hours_per_day=data.hours_per_day,
                available_days=",".join(data.available_days),
                level=data.level,
                days_behind=0
            )
            saved_plan = await self.plan_repo.create_plan(plan)

            # Step 6 — Bulk insert lessons
            lesson_objects = []
            for l in lessons_with_dates:
                lesson_objects.append(Lesson(
                    plan_id=saved_plan.id,
                    day_number=l["day_number"],
                    scheduled_date=l["scheduled_date"],
                    topic=l["topic"],
                    phase=l["phase"],
                    difficulty=l["difficulty"],
                    estimated_minutes=l["estimated_minutes"],
                    status=LessonStatus.pending,
                    is_regenerated=False
                ))

            await self.lesson_repo.bulk_insert_lessons(lesson_objects)

            return {
                "status_code": 200,
                "message": "Plan created successfully",
                "plan_id": saved_plan.id
            }

        except Exception as e:
            logger.error(f"Onboarding failed: {str(e)}")
            raise Exception(f"Onboarding failed: {str(e)}")
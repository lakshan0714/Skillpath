from datetime import datetime, timezone, date
from sqlalchemy.ext.asyncio import AsyncSession
from src.repository.lesson_repository import LessonRepository
from src.repository.plan_repository import PlanRepository
from src.repository.event_repository import EventRepository
from src.repository.skill_repository import SkillRepository
from src.models.lesson import Lesson, LessonStatus
from src.models.plan_event import EventType
from src.services.plan_service import PlanService
from src.agents.regenerator_agent import regenerate_lesson
from src.agents.regenerator_agent import generate_lesson_content
from src.utils.data_utils import get_next_available_date
import logging
logger = logging.getLogger(__name__)


class LessonService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.lesson_repo = LessonRepository(db)
        self.plan_repo = PlanRepository(db)
        self.event_repo = EventRepository(db)
        self.skill_repo = SkillRepository(db)
        self.plan_service = PlanService(db)

    async def get_today_lesson(self, plan_id: int) -> dict:
        
        today = date.today()

        # Check for past missed lessons
        past_missed = await self.lesson_repo.get_past_missed_lessons(plan_id, today)
        if past_missed:
            for lesson in past_missed:
                lesson.status = LessonStatus.missed
                await self.lesson_repo.update_lesson(lesson)
                await self.plan_service.apply_shift(
                    plan_id=plan_id,
                    lesson_id=lesson.id,
                    event_type=EventType.missed
                )

        # Get today's lesson
        lesson = await self.lesson_repo.get_today_lesson(plan_id, today)
        health = await self.plan_service.get_health_status(plan_id)

        if not lesson:
            return {
                "status_code": 200,
                "lesson": None,
                "health": health["status"],
                "days_behind": health["days_behind"],
                "message": "No lesson scheduled for today"
            }

        return {
            "status_code": 200,
            "lesson": lesson,
            "health": health["status"],
            "days_behind": health["days_behind"],
            "message": None
        }
    
    async def mark_lesson(self, lesson_id: int, plan_id: int, status: str) -> dict:
        """
        Mark a lesson as completed, missed, or difficult.
        Applies shift logic and triggers regeneration if difficult.
        """
        lesson = await self.lesson_repo.get_lesson_by_id(lesson_id)

        if not lesson:
            raise Exception("Lesson not found")

        if status == "completed":
            lesson.status = LessonStatus.completed
            lesson.completed_at = datetime.now(timezone.utc)
            await self.lesson_repo.update_lesson(lesson)

            # Log event
            await self.event_repo.log_event(
                plan_id=plan_id,
                lesson_id=lesson_id,
                event_type=EventType.completed,
                shift_amount=0
            )

            # Check if all lessons done
            all_done = await self.plan_service.check_all_completed(plan_id)
            if all_done:
                plan = await self.plan_repo.get_plan_by_id(plan_id)
                await self.plan_repo.mark_plan_completed(plan)

            health = await self.plan_service.get_health_status(plan_id)
            return {
                "status_code": 200,
                "message": "Lesson completed",
                "health": health["status"],
                "days_behind": health["days_behind"]
            }

        elif status == "missed":
            
           

            # Log event
            await self.event_repo.log_event(
                plan_id=plan_id,
                lesson_id=lesson_id,
                event_type=EventType.missed,
                shift_amount=1
            )

            # Get plan available days
            plan = await self.plan_repo.get_plan_by_id(plan_id)
            available_days = plan.available_days.split(",")

            # Apply smart shift to all future lessons
            await self.plan_service.apply_shift(
                plan_id=plan_id,
                lesson_id=lesson_id,
                event_type=EventType.missed
            )

            # Reschedule missed lesson to next available date
            next_available = get_next_available_date(date.today(), available_days)
            lesson.scheduled_date = datetime.combine(
                next_available,
                datetime.min.time()
            ).replace(tzinfo=timezone.utc)
            lesson.status = LessonStatus.pending
            await self.lesson_repo.update_lesson(lesson)

            health = await self.plan_service.get_health_status(plan_id)
            return {
                "status_code": 200,
                "message": f"Lesson rescheduled to next available day ({next_available}).",
                "health": health["status"],
                "days_behind": health["days_behind"]
            }

        elif status == "difficult":
            # Mark lesson as difficult
            lesson.status = LessonStatus.difficult
            await self.lesson_repo.update_lesson(lesson)

            # Apply +1 shift immediately
            await self.plan_service.apply_shift(
                plan_id=plan_id,
                lesson_id=lesson_id,
                event_type=EventType.difficult
            )

            # Get skill name for agent
            plan = await self.plan_repo.get_plan_by_id(plan_id)
            skill = await self.skill_repo.get_skill_by_id(
                plan.skill_id
            )

            # Call regenerator agent
            new_content = await regenerate_lesson(
                skill=skill.name if skill else "the subject",
                topic=lesson.topic,
                level=plan.level
            )

            # Get the next scheduled date (tomorrow's slot after shift)
            tomorrow_lesson = await self.lesson_repo.get_today_lesson(
                plan_id,
                datetime.now(timezone.utc).date()
            )
            
            plan = await self.plan_repo.get_plan_by_id(plan_id)
            available_days = plan.available_days.split(",")
            next_available = get_next_available_date(date.today(), available_days)
            next_date = datetime.combine(
                next_available,
                datetime.min.time()
            ).replace(tzinfo=timezone.utc)

            # Insert regenerated lesson
            regen_lesson = Lesson(
                plan_id=plan_id,
                day_number=lesson.day_number,
                scheduled_date=next_date,
                topic=f"{lesson.topic} (Simplified)",
                phase=lesson.phase,
                difficulty=lesson.difficulty,
                estimated_minutes=lesson.estimated_minutes,
                content_json=new_content,
                is_regenerated=True,
                original_day_number=lesson.day_number,
                status=LessonStatus.pending
            )
            saved_regen = await self.lesson_repo.insert_regenerated_lesson(regen_lesson)

            # Log regeneration event
            await self.event_repo.log_event(
                plan_id=plan_id,
                lesson_id=saved_regen.id,
                event_type=EventType.regenerated,
                shift_amount=0
            )

            health = await self.plan_service.get_health_status(plan_id)
            return {
                "status_code": 200,
                "message": "Lesson regenerated and added to tomorrow.",
                "regenerated_lesson": saved_regen,
                "health": health["status"],
                "days_behind": health["days_behind"]
            }
            
    async def get_lesson_content(self, lesson_id: int) -> dict:
        """
        Returns lesson content for a given lesson.
        If content_json is already there — return it directly.
        If not — generate it via AI, save it, then return it.
        """
        lesson = await self.lesson_repo.get_lesson_by_id(lesson_id)

        if not lesson:
            raise Exception("Lesson not found")

        # Already has content — return directly
        if lesson.content_json:
            return {
                "status_code": 200,
                "lesson_id": lesson.id,
                "topic": lesson.topic,
                "phase": lesson.phase,
                "difficulty": lesson.difficulty,
                "estimated_minutes": lesson.estimated_minutes,
                "is_regenerated": lesson.is_regenerated,
                "content": lesson.content_json
            }

        plan = await self.plan_repo.get_plan_by_id(lesson.plan_id)

        if not plan:
            raise Exception("Plan not found for this lesson")

        # Fetch skill by ID
        skill = await self.skill_repo.get_skill_by_id(plan.skill_id)

        if not skill:
            raise Exception("Skill not found for this plan")

        
        content = await generate_lesson_content(
            skill=skill.name if skill else "the subject",
            topic=lesson.topic,
            level=plan.level
        )

        # Save generated content so next open is instant
        lesson.content_json = content
        await self.lesson_repo.update_lesson(lesson)

        return {
            "status_code": 200,
            "lesson_id": lesson.id,
            "topic": lesson.topic,
            "phase": lesson.phase,
            "difficulty": lesson.difficulty,
            "estimated_minutes": lesson.estimated_minutes,
            "is_regenerated": lesson.is_regenerated,
            "content": content
        }
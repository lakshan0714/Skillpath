from datetime import datetime, timezone, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from src.repository.plan_repository import PlanRepository
from src.repository.lesson_repository import LessonRepository
from src.repository.event_repository import EventRepository
from src.models.lesson import Lesson, LessonStatus
from src.models.plan_event import EventType
import logging
from src.utils.data_utils import get_next_available_date
logger = logging.getLogger(__name__)


class PlanService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.plan_repo = PlanRepository(db)
        self.lesson_repo = LessonRepository(db)
        self.event_repo = EventRepository(db)

    async def apply_shift(self, plan_id: int, lesson_id: int, event_type: str):
        """
        Shifts all future pending lessons to next available days.
        Respects user's available_days setting.
        """
       

        plan = await self.plan_repo.get_plan_by_id(plan_id)
        available_days = plan.available_days.split(",")

        # Get all future pending lessons ordered by date
        now = datetime.now(timezone.utc)
        future_lessons = await self.lesson_repo.get_future_pending_lessons(plan_id, now)

        if not future_lessons:
            return plan

        # Reschedule each lesson to next available date after previous one
        prev_date = future_lessons[0].scheduled_date.date()
        first_next = get_next_available_date(prev_date, available_days)

        # Shift first lesson to next available date
        future_lessons[0].scheduled_date = datetime.combine(
            first_next,
            datetime.min.time()
        ).replace(tzinfo=timezone.utc)

        # Each subsequent lesson gets next available date after the previous
        for i in range(1, len(future_lessons)):
            prev = future_lessons[i - 1].scheduled_date.date()
            next_date = get_next_available_date(prev, available_days)
            future_lessons[i].scheduled_date = datetime.combine(
                next_date,
                datetime.min.time()
            ).replace(tzinfo=timezone.utc)

        await self.db.commit()

        # Update plan end date to last lesson's new date
        last_date = future_lessons[-1].scheduled_date
        plan.current_end_date = last_date
        plan.days_behind += 1
        await self.plan_repo.update_plan(plan)

        # Log event
        await self.event_repo.log_event(
            plan_id=plan_id,
            lesson_id=lesson_id,
            event_type=event_type,
            shift_amount=1
        )

        return plan

    async def get_health_status(self, plan_id: int) -> dict:
        """
        Returns green / yellow / red based on days_behind.
        green  = 0 days behind
        yellow = 1 day behind
        red    = 2+ days behind
        """
        plan = await self.plan_repo.get_plan_by_id(plan_id)

        if plan.days_behind == 0:
            status = "green"
        elif plan.days_behind == 1:
            status = "yellow"
        else:
            status = "red"

        return {
            "status": status,
            "days_behind": plan.days_behind,
            "original_end_date": plan.original_end_date,
            "current_end_date": plan.current_end_date
        }

    async def extend_timeline(self, plan_id: int, days: int) -> dict:
        """
        User accepts timeline extension.
        Moves original_end_date forward and resets days_behind to 0.
        """
        plan = await self.plan_repo.get_plan_by_id(plan_id)
        plan.original_end_date = plan.original_end_date + timedelta(days=days)
        plan.days_behind = 0
        await self.plan_repo.update_plan(plan)

        # Log extension event
        await self.event_repo.log_event(
            plan_id=plan_id,
            lesson_id=None,
            event_type=EventType.extended,
            shift_amount=days
        )

        return {"message": f"Timeline extended by {days} days", "status_code": 200}

    async def calculate_streak(self, plan_id: int) -> int:
        """
        Counts consecutive completed days going backwards from today.
        Stops at first missed or gap.
        """
        lessons = await self.lesson_repo.get_all_lessons_by_plan(plan_id)
        completed = [
            l for l in lessons
            if l.status == LessonStatus.completed
        ]

        if not completed:
            return 0

        # Sort descending by date
        completed.sort(key=lambda x: x.scheduled_date, reverse=True)

        streak = 1
        for i in range(1, len(completed)):
            diff = (completed[i-1].scheduled_date - completed[i].scheduled_date).days
            if diff == 1:
                streak += 1
            else:
                break

        return streak

    async def check_all_completed(self, plan_id: int) -> bool:
        """Check if all lessons in a plan are completed."""
        lessons = await self.lesson_repo.get_all_lessons_by_plan(plan_id)
        return all(l.status == LessonStatus.completed for l in lessons)
    
    

    #--
    async def delete_plan(self, plan_id: int, user_id: int) -> dict:
        """
        Delete a plan and all its lessons.
        Verifies the plan belongs to the user first.
        """
        plan = await self.plan_repo.get_plan_by_id(plan_id)

        if not plan:
            raise Exception("Plan not found")

        if plan.user_id != user_id:
            raise Exception("Unauthorized")

        # Delete all lessons first
        await self.lesson_repo.delete_lessons_by_plan(plan_id)

        # Delete the plan
        await self.plan_repo.delete_plan(plan)

        return {"status_code": 200, "message": "Plan deleted successfully"}


    async def update_plan_settings(self, plan_id: int, user_id: int, available_days: list, hours_per_day: int) -> dict:
        """
        Update plan available days and hours.
        Reschedules all pending lessons with new dates.
        """
        plan = await self.plan_repo.get_plan_by_id(plan_id)

        if not plan:
            raise Exception("Plan not found")

        if plan.user_id != user_id:
            raise Exception("Unauthorized")

        # Reschedule all pending lessons
        await self.lesson_repo.reschedule_pending_lessons(
            plan_id=plan_id,
            available_days=available_days,
            hours_per_day=hours_per_day
        )

        # Update plan settings
        updated_plan = await self.plan_repo.update_plan_settings(
            plan=plan,
            available_days=",".join(available_days),
            hours_per_day=hours_per_day
        )

        return {
            "status_code": 200,
            "message": "Plan updated and lessons rescheduled",
            "plan_id": updated_plan.id
        }


    async def get_plan_details(self, plan_id: int, user_id: int) -> dict:
        """Get single plan details."""
        plan = await self.plan_repo.get_plan_by_id(plan_id)

        if not plan:
            raise Exception("Plan not found")

        if plan.user_id != user_id:
            raise Exception("Unauthorized")

        health = await self.get_health_status(plan_id)

        return {
            "status_code": 200,
            "plan_id": plan.id,
            "skill_id": plan.skill_id,
            "level": plan.level,
            "status": plan.status,
            "hours_per_day": plan.hours_per_day,
            "available_days": plan.available_days,
            "original_end_date": plan.original_end_date,
            "current_end_date": plan.current_end_date,
            "days_behind": plan.days_behind,
            "health": health["status"],
            "created_at": plan.created_at
        }
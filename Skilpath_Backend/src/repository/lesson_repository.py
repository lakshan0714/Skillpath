from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from sqlalchemy.exc import SQLAlchemyError
from src.models.lesson import Lesson, LessonStatus
from datetime import datetime, timedelta, timezone, date
from typing import List
from src.utils.data_utils import get_scheduled_dates

class LessonRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def bulk_insert_lessons(self, lessons: List[Lesson]):
        """Insert all lessons for a plan at once."""
        try:
            self.db.add_all(lessons)
            await self.db.commit()
        except SQLAlchemyError as e:
            await self.db.rollback()
            raise e

    async def get_lesson_by_id(self, lesson_id: int):
        """Get a single lesson by ID."""
        result = await self.db.execute(
            select(Lesson).where(Lesson.id == lesson_id)
        )
        return result.scalar_one_or_none()

    
    async def get_today_lesson(self, plan_id: int, today: date):
        """Get today's pending lesson by matching scheduled_date date part."""
        from sqlalchemy import func, cast, Date

        result = await self.db.execute(
            select(Lesson).where(
                Lesson.plan_id == plan_id,
                Lesson.status == LessonStatus.pending,
                cast(Lesson.scheduled_date, Date) == today
            ).order_by(Lesson.scheduled_date.asc()).limit(1)
        )
        return result.scalar_one_or_none()

    async def get_all_lessons_by_plan(self, plan_id: int):
        """Get all lessons for a plan ordered by day number."""
        result = await self.db.execute(
            select(Lesson).where(
                Lesson.plan_id == plan_id
            ).order_by(Lesson.day_number.asc())
        )
        return result.scalars().all()

    async def get_future_pending_lessons(self, plan_id: int, from_date: datetime):
        """Get all pending lessons scheduled after a given date."""
        result = await self.db.execute(
            select(Lesson).where(
                Lesson.plan_id == plan_id,
                Lesson.status == LessonStatus.pending,
                Lesson.scheduled_date >= from_date
            ).order_by(Lesson.scheduled_date.asc())
        )
        return result.scalars().all()

    async def shift_future_lessons(self, plan_id: int, from_date: datetime, days: int):
        """
        Add {days} to scheduled_date for all pending lessons
        from from_date onwards. This is the core shift operation.
        """
        try:
            from sqlalchemy import text
            await self.db.execute(
                text("""
                    UPDATE lessons
                    SET scheduled_date = scheduled_date + :interval
                    WHERE plan_id = :plan_id
                    AND status = 'pending'
                    AND scheduled_date >= :from_date
                """),
                {
                    "interval": timedelta(days=days),
                    "plan_id": plan_id,
                    "from_date": from_date
                }
            )
            await self.db.commit()
        except SQLAlchemyError as e:
            await self.db.rollback()
            raise e

    async def update_lesson(self, lesson: Lesson):
        """Save updates to a lesson."""
        try:
            await self.db.commit()
            await self.db.refresh(lesson)
            return lesson
        except SQLAlchemyError as e:
            await self.db.rollback()
            raise e

    async def insert_regenerated_lesson(self, lesson: Lesson):
        """Insert a newly regenerated lesson."""
        try:
            self.db.add(lesson)
            await self.db.commit()
            await self.db.refresh(lesson)
            return lesson
        except SQLAlchemyError as e:
            await self.db.rollback()
            raise e

    async def get_past_missed_lessons(self, plan_id: int, today: date):
        """Get lessons still pending but scheduled before today."""
        from sqlalchemy import cast, Date

        result = await self.db.execute(
            select(Lesson).where(
                Lesson.plan_id == plan_id,
                Lesson.status == LessonStatus.pending,
                cast(Lesson.scheduled_date, Date) < today
            ).order_by(Lesson.scheduled_date.asc())
        )
        return result.scalars().all()

    async def count_completed_lessons(self, plan_id: int):
        """Count how many lessons are completed."""
        result = await self.db.execute(
            select(Lesson).where(
                Lesson.plan_id == plan_id,
                Lesson.status == LessonStatus.completed
            )
        )
        return len(result.scalars().all())

    async def count_regenerated_lessons(self, plan_id: int):
        """Count how many lessons were regenerated."""
        result = await self.db.execute(
            select(Lesson).where(
                Lesson.plan_id == plan_id,
                Lesson.is_regenerated == True
            )
        )
        return len(result.scalars().all())

    async def delete_lessons_by_plan(self, plan_id: int):
        """Delete all lessons for a plan."""
        try:
            from sqlalchemy import delete
            from src.models.lesson import Lesson
            await self.db.execute(
                delete(Lesson).where(Lesson.plan_id == plan_id)
            )
            await self.db.commit()
        except SQLAlchemyError as e:
            await self.db.rollback()
            raise e

    async def reschedule_pending_lessons(self, plan_id: int, available_days: list, hours_per_day: int):
        """
        Reschedule all pending lessons from today onwards
        when user updates their available days or hours.
        """
        
        from datetime import datetime, timezone

        today = datetime.now(timezone.utc).date()

        # Get all pending lessons ordered by day_number
        result = await self.db.execute(
            select(Lesson).where(
                Lesson.plan_id == plan_id,
                Lesson.status == LessonStatus.pending
            ).order_by(Lesson.day_number.asc())
        )
        pending_lessons = result.scalars().all()

        if not pending_lessons:
            return

        # Assign new dates from today
        new_dates = get_scheduled_dates(today, available_days, len(pending_lessons))

        for i, lesson in enumerate(pending_lessons):
            lesson.scheduled_date = datetime.combine(
                new_dates[i],
                datetime.min.time()
            ).replace(tzinfo=timezone.utc)
            lesson.estimated_minutes = hours_per_day * 60

        await self.db.commit()
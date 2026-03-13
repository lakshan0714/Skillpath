from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
from src.models.plan_event import PlanEvent
from typing import List


class EventRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def log_event(self, plan_id: int, lesson_id: int, event_type: str, shift_amount: int = 0):
        """Log a plan event."""
        try:
            event = PlanEvent(
                plan_id=plan_id,
                lesson_id=lesson_id,
                event_type=event_type,
                shift_amount=shift_amount
            )
            self.db.add(event)
            await self.db.commit()
            await self.db.refresh(event)
            return event
        except SQLAlchemyError as e:
            await self.db.rollback()
            raise e

    async def get_recent_events(self, plan_id: int, limit: int = 5) -> List[PlanEvent]:
        """Get the most recent events for a plan."""
        result = await self.db.execute(
            select(PlanEvent).where(
                PlanEvent.plan_id == plan_id
            ).order_by(PlanEvent.triggered_at.desc()).limit(limit)
        )
        return result.scalars().all()

    async def get_all_events(self, plan_id: int) -> List[PlanEvent]:
        """Get all events for a plan."""
        result = await self.db.execute(
            select(PlanEvent).where(
                PlanEvent.plan_id == plan_id
            ).order_by(PlanEvent.triggered_at.asc())
        )
        return result.scalars().all()
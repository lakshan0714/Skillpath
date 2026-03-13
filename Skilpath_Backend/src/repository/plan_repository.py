from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
from src.models.learning_plan import LearningPlan, PlanStatus
from datetime import datetime, timezone


class PlanRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_plan(self, plan: LearningPlan):
        """Create a new learning plan."""
        try:
            self.db.add(plan)
            await self.db.commit()
            await self.db.refresh(plan)
            return plan
        except SQLAlchemyError as e:
            await self.db.rollback()
            raise e

    async def get_plan_by_id(self, plan_id: int):
        """Get learning plan by ID."""
        result = await self.db.execute(
            select(LearningPlan).where(LearningPlan.id == plan_id)
        )
        return result.scalar_one_or_none()

    async def get_active_plan_by_user(self, user_id: int):
        """Get the most recent active plan for a user."""
        result = await self.db.execute(
            select(LearningPlan).where(
                LearningPlan.user_id == user_id,
                LearningPlan.status == PlanStatus.active
            ).order_by(LearningPlan.created_at.desc()).limit(1)
        )
        return result.scalar_one_or_none()

    async def get_all_plans_by_user(self, user_id: int):
        """Get all plans for a user."""
        result = await self.db.execute(
            select(LearningPlan).where(
                LearningPlan.user_id == user_id
            ).order_by(LearningPlan.created_at.desc())
        )
        return result.scalars().all()

    async def update_plan(self, plan: LearningPlan):
        """Save updates to an existing plan."""
        try:
            await self.db.commit()
            await self.db.refresh(plan)
            return plan
        except SQLAlchemyError as e:
            await self.db.rollback()
            raise e

    async def mark_plan_completed(self, plan: LearningPlan):
        """Mark a plan as completed."""
        try:
            plan.status = PlanStatus.completed
            await self.db.commit()
            await self.db.refresh(plan)
            return plan
        except SQLAlchemyError as e:
            await self.db.rollback()
            raise e
        
    async def delete_plan(self, plan: LearningPlan):
        """Delete a plan."""
        try:
            await self.db.delete(plan)
            await self.db.commit()
        except SQLAlchemyError as e:
            await self.db.rollback()
            raise e

    async def update_plan_settings(self, plan: LearningPlan, available_days: str, hours_per_day: int):
        """Update plan available days and hours."""
        try:
            plan.available_days = available_days
            plan.hours_per_day = hours_per_day
            await self.db.commit()
            await self.db.refresh(plan)
            return plan
        except SQLAlchemyError as e:
            await self.db.rollback()
            raise e
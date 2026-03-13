from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from src.config.database import get_db
from src.schemas.plan_schema import ExtendPlanRequest, UpdatePlanRequest
from src.services.plan_service import PlanService
from src.repository.plan_repository import PlanRepository
from src.repository.skill_repository import SkillRepository
from src.dependencies.auth_dependencies import get_current_user
from src.models.user import User

profile_router = APIRouter()


@profile_router.get("/profile")
async def get_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Returns user info and all their plans."""
    plan_repo = PlanRepository(db)
    skill_repo = SkillRepository(db)

    try:
        all_plans = await plan_repo.get_all_plans_by_user(current_user.id)

        plans_data = []
        for plan in all_plans:
            skill = await skill_repo.get_skill_by_id(plan.skill_id)
            print(skill)
            plans_data.append({
                "plan_id": plan.id,
                "skill_name": skill.name if skill else "Unknown",
                "level": plan.level,
                "status": plan.status,
                "days_behind": plan.days_behind,
                "created_at": plan.created_at,
                "original_end_date": plan.original_end_date,
                "current_end_date": plan.current_end_date
            })

        return {
            "status_code": 200,
            "user": {
                "id": current_user.id,
                "username": current_user.username,
                "email": current_user.email,
                "joined": current_user.created_at
            },
            "plans": plans_data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@profile_router.get("/plan/{plan_id}")
async def get_plan(
    plan_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get single plan details."""
    service = PlanService(db)
    try:
        response = await service.get_plan_details(plan_id, current_user.id)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@profile_router.put("/plan/{plan_id}")
async def update_plan(
    plan_id: int,
    data: UpdatePlanRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Update plan available days and hours per day.
    Automatically reschedules all pending lessons.
    """
    service = PlanService(db)
    try:
        response = await service.update_plan_settings(
            plan_id=plan_id,
            user_id=current_user.id,
            available_days=data.available_days,
            hours_per_day=data.hours_per_day
        )
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@profile_router.delete("/plan/{plan_id}")
async def delete_plan(
    plan_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete a plan and all its lessons."""
    service = PlanService(db)
    try:
        response = await service.delete_plan(plan_id, current_user.id)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@profile_router.put("/plan/extend/{plan_id}")
async def extend_plan(
    plan_id: int,
    data: ExtendPlanRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Extend timeline by N days. Resets days_behind to 0."""
    service = PlanService(db)
    try:
        response = await service.extend_timeline(plan_id, data.days)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
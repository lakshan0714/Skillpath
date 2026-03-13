from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from src.config.database import get_db
from src.schemas.onboarding_schema import OnboardingCreate
from src.services.onboarding_service import OnboardingService
from src.dependencies.auth_dependencies import get_current_user
from src.models.user import User

onboarding_router = APIRouter()


@onboarding_router.post("/onboarding")
async def create_plan(
    data: OnboardingCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Submit onboarding form.
    Triggers roadmap agent and creates full lesson plan.
    """
    service = OnboardingService(db)
    try:
        response = await service.create_plan(user_id=current_user.id, data=data)
        if response.get("status_code") == 200:
            return response
        else:
            raise HTTPException(status_code=500, detail="Plan creation failed")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
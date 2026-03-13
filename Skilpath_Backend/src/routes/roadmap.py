from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from src.config.database import get_db
from src.services.roadmap_service import RoadmapService
from src.dependencies.auth_dependencies import get_current_user
from src.models.user import User

roadmap_router = APIRouter()


@roadmap_router.get("/roadmap/{plan_id}")
async def get_roadmap(
    plan_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Returns full roadmap grouped by week.
    """
    service = RoadmapService(db)
    try:
        response = await service.get_full_roadmap(plan_id)
        if response.get("status_code") == 200:
            return response
        else:
            raise HTTPException(status_code=404, detail="Roadmap not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
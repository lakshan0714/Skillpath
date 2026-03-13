from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from src.config.database import get_db
from src.services.dashboard_service import DashboardService
from src.dependencies.auth_dependencies import get_current_user
from src.models.user import User

dashboard_router = APIRouter()


@dashboard_router.get("/dashboard")
async def get_dashboard(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Returns all dashboard data in one call.
    Health, streak, today's lesson, recent activity, weekly progress.
    """
    service = DashboardService(db)
    try:
        response = await service.get_dashboard(user_id=current_user.id)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
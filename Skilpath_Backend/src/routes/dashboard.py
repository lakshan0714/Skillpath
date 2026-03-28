import traceback

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from src.config.database import get_db
from src.services.dashboard_service import DashboardService
from src.dependencies.auth_dependencies import get_current_user
from src.models.user import User

dashboard_router = APIRouter()


from typing import Optional

@dashboard_router.get("/dashboard")
async def get_dashboard(
    plan_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = DashboardService(db)
    try:
        response = await service.get_dashboard(
            user_id=current_user.id,
            plan_id=plan_id
        )
        return response
    except Exception as e:
        traceback.print_exc()   # <-- IMPORTANT
        raise HTTPException(status_code=500, detail=str(e))
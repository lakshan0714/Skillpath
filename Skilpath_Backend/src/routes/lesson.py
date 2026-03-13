from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from src.config.database import get_db
from src.schemas.lesson_schema import MarkLessonRequest
from src.services.lesson_service import LessonService
from src.dependencies.auth_dependencies import get_current_user
from src.models.user import User

lesson_router = APIRouter()


@lesson_router.get("/today/{plan_id}")
async def get_today_lesson(
    plan_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Returns today's lesson and current health status.
    Also auto-marks any past pending lessons as missed.
    """
    service = LessonService(db)
    try:
        response = await service.get_today_lesson(plan_id)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@lesson_router.get("/lesson/{lesson_id}/content")
async def get_lesson_content(
    lesson_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Returns full lesson content.
    Generates via AI if not yet created, returns directly if already exists.
    """
    service = LessonService(db)
    try:
        response = await service.get_lesson_content(lesson_id)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@lesson_router.post("/lesson/mark")
async def mark_lesson(
    data: MarkLessonRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Mark a lesson as completed, missed, or difficult.
    Applies shift logic and triggers regeneration if difficult.
    """
    service = LessonService(db)
    try:
        response = await service.mark_lesson(
            lesson_id=data.lesson_id,
            plan_id=data.plan_id,
            status=data.status
        )
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
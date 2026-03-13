from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from src.config.database import get_db
from src.repository.skill_repository import SkillRepository
from src.dependencies.auth_dependencies import get_current_user
from src.models.user import User

skills_router = APIRouter()


@skills_router.get("/skills")
async def get_all_skills(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Returns all available skills.
    Frontend uses this to show skill suggestions on onboarding.
    """
    repo = SkillRepository(db)
    try:
        skills = await repo.get_all_skills()
        return {
            "status_code": 200,
            "skills": [
                {"id": s.id, "name": s.name}
                for s in skills
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
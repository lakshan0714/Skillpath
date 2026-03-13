from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from src.models.skill import Skill


class SkillRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_skill_by_id(self, id: int):
        """Get skill by ID."""
        result = await self.db.execute(
            select(Skill).where(Skill.id == id).limit(1)
        )
        return result.scalar_one_or_none()
    
    async def get_skill_by_name(self, name: str):
        """Get skill by ID."""
        result = await self.db.execute(
            select(Skill).where(Skill.name == name)
        )
        return result.scalar_one_or_none()

    async def create_skill(self, name: str, doc_base_url: str = None):
        """Create a new skill."""
        skill = Skill(name=name, doc_base_url=doc_base_url)
        self.db.add(skill)
        await self.db.commit()
        await self.db.refresh(skill)
        return skill

    async def get_or_create_skill(self, name: str):
        """Get skill if exists, otherwise create it."""
        skill = await self.get_skill_by_name(name)
        if not skill:
            skill = await self.create_skill(name)
        return skill
    
    async def get_all_skills(self):
        """Get all skills."""
        result = await self.db.execute(
            select(Skill).order_by(Skill.name.asc())
        )
        return result.scalars().all()
from pydantic import BaseModel
from typing import List
from enum import Enum


class SkillLevel(str, Enum):
    beginner = "beginner"
    basics = "basics"
    intermediate = "intermediate"


class AvailableDay(str, Enum):
    monday = "monday"
    tuesday = "tuesday"
    wednesday = "wednesday"
    thursday = "thursday"
    friday = "friday"
    saturday = "saturday"
    sunday = "sunday"


class OnboardingCreate(BaseModel):
    skill_name: str
    timeline_weeks: int
    hours_per_day: int
    available_days: List[AvailableDay]
    level: SkillLevel

    class Config:
        use_enum_values = True
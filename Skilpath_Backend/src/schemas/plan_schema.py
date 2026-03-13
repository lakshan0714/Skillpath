from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from enum import Enum


class HealthStatus(str, Enum):
    green = "green"
    yellow = "yellow"
    red = "red"

class UpdatePlanRequest(BaseModel):
    available_days: List[str]
    hours_per_day: int

class PlanHealthResponse(BaseModel):
    status: HealthStatus
    days_behind: int
    original_end_date: datetime
    current_end_date: datetime

    class Config:
        from_attributes = True


class ExtendPlanRequest(BaseModel):
    days: int


class PlanResponse(BaseModel):
    id: int
    skill_name: str
    level: str
    start_date: datetime
    original_end_date: datetime
    current_end_date: datetime
    hours_per_day: int
    available_days: str
    status: str
    days_behind: int

    class Config:
        from_attributes = True
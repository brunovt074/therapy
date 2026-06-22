from datetime import datetime

from pydantic import BaseModel


class SpecialtyResponse(BaseModel):
    id: int
    name: str
    description: str | None
    duration_min: int
    color: str
    active: bool
    max_slots: int
    available_slots: int
    schedule_days: list[int] | None
    schedule_start: str | None
    schedule_end: str | None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

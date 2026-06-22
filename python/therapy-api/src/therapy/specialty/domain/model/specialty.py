from dataclasses import dataclass
from datetime import datetime


@dataclass(frozen=True)
class Specialty:
    name: str
    id: int = 0
    slug: str = ""
    description: str | None = None
    duration_min: int = 60
    color: str = "#7B8C76"
    active: bool = True
    max_slots: int = 1
    available_slots: int = 1
    schedule_days: list[int] | None = None
    schedule_start: str | None = None
    schedule_end: str | None = None
    created_at: datetime | None = None
    updated_at: datetime | None = None

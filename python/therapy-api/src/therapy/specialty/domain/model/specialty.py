from dataclasses import dataclass
from datetime import datetime


@dataclass(frozen=True)
class Specialty:
    name: str
    slug: str
    id: int = 0
    description: str | None = None
    duration_min: int = 45
    color: str = "#7B8C76"
    active: bool = True
    max_slots: int = 1
    available_slots: int = 1
    created_at: datetime | None = None
    updated_at: datetime | None = None

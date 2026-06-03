from dataclasses import dataclass
from datetime import datetime


@dataclass(frozen=True)
class BlockedSlot:
    start_at: datetime
    end_at: datetime
    id: int = 0
    reason: str | None = None
    recurring: bool = False
    created_at: datetime | None = None

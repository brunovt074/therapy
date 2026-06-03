from dataclasses import dataclass
from datetime import datetime


@dataclass(frozen=True)
class TimeSlot:
    start_at: datetime
    end_at: datetime
    available: bool = True

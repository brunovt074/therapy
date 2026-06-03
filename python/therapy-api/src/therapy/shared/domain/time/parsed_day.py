from dataclasses import dataclass
from datetime import datetime


@dataclass(frozen=True)
class ParsedDay:
    is_work_day: bool
    day_of_week: int
    day_start: datetime
    day_end: datetime

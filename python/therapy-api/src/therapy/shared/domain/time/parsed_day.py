from dataclasses import dataclass
from datetime import datetime


@dataclass(frozen=True)
class ParsedDay:
    is_work_day: bool
    day_of_week: int
    time_ranges: list[tuple[datetime, datetime]]

from dataclasses import dataclass
from datetime import datetime


@dataclass(frozen=True)
class Period:
    start_at: datetime
    end_at: datetime

from datetime import datetime

from pydantic import BaseModel


class TimeSlotResponse(BaseModel):
    start_at: datetime
    end_at: datetime
    available: bool

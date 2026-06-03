from datetime import datetime

from pydantic import BaseModel


class BlockedSlotResponse(BaseModel):
    id: int
    start_at: datetime
    end_at: datetime
    reason: str | None
    recurring: bool
    created_at: datetime

    class Config:
        from_attributes = True

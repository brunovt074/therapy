from datetime import datetime

from pydantic import BaseModel, Field


class BlockedSlotCreateRequest(BaseModel):
    start_at: datetime
    end_at: datetime
    reason: str | None = Field(default=None, max_length=500)
    recurring: bool = False

from dataclasses import dataclass
from datetime import datetime


@dataclass(frozen=True)
class BotSession:
    phone_number: str
    session_id: str
    id: int = 0
    created_at: datetime | None = None

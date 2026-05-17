from dataclasses import dataclass
from datetime import datetime


@dataclass(frozen=True)
class Session:
    expires_at: datetime
    token: str
    user_id: str
    id: str = ""
    ip_address: str | None = None
    user_agent: str | None = None
    created_at: datetime | None = None
    updated_at: datetime | None = None

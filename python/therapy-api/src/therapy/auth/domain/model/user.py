from dataclasses import dataclass
from datetime import datetime

from therapy.auth.domain.model.user_role import UserRole


@dataclass(frozen=True)
class User:
    name: str
    email: str
    id: str = ""
    email_verified: bool = False
    image: str | None = None
    role: UserRole = UserRole.STAFF
    created_at: datetime | None = None
    updated_at: datetime | None = None

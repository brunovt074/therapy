from dataclasses import dataclass
from datetime import datetime


@dataclass(frozen=True)
class Patient:
    full_name: str
    phone: str
    id: int = 0
    email: str | None = None
    birth_date: datetime | None = None
    notes: str | None = None
    medical_history: str | None = None
    created_at: datetime | None = None
    updated_at: datetime | None = None

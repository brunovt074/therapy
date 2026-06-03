from datetime import datetime

from pydantic import BaseModel


class PatientResponse(BaseModel):
    id: int
    full_name: str
    phone: str
    email: str | None
    birth_date: datetime | None
    notes: str | None
    medical_history: str | None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

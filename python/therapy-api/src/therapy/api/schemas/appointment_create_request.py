from datetime import datetime

from pydantic import BaseModel, Field


class AppointmentCreateRequest(BaseModel):
    patient_full_name: str = Field(min_length=1, max_length=255)
    patient_phone: str = Field(min_length=6, max_length=20)
    patient_email: str | None = Field(default=None, max_length=255)
    specialty_id: int
    start_at: datetime

from datetime import datetime

from pydantic import BaseModel, Field


class PatientCreateRequest(BaseModel):
    full_name: str = Field(min_length=1, max_length=255)
    phone: str = Field(min_length=6, max_length=20)
    email: str | None = Field(default=None, max_length=255)
    birth_date: datetime | None = None

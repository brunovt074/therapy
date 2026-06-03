from datetime import datetime

from pydantic import BaseModel


class AdminAppointmentResponse(BaseModel):
    id: int
    patient_id: int
    patient_name: str
    specialty_id: int
    specialty_name: str
    start_at: datetime
    end_at: datetime
    status: str
    notes: str | None
    admin_notes: str | None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

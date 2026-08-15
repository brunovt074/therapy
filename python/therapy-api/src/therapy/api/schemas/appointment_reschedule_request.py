from datetime import datetime

from pydantic import BaseModel


class AppointmentRescheduleRequest(BaseModel):
    start_at: datetime
    specialty_id: int | None = None


from pydantic import BaseModel

from therapy.api.schemas.admin_appointment_response import AdminAppointmentResponse


class CalendarDayResponse(BaseModel):
    date: str
    day_of_week: int
    appointments: list[AdminAppointmentResponse]

    class Config:
        from_attributes = True


class CalendarResponse(BaseModel):
    month: str
    days: list[CalendarDayResponse]

    class Config:
        from_attributes = True

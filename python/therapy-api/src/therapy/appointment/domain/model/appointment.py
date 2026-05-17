from dataclasses import dataclass
from datetime import datetime
from uuid import UUID

from therapy.appointment.domain.model.appointment_status import AppointmentStatus


@dataclass(frozen=True)
class Appointment:
    patient_id: int
    specialty_id: int
    start_at: datetime
    end_at: datetime
    id: int = 0
    status: AppointmentStatus = AppointmentStatus.PENDING
    confirmation_token: UUID | None = None
    cancel_token: UUID | None = None
    notes: str | None = None
    admin_notes: str | None = None
    confirmed_by: int | None = None
    created_at: datetime | None = None
    updated_at: datetime | None = None

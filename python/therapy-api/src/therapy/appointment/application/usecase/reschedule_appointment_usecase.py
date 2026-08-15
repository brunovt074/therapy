from dataclasses import replace
from datetime import UTC, datetime, timedelta

from therapy.appointment.application.service.business_hours import is_within_business_hours
from therapy.appointment.domain.model.appointment_status import AppointmentStatus
from therapy.appointment.domain.repository.appointment_repository import AppointmentRepository
from therapy.config import Settings
from therapy.shared.domain.errors.exceptions import (
    InvalidInputError,
    InvalidStatusTransitionError,
    NotFoundError,
    SlotNotAvailableError,
)
from therapy.specialty.domain.repository.specialty_repository import SpecialtyRepository

_ACTIVE_STATUSES = {AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED}


class RescheduleAppointmentUseCase:
    def __init__(
        self,
        appointment_repository: AppointmentRepository,
        specialty_repository: SpecialtyRepository,
        settings: Settings = Settings(),
    ):
        self._appointment_repository = appointment_repository
        self._specialty_repository = specialty_repository
        self._settings = settings

    async def execute(self, id: int, start_at: datetime, specialty_id: int | None = None):
        appointment = await self._appointment_repository.find_by_id(id)
        if not appointment:
            raise NotFoundError(f"Appointment with id {id} not found")

        if appointment.status not in _ACTIVE_STATUSES:
            raise InvalidStatusTransitionError(
                f"Cannot reschedule appointment with status {appointment.status.value}"
            )

        target_specialty_id = specialty_id or appointment.specialty_id
        specialty = await self._specialty_repository.find_by_id(target_specialty_id)
        if not specialty or not specialty.active:
            raise NotFoundError(f"Specialty with id {target_specialty_id} not found or inactive")

        now = datetime.now(UTC)
        if start_at < now:
            raise InvalidInputError("Cannot reschedule to a time in the past")

        end_at = start_at + timedelta(minutes=specialty.duration_min)

        if not is_within_business_hours(start_at, end_at, specialty, self._settings):
            raise InvalidInputError("Requested time is outside business hours for this specialty")

        existing = await self._appointment_repository.find_by_date_range(start_at, end_at)
        active = [a for a in existing if a.status in _ACTIVE_STATUSES and a.id != appointment.id]

        other_specialty = [a for a in active if a.specialty_id != target_specialty_id]
        if other_specialty:
            raise SlotNotAvailableError("This time slot is occupied by a different service")

        same_specialty = [a for a in active if a.specialty_id == target_specialty_id]
        if len(same_specialty) >= specialty.available_slots:
            raise SlotNotAvailableError("No slots available for this specialty at the requested time")

        updated = replace(
            appointment,
            specialty_id=target_specialty_id,
            start_at=start_at,
            end_at=end_at,
            updated_at=now,
        )
        return await self._appointment_repository.update(updated)

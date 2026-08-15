from dataclasses import replace
from datetime import datetime, timezone

from therapy.appointment.domain.model.appointment_status import AppointmentStatus
from therapy.appointment.domain.repository.appointment_repository import AppointmentRepository
from therapy.shared.domain.errors.exceptions import InvalidStatusTransitionError, NotFoundError


class AdminCancelAppointmentUseCase:
    def __init__(self, repository: AppointmentRepository):
        self._repository = repository

    async def execute(self, id: int) -> None:
        appointment = await self._repository.find_by_id(id)
        if not appointment:
            raise NotFoundError(f"Appointment with id {id} not found")

        if appointment.status == AppointmentStatus.CANCELLED:
            return

        if appointment.status not in (AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED):
            raise InvalidStatusTransitionError(
                f"Cannot cancel appointment with status {appointment.status.value}"
            )

        updated = replace(
            appointment,
            status=AppointmentStatus.CANCELLED,
            updated_at=datetime.now(timezone.utc),
        )
        await self._repository.update(updated)

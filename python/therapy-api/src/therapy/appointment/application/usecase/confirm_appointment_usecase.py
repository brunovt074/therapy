from dataclasses import replace
from datetime import datetime, timezone, timedelta

from therapy.appointment.domain.model.appointment_status import AppointmentStatus
from therapy.appointment.domain.repository.appointment_repository import AppointmentRepository
from therapy.shared.domain.errors.exceptions import (
    InvalidStatusTransitionError,
    NotFoundError,
)


class ConfirmAppointmentUseCase:
    def __init__(self, repository: AppointmentRepository):
        self._repository = repository

    async def execute(self, token: str) -> None:
        from uuid import UUID

        appointment = await self._repository.find_by_confirmation_token(UUID(token))
        if not appointment:
            raise NotFoundError("Appointment not found")

        if appointment.status != AppointmentStatus.PENDING:
            if appointment.status == AppointmentStatus.CONFIRMED:
                return
            raise InvalidStatusTransitionError(
                f"Cannot confirm appointment with status {appointment.status.value}"
            )

        token_age = datetime.now(timezone.utc) - appointment.created_at
        if token_age > timedelta(days=30):
            raise InvalidStatusTransitionError("Confirmation token has expired")

        updated = replace(
            appointment,
            status=AppointmentStatus.CONFIRMED,
            updated_at=datetime.now(timezone.utc),
        )
        await self._repository.update(updated)

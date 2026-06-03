from datetime import UTC, datetime, timedelta
from uuid import uuid4

from therapy.appointment.domain.model.appointment import Appointment
from therapy.appointment.domain.model.appointment_status import AppointmentStatus
from therapy.appointment.domain.repository.appointment_repository import AppointmentRepository
from therapy.patient.application.usecase.upsert_patient_usecase import UpsertPatientUseCase
from therapy.patient.domain.model.patient import Patient
from therapy.shared.domain.errors.exceptions import (
    InvalidInputError,
    NotFoundError,
    SlotNotAvailableError,
)
from therapy.specialty.domain.repository.specialty_repository import SpecialtyRepository


class CreateAppointmentUseCase:
    def __init__(
        self,
        appointment_repository: AppointmentRepository,
        specialty_repository: SpecialtyRepository,
        patient_use_case: UpsertPatientUseCase,
    ):
        self._appointment_repository = appointment_repository
        self._specialty_repository = specialty_repository
        self._patient_use_case = patient_use_case

    async def execute(
        self,
        patient: Patient,
        specialty_id: int,
        start_at: datetime,
    ) -> Appointment:
        specialty = await self._specialty_repository.find_by_id(specialty_id)
        if not specialty or not specialty.active:
            raise NotFoundError(f"Specialty with id {specialty_id} not found or inactive")

        if start_at < datetime.now(UTC):
            raise InvalidInputError("Cannot book appointments in the past")

        end_at = start_at + timedelta(minutes=specialty.duration_min)

        existing = await self._appointment_repository.find_by_date_range(
            start_at, end_at
        )
        same_specialty = [a for a in existing if a.specialty_id == specialty_id]
        if len(same_specialty) >= specialty.available_slots:
            raise SlotNotAvailableError("No slots available for this specialty at the requested time")

        saved_patient = await self._patient_use_case.execute(patient)

        appointment = Appointment(
            patient_id=saved_patient.id,
            specialty_id=specialty_id,
            start_at=start_at,
            end_at=end_at,
            status=AppointmentStatus.CONFIRMED,
            confirmation_token=uuid4(),
            cancel_token=uuid4(),
            created_at=datetime.now(UTC),
            updated_at=datetime.now(UTC),
        )

        return await self._appointment_repository.save(appointment)

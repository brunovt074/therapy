import pytest
from datetime import datetime, timezone, timedelta
from uuid import uuid4

from therapy.appointment.application.usecase.cancel_appointment_usecase import (
    CancelAppointmentUseCase,
)
from therapy.appointment.application.usecase.confirm_appointment_usecase import (
    ConfirmAppointmentUseCase,
)
from therapy.appointment.application.usecase.create_appointment_usecase import (
    CreateAppointmentUseCase,
)
from therapy.appointment.domain.model.appointment_status import AppointmentStatus
from therapy.patient.application.usecase.upsert_patient_usecase import (
    UpsertPatientUseCase,
)
from therapy.patient.domain.model.patient import Patient
from therapy.shared.domain.errors.exceptions import (
    InvalidInputError,
    InvalidStatusTransitionError,
    NotFoundError,
    SlotNotAvailableError,
)
from tests.factories import SpecialtyTestFactory
from tests.unit.appointment.fake_appointment_repository import FakeAppointmentRepository
from tests.unit.patient.fake_patient_repository import FakePatientRepository
from tests.unit.specialty.fake_specialty_repository import FakeSpecialtyRepository


class TestCreateAppointmentUseCase:
    async def test_should_create_appointment(self):
        specialty_repo = FakeSpecialtyRepository()
        appointment_repo = FakeAppointmentRepository()
        patient_repo = FakePatientRepository()
        patient_use_case = UpsertPatientUseCase(patient_repo)
        use_case = CreateAppointmentUseCase(
            appointment_repo, specialty_repo, patient_use_case
        )

        specialty = await specialty_repo.save(SpecialtyTestFactory.create(max_slots=4, available_slots=4))
        patient = Patient(full_name="Juan Perez", phone="1234567890")
        start_at = datetime.now(timezone.utc) + timedelta(days=1)

        result = await use_case.execute(patient, specialty.id, start_at)

        assert result.id == 1
        assert result.specialty_id == specialty.id
        assert result.status == AppointmentStatus.CONFIRMED
        assert result.confirmation_token is not None
        assert result.cancel_token is not None

    async def test_should_raise_when_specialty_not_found(self):
        specialty_repo = FakeSpecialtyRepository()
        appointment_repo = FakeAppointmentRepository()
        patient_repo = FakePatientRepository()
        patient_use_case = UpsertPatientUseCase(patient_repo)
        use_case = CreateAppointmentUseCase(
            appointment_repo, specialty_repo, patient_use_case
        )

        patient = Patient(full_name="Juan Perez", phone="1234567890")
        start_at = datetime.now(timezone.utc) + timedelta(days=1)

        with pytest.raises(NotFoundError):
            await use_case.execute(patient, 999, start_at)

    async def test_should_raise_when_specialty_inactive(self):
        specialty_repo = FakeSpecialtyRepository()
        appointment_repo = FakeAppointmentRepository()
        patient_repo = FakePatientRepository()
        patient_use_case = UpsertPatientUseCase(patient_repo)
        use_case = CreateAppointmentUseCase(
            appointment_repo, specialty_repo, patient_use_case
        )

        specialty = await specialty_repo.save(SpecialtyTestFactory.create(active=False))
        patient = Patient(full_name="Juan Perez", phone="1234567890")
        start_at = datetime.now(timezone.utc) + timedelta(days=1)

        with pytest.raises(NotFoundError):
            await use_case.execute(patient, specialty.id, start_at)

    async def test_should_raise_when_slot_not_available(self):
        specialty_repo = FakeSpecialtyRepository()
        appointment_repo = FakeAppointmentRepository()
        patient_repo = FakePatientRepository()
        patient_use_case = UpsertPatientUseCase(patient_repo)
        use_case = CreateAppointmentUseCase(
            appointment_repo, specialty_repo, patient_use_case
        )

        specialty = await specialty_repo.save(SpecialtyTestFactory.create(max_slots=1, available_slots=1))
        patient = Patient(full_name="Juan Perez", phone="1234567890")
        start_at = datetime.now(timezone.utc) + timedelta(days=1)

        await use_case.execute(patient, specialty.id, start_at)

        patient2 = Patient(full_name="Maria Lopez", phone="0987654321")
        with pytest.raises(SlotNotAvailableError):
            await use_case.execute(patient2, specialty.id, start_at)

    async def test_should_raise_when_appointment_in_past(self):
        specialty_repo = FakeSpecialtyRepository()
        appointment_repo = FakeAppointmentRepository()
        patient_repo = FakePatientRepository()
        patient_use_case = UpsertPatientUseCase(patient_repo)
        use_case = CreateAppointmentUseCase(
            appointment_repo, specialty_repo, patient_use_case
        )

        specialty = await specialty_repo.save(SpecialtyTestFactory.create())
        patient = Patient(full_name="Juan Perez", phone="1234567890")
        start_at = datetime.now(timezone.utc) - timedelta(days=1)

        with pytest.raises(InvalidInputError):
            await use_case.execute(patient, specialty.id, start_at)


class TestConfirmAppointmentUseCase:
    async def test_should_confirm_pending_appointment(self):
        repo = FakeAppointmentRepository()
        use_case = ConfirmAppointmentUseCase(repo)
        appointment = await repo.save(
            self._create_appointment(status=AppointmentStatus.PENDING)
        )

        await use_case.execute(str(appointment.confirmation_token))

        updated = await repo.find_by_id(appointment.id)
        assert updated.status == AppointmentStatus.CONFIRMED

    async def test_should_be_idempotent_for_confirmed(self):
        repo = FakeAppointmentRepository()
        use_case = ConfirmAppointmentUseCase(repo)
        appointment = await repo.save(
            self._create_appointment(status=AppointmentStatus.CONFIRMED)
        )

        await use_case.execute(str(appointment.confirmation_token))

        updated = await repo.find_by_id(appointment.id)
        assert updated.status == AppointmentStatus.CONFIRMED

    async def test_should_raise_when_not_found(self):
        repo = FakeAppointmentRepository()
        use_case = ConfirmAppointmentUseCase(repo)

        with pytest.raises(NotFoundError):
            await use_case.execute(str(uuid4()))

    async def test_should_raise_when_invalid_status(self):
        repo = FakeAppointmentRepository()
        use_case = ConfirmAppointmentUseCase(repo)
        appointment = await repo.save(
            self._create_appointment(status=AppointmentStatus.CANCELLED)
        )

        with pytest.raises(InvalidStatusTransitionError):
            await use_case.execute(str(appointment.confirmation_token))

    def _create_appointment(self, status: AppointmentStatus):
        from therapy.appointment.domain.model.appointment import Appointment
        return Appointment(
            id=0,
            patient_id=1,
            specialty_id=1,
            start_at=datetime.now(timezone.utc) + timedelta(days=1),
            end_at=datetime.now(timezone.utc) + timedelta(days=1, minutes=45),
            status=status,
            confirmation_token=uuid4(),
            cancel_token=uuid4(),
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )


class TestCancelAppointmentUseCase:
    async def test_should_cancel_pending_appointment(self):
        repo = FakeAppointmentRepository()
        use_case = CancelAppointmentUseCase(repo)
        appointment = await repo.save(
            self._create_appointment(status=AppointmentStatus.PENDING)
        )

        await use_case.execute(str(appointment.cancel_token))

        updated = await repo.find_by_id(appointment.id)
        assert updated.status == AppointmentStatus.CANCELLED

    async def test_should_cancel_confirmed_appointment(self):
        repo = FakeAppointmentRepository()
        use_case = CancelAppointmentUseCase(repo)
        appointment = await repo.save(
            self._create_appointment(status=AppointmentStatus.CONFIRMED)
        )

        await use_case.execute(str(appointment.cancel_token))

        updated = await repo.find_by_id(appointment.id)
        assert updated.status == AppointmentStatus.CANCELLED

    async def test_should_be_idempotent_for_cancelled(self):
        repo = FakeAppointmentRepository()
        use_case = CancelAppointmentUseCase(repo)
        appointment = await repo.save(
            self._create_appointment(status=AppointmentStatus.CANCELLED)
        )

        await use_case.execute(str(appointment.cancel_token))

        updated = await repo.find_by_id(appointment.id)
        assert updated.status == AppointmentStatus.CANCELLED

    async def test_should_raise_when_completed(self):
        repo = FakeAppointmentRepository()
        use_case = CancelAppointmentUseCase(repo)
        appointment = await repo.save(
            self._create_appointment(status=AppointmentStatus.COMPLETED)
        )

        with pytest.raises(InvalidStatusTransitionError):
            await use_case.execute(str(appointment.cancel_token))

    def _create_appointment(self, status: AppointmentStatus):
        from therapy.appointment.domain.model.appointment import Appointment
        return Appointment(
            id=0,
            patient_id=1,
            specialty_id=1,
            start_at=datetime.now(timezone.utc) + timedelta(days=1),
            end_at=datetime.now(timezone.utc) + timedelta(days=1, minutes=45),
            status=status,
            confirmation_token=uuid4(),
            cancel_token=uuid4(),
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )

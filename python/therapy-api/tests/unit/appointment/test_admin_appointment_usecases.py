from datetime import datetime, timedelta, timezone
from uuid import uuid4
from zoneinfo import ZoneInfo

import pytest

from therapy.appointment.application.usecase.admin_cancel_appointment_usecase import (
    AdminCancelAppointmentUseCase,
)
from therapy.appointment.application.usecase.reschedule_appointment_usecase import (
    RescheduleAppointmentUseCase,
)
from therapy.appointment.domain.model.appointment import Appointment
from therapy.appointment.domain.model.appointment_status import AppointmentStatus
from therapy.shared.domain.errors.exceptions import (
    InvalidInputError,
    InvalidStatusTransitionError,
    NotFoundError,
    SlotNotAvailableError,
)
from tests.factories import SpecialtyTestFactory
from tests.unit.appointment.fake_appointment_repository import FakeAppointmentRepository
from tests.unit.specialty.fake_specialty_repository import FakeSpecialtyRepository


def _future_business_time(days_ahead: int = 1) -> datetime:
    tz = ZoneInfo("America/Argentina/Buenos_Aires")
    target = datetime.now(tz) + timedelta(days=days_ahead)
    while target.weekday() == 6:
        target += timedelta(days=1)
    return target.replace(hour=9, minute=0, second=0, microsecond=0)


def _appointment(status: AppointmentStatus, specialty_id: int = 1, start_offset_days: int = 1):
    start_at = _future_business_time(start_offset_days)
    return Appointment(
        id=0,
        patient_id=1,
        specialty_id=specialty_id,
        start_at=start_at,
        end_at=start_at + timedelta(minutes=45),
        status=status,
        confirmation_token=uuid4(),
        cancel_token=uuid4(),
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )


class TestAdminCancelAppointmentUseCase:
    async def test_should_cancel_confirmed_appointment(self):
        repo = FakeAppointmentRepository()
        use_case = AdminCancelAppointmentUseCase(repo)
        appointment = await repo.save(_appointment(AppointmentStatus.CONFIRMED))

        await use_case.execute(appointment.id)

        updated = await repo.find_by_id(appointment.id)
        assert updated.status == AppointmentStatus.CANCELLED

    async def test_should_be_idempotent_for_cancelled(self):
        repo = FakeAppointmentRepository()
        use_case = AdminCancelAppointmentUseCase(repo)
        appointment = await repo.save(_appointment(AppointmentStatus.CANCELLED))

        await use_case.execute(appointment.id)

        updated = await repo.find_by_id(appointment.id)
        assert updated.status == AppointmentStatus.CANCELLED

    async def test_should_raise_when_completed(self):
        repo = FakeAppointmentRepository()
        use_case = AdminCancelAppointmentUseCase(repo)
        appointment = await repo.save(_appointment(AppointmentStatus.COMPLETED))

        with pytest.raises(InvalidStatusTransitionError):
            await use_case.execute(appointment.id)

    async def test_should_raise_when_not_found(self):
        repo = FakeAppointmentRepository()
        use_case = AdminCancelAppointmentUseCase(repo)

        with pytest.raises(NotFoundError):
            await use_case.execute(999)


class TestRescheduleAppointmentUseCase:
    async def test_should_reschedule_to_a_free_slot(self):
        appointment_repo = FakeAppointmentRepository()
        specialty_repo = FakeSpecialtyRepository()
        specialty = await specialty_repo.save(SpecialtyTestFactory.create(max_slots=1, available_slots=1))
        appointment = await appointment_repo.save(
            _appointment(AppointmentStatus.CONFIRMED, specialty_id=specialty.id)
        )
        use_case = RescheduleAppointmentUseCase(appointment_repo, specialty_repo)
        new_start = _future_business_time(3)

        result = await use_case.execute(appointment.id, new_start)

        assert result.start_at == new_start
        assert result.end_at == new_start + timedelta(minutes=specialty.duration_min)

    async def test_should_raise_when_target_slot_occupied_by_another_specialty(self):
        appointment_repo = FakeAppointmentRepository()
        specialty_repo = FakeSpecialtyRepository()
        specialty_a = await specialty_repo.save(SpecialtyTestFactory.create(name="A", max_slots=1, available_slots=1))
        specialty_b = await specialty_repo.save(SpecialtyTestFactory.create(name="B", max_slots=1, available_slots=1))
        target_start = _future_business_time(3)
        await appointment_repo.save(
            Appointment(
                id=0, patient_id=2, specialty_id=specialty_b.id,
                start_at=target_start, end_at=target_start + timedelta(minutes=45),
                status=AppointmentStatus.CONFIRMED,
                confirmation_token=uuid4(), cancel_token=uuid4(),
                created_at=datetime.now(timezone.utc), updated_at=datetime.now(timezone.utc),
            )
        )
        appointment = await appointment_repo.save(
            _appointment(AppointmentStatus.CONFIRMED, specialty_id=specialty_a.id)
        )
        use_case = RescheduleAppointmentUseCase(appointment_repo, specialty_repo)

        with pytest.raises(SlotNotAvailableError):
            await use_case.execute(appointment.id, target_start)

    async def test_should_allow_moving_within_its_own_current_slot(self):
        appointment_repo = FakeAppointmentRepository()
        specialty_repo = FakeSpecialtyRepository()
        specialty = await specialty_repo.save(SpecialtyTestFactory.create(max_slots=1, available_slots=1))
        appointment = await appointment_repo.save(
            _appointment(AppointmentStatus.CONFIRMED, specialty_id=specialty.id)
        )
        use_case = RescheduleAppointmentUseCase(appointment_repo, specialty_repo)

        result = await use_case.execute(appointment.id, appointment.start_at, specialty.id)

        assert result.id == appointment.id
        assert result.start_at == appointment.start_at

    async def test_should_raise_when_rescheduling_to_the_past(self):
        appointment_repo = FakeAppointmentRepository()
        specialty_repo = FakeSpecialtyRepository()
        specialty = await specialty_repo.save(SpecialtyTestFactory.create())
        appointment = await appointment_repo.save(
            _appointment(AppointmentStatus.CONFIRMED, specialty_id=specialty.id)
        )
        use_case = RescheduleAppointmentUseCase(appointment_repo, specialty_repo)
        past = datetime.now(timezone.utc) - timedelta(days=1)

        with pytest.raises(InvalidInputError):
            await use_case.execute(appointment.id, past)

    async def test_should_raise_when_cancelled(self):
        appointment_repo = FakeAppointmentRepository()
        specialty_repo = FakeSpecialtyRepository()
        specialty = await specialty_repo.save(SpecialtyTestFactory.create())
        appointment = await appointment_repo.save(
            _appointment(AppointmentStatus.CANCELLED, specialty_id=specialty.id)
        )
        use_case = RescheduleAppointmentUseCase(appointment_repo, specialty_repo)

        with pytest.raises(InvalidStatusTransitionError):
            await use_case.execute(appointment.id, datetime.now(timezone.utc) + timedelta(days=5))

from therapy.appointment.application.usecase.get_available_slots_usecase import (
    GetAvailableSlotsUseCase,
)
from therapy.config import Settings
from therapy.specialty.domain.model.specialty import Specialty
from tests.unit.appointment.fake_appointment_repository import FakeAppointmentRepository
from tests.unit.blocked_slot.fake_blocked_slot_repository import FakeBlockedSlotRepository
from tests.unit.specialty.fake_specialty_repository import FakeSpecialtyRepository


async def _build_usecase(specialty: Specialty) -> tuple[GetAvailableSlotsUseCase, int]:
    specialty_repo = FakeSpecialtyRepository()
    saved = await specialty_repo.save(specialty)
    use_case = GetAvailableSlotsUseCase(
        appointment_repository=FakeAppointmentRepository(),
        blocked_slot_repository=FakeBlockedSlotRepository(),
        specialty_repository=specialty_repo,
        settings=Settings(
            database_url="postgresql+asyncpg://u:p@localhost/db",
            jwt_secret="x" * 32,
            app_url="http://localhost",
            admin_email="admin@example.com",
            cors_origins="http://localhost",
        ),
    )
    return use_case, saved.id


async def test_uses_specialty_own_schedule_when_configured():
    specialty = Specialty(
        name="Kinesiologia",
        duration_min=30,
        max_slots=1,
        available_slots=1,
        schedule_days=[1],
        schedule_start="09:00",
        schedule_end="10:00",
    )
    use_case, specialty_id = await _build_usecase(specialty)

    tuesday_slots = await use_case.execute("2026-09-01", specialty_id)
    assert [s.start_at.strftime("%H:%M") for s in tuesday_slots] == ["09:00", "09:30"]

    monday_slots = await use_case.execute("2026-08-31", specialty_id)
    assert monday_slots == []


async def test_falls_back_to_global_hours_when_specialty_has_no_own_schedule():
    specialty = Specialty(
        name="Nutricion",
        duration_min=60,
        max_slots=1,
        available_slots=1,
        schedule_days=None,
        schedule_start=None,
        schedule_end=None,
    )
    use_case, specialty_id = await _build_usecase(specialty)

    slots = await use_case.execute("2026-08-31", specialty_id)
    assert [s.start_at.strftime("%H:%M") for s in slots] == ["08:00", "09:00", "10:00", "11:00", "16:00", "17:00", "18:00", "19:00"]


async def test_falls_back_to_global_hours_when_schedule_only_partially_configured():
    specialty = Specialty(
        name="Fonoaudiologia",
        duration_min=60,
        max_slots=1,
        available_slots=1,
        schedule_days=[1],
        schedule_start=None,
        schedule_end=None,
    )
    use_case, specialty_id = await _build_usecase(specialty)

    monday_slots = await use_case.execute("2026-08-31", specialty_id)
    assert len(monday_slots) > 0

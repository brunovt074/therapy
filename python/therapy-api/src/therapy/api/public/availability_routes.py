from calendar import monthrange

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from therapy.api.schemas.time_slot_response import TimeSlotResponse
from therapy.appointment.application.usecase.get_available_slots_usecase import (
    GetAvailableSlotsUseCase,
)
from therapy.appointment.infrastructure.sqlalchemy_appointment_repository import (
    SqlAlchemyAppointmentRepository,
)
from therapy.blocked_slot.infrastructure.sqlalchemy_blocked_slot_repository import (
    SqlAlchemyBlockedSlotRepository,
)
from therapy.config import Settings
from therapy.shared.infrastructure.database.connection import get_db
from therapy.shared.infrastructure.database.tables.clinic_settings_table import ClinicSettingsTable
from therapy.specialty.infrastructure.sqlalchemy_specialty_repository import (
    SqlAlchemySpecialtyRepository,
)

router = APIRouter()


async def _build_use_case(db: AsyncSession) -> tuple[GetAvailableSlotsUseCase, Settings]:
    settings_row = await db.scalar(select(ClinicSettingsTable).where(ClinicSettingsTable.id == 1))
    settings = Settings()
    if settings_row:
        settings.business_hours_ranges = settings_row.business_hours_ranges
        settings.business_work_days = settings_row.business_work_days
    appointment_repo = SqlAlchemyAppointmentRepository(db)
    blocked_repo = SqlAlchemyBlockedSlotRepository(db)
    specialty_repo = SqlAlchemySpecialtyRepository(db)
    use_case = GetAvailableSlotsUseCase(appointment_repo, blocked_repo, specialty_repo, settings=settings)
    return use_case, settings


@router.get("", response_model=list[TimeSlotResponse])
async def get_available_slots(date: str, specialty_id: int, db: AsyncSession = Depends(get_db)):
    use_case, _ = await _build_use_case(db)
    return await use_case.execute(date, specialty_id, enforce_advance_notice=True)


@router.get("/days", response_model=list[str])
async def get_available_days(
    month: str = Query(..., pattern=r"^\d{4}-\d{2}$"),
    specialty_id: int = Query(...),
    db: AsyncSession = Depends(get_db),
):
    use_case, _ = await _build_use_case(db)
    year, month_num = map(int, month.split("-"))
    _, last_day = monthrange(year, month_num)

    available_dates = []
    for day in range(1, last_day + 1):
        date_str = f"{year}-{month_num:02d}-{day:02d}"
        slots = await use_case.execute(date_str, specialty_id, enforce_advance_notice=True)
        if any(s.available for s in slots):
            available_dates.append(date_str)

    return available_dates

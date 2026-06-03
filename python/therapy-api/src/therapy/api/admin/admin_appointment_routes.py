from calendar import monthrange
from datetime import datetime
from zoneinfo import ZoneInfo

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from therapy.api.schemas.admin_appointment_response import AdminAppointmentResponse
from therapy.api.schemas.calendar_response import CalendarDayResponse, CalendarResponse
from therapy.appointment.infrastructure.sqlalchemy_appointment_repository import (
    SqlAlchemyAppointmentRepository,
)
from therapy.config import Settings
from therapy.shared.infrastructure.database.connection import get_db
from therapy.shared.infrastructure.database.tables.patient_table import PatientTable
from therapy.shared.infrastructure.database.tables.specialty_table import SpecialtyTable

router = APIRouter()


async def _get_names(db: AsyncSession, ids: set[int], table):
    if not ids:
        return {}
    result = await db.execute(select(table).where(table.id.in_(ids)))
    return {row.id: row for row in result.scalars().all()}


def _enrich_appointments(appointments, patients, specialties):
    return [
        {
            "id": a.id,
            "patient_id": a.patient_id,
            "patient_name": patients[a.patient_id].full_name if a.patient_id in patients else "Unknown",
            "specialty_id": a.specialty_id,
            "specialty_name": specialties[a.specialty_id].name if a.specialty_id in specialties else "Unknown",
            "start_at": a.start_at,
            "end_at": a.end_at,
            "status": a.status.value,
            "notes": a.notes,
            "admin_notes": a.admin_notes,
            "created_at": a.created_at,
            "updated_at": a.updated_at,
        }
        for a in appointments
    ]


@router.get("", response_model=list[AdminAppointmentResponse])
async def list_appointments(
    db: AsyncSession = Depends(get_db),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
):
    repo = SqlAlchemyAppointmentRepository(db)
    appointments, total = await repo.find_paginated(
        from_date=None, to_date=None, status=None,
        specialty_id=None, patient_id=None,
        page=page, per_page=per_page,
    )

    patient_ids = {a.patient_id for a in appointments}
    specialty_ids = {a.specialty_id for a in appointments}

    patients = await _get_names(db, patient_ids, PatientTable)
    specialties = await _get_names(db, specialty_ids, SpecialtyTable)

    return _enrich_appointments(appointments, patients, specialties)


@router.get("/calendar", response_model=CalendarResponse)
async def get_calendar(
    db: AsyncSession = Depends(get_db),
    month: str = Query(None, pattern=r"^\d{4}-\d{2}$"),
):
    settings = Settings()
    tz = ZoneInfo(settings.timezone)

    if not month:
        now = datetime.now(tz)
        month = f"{now.year}-{now.month:02d}"

    year, month_num = map(int, month.split("-"))
    _, last_day = monthrange(year, month_num)

    from_date = datetime(year, month_num, 1, 0, 0, 0, tzinfo=tz)
    to_date = datetime(year, month_num, last_day, 23, 59, 59, tzinfo=tz)

    repo = SqlAlchemyAppointmentRepository(db)
    appointments = await repo.find_by_date_range(from_date, to_date)

    patient_ids = {a.patient_id for a in appointments}
    specialty_ids = {a.specialty_id for a in appointments}

    patients = await _get_names(db, patient_ids, PatientTable)
    specialties = await _get_names(db, specialty_ids, SpecialtyTable)

    enriched = _enrich_appointments(appointments, patients, specialties)

    days_map: dict[str, list] = {}
    for a in enriched:
        day_key = a["start_at"].strftime("%Y-%m-%d")
        if day_key not in days_map:
            days_map[day_key] = []
        days_map[day_key].append(a)

    days = [
        CalendarDayResponse(
            date=day_key,
            day_of_week=datetime.strptime(day_key, "%Y-%m-%d").weekday(),
            appointments=apps,
        )
        for day_key, apps in sorted(days_map.items())
    ]

    return CalendarResponse(month=month, days=days)

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from therapy.api.schemas.settings_response import SettingsResponse
from therapy.api.schemas.settings_update_request import SettingsUpdateRequest
from therapy.config import Settings
from therapy.shared.infrastructure.database.connection import get_db
from therapy.shared.infrastructure.database.tables.clinic_settings_table import ClinicSettingsTable

router = APIRouter()

_base_settings = Settings()

_DEFAULT_RANGES = [
    {"start": "08:00", "end": "12:00"},
    {"start": "16:00", "end": "20:00"},
]
_DEFAULT_WORK_DAYS = [0, 1, 2, 3, 4, 5]


async def _load_settings(db: AsyncSession) -> ClinicSettingsTable:
    row = await db.scalar(select(ClinicSettingsTable).where(ClinicSettingsTable.id == 1))
    if row is None:
        row = ClinicSettingsTable(
            id=1,
            business_hours_ranges=_DEFAULT_RANGES,
            business_work_days=_DEFAULT_WORK_DAYS,
        )
        db.add(row)
        await db.flush()
        await db.refresh(row)
    return row


@router.get("", response_model=SettingsResponse)
async def get_settings(db: AsyncSession = Depends(get_db)):
    row = await _load_settings(db)
    return SettingsResponse(
        timezone=_base_settings.timezone,
        business_hours_ranges=row.business_hours_ranges,
        business_work_days=row.business_work_days,
    )


@router.patch("", response_model=SettingsResponse)
async def update_settings(request: SettingsUpdateRequest, db: AsyncSession = Depends(get_db)):
    if not any([request.business_hours_ranges, request.business_work_days]):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="At least one setting must be provided",
        )

    row = await _load_settings(db)

    if request.business_hours_ranges is not None:
        row.business_hours_ranges = [{"start": r.start, "end": r.end} for r in request.business_hours_ranges]
    if request.business_work_days is not None:
        row.business_work_days = request.business_work_days

    row.updated_at = datetime.now(timezone.utc)
    await db.flush()

    return SettingsResponse(
        timezone=_base_settings.timezone,
        business_hours_ranges=row.business_hours_ranges,
        business_work_days=row.business_work_days,
    )

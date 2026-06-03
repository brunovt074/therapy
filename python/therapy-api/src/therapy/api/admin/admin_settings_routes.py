from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from therapy.api.schemas.settings_response import SettingsResponse
from therapy.api.schemas.settings_update_request import SettingsUpdateRequest
from therapy.config import Settings
from therapy.shared.infrastructure.database.connection import get_db

router = APIRouter()

_settings = Settings()


@router.get("", response_model=SettingsResponse)
async def get_settings(db: AsyncSession = Depends(get_db)):
    return SettingsResponse(
        timezone=_settings.timezone,
        business_hours_start=_settings.business_hours_start,
        business_hours_end=_settings.business_hours_end,
        business_work_days=_settings.business_work_days,
    )


@router.patch("", response_model=SettingsResponse)
async def update_settings(request: SettingsUpdateRequest, db: AsyncSession = Depends(get_db)):
    if not any([request.business_hours_start, request.business_hours_end, request.business_work_days]):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="At least one setting must be provided",
        )

    current = _settings

    if request.business_hours_start is not None:
        current.business_hours_start = request.business_hours_start
    if request.business_hours_end is not None:
        current.business_hours_end = request.business_hours_end
    if request.business_work_days is not None:
        current.business_work_days = request.business_work_days

    return SettingsResponse(
        timezone=current.timezone,
        business_hours_start=current.business_hours_start,
        business_hours_end=current.business_hours_end,
        business_work_days=current.business_work_days,
    )

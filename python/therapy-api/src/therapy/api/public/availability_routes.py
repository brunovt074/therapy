from fastapi import APIRouter, Depends
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
from therapy.shared.infrastructure.database.connection import get_db
from therapy.specialty.infrastructure.sqlalchemy_specialty_repository import (
    SqlAlchemySpecialtyRepository,
)

router = APIRouter()

@router.get("", response_model=list[TimeSlotResponse])
async def get_available_slots(date: str, specialty_id: int, db: AsyncSession = Depends(get_db)):
    appointment_repo = SqlAlchemyAppointmentRepository(db)
    blocked_repo = SqlAlchemyBlockedSlotRepository(db)
    specialty_repo = SqlAlchemySpecialtyRepository(db)
    use_case = GetAvailableSlotsUseCase(appointment_repo, blocked_repo, specialty_repo)
    slots = await use_case.execute(date, specialty_id)
    return slots

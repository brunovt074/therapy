from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from therapy.api.schemas.blocked_slot_create_request import BlockedSlotCreateRequest
from therapy.api.schemas.blocked_slot_response import BlockedSlotResponse
from therapy.blocked_slot.domain.model.blocked_slot import BlockedSlot
from therapy.blocked_slot.infrastructure.sqlalchemy_blocked_slot_repository import (
    SqlAlchemyBlockedSlotRepository,
)
from therapy.shared.infrastructure.database.connection import get_db

router = APIRouter()

@router.get("", response_model=list[BlockedSlotResponse])
async def list_blocked_slots(db: AsyncSession = Depends(get_db)):
    repo = SqlAlchemyBlockedSlotRepository(db)
    return await repo.find_all()

@router.post("", response_model=BlockedSlotResponse, status_code=status.HTTP_201_CREATED)
async def create_blocked_slot(request: BlockedSlotCreateRequest, db: AsyncSession = Depends(get_db)):
    repo = SqlAlchemyBlockedSlotRepository(db)
    blocked = BlockedSlot(
        start_at=request.start_at,
        end_at=request.end_at,
        reason=request.reason,
        recurring=request.recurring,
    )
    result = await repo.save(blocked)
    return result

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_blocked_slot(id: int, db: AsyncSession = Depends(get_db)):
    repo = SqlAlchemyBlockedSlotRepository(db)
    await repo.delete_by_id(id)
    return None

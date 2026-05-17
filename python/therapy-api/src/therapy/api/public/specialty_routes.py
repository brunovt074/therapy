from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from therapy.api.schemas.specialty_response import SpecialtyResponse
from therapy.shared.infrastructure.database.connection import get_db
from therapy.specialty.infrastructure.sqlalchemy_specialty_repository import (
    SqlAlchemySpecialtyRepository,
)

router = APIRouter()

@router.get("", response_model=list[SpecialtyResponse])
async def list_active_specialties(db: AsyncSession = Depends(get_db)):
    repo = SqlAlchemySpecialtyRepository(db)
    return await repo.find_active()

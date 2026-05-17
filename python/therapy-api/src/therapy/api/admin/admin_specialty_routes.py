from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from therapy.api.schemas.specialty_create_request import SpecialtyCreateRequest
from therapy.api.schemas.specialty_response import SpecialtyResponse
from therapy.shared.infrastructure.database.connection import get_db
from therapy.specialty.application.usecase.create_specialty_usecase import CreateSpecialtyUseCase
from therapy.specialty.application.usecase.deactivate_specialty_usecase import (
    DeactivateSpecialtyUseCase,
)
from therapy.specialty.application.usecase.update_specialty_usecase import UpdateSpecialtyUseCase
from therapy.specialty.domain.model.specialty import Specialty
from therapy.specialty.infrastructure.sqlalchemy_specialty_repository import (
    SqlAlchemySpecialtyRepository,
)

router = APIRouter()

@router.get("", response_model=list[SpecialtyResponse])
async def list_specialties(db: AsyncSession = Depends(get_db)):
    repo = SqlAlchemySpecialtyRepository(db)
    return await repo.find_all()

@router.post("", response_model=SpecialtyResponse, status_code=status.HTTP_201_CREATED)
async def create_specialty(request: SpecialtyCreateRequest, db: AsyncSession = Depends(get_db)):
    repo = SqlAlchemySpecialtyRepository(db)
    use_case = CreateSpecialtyUseCase(repo)
    specialty = Specialty(
        name=request.name,
        slug=request.slug,
        description=request.description,
        duration_min=request.duration_min,
        color=request.color,
        max_slots=request.max_slots,
        available_slots=request.available_slots,
    )
    result = await use_case.execute(specialty)
    return result

@router.patch("/{id}", response_model=SpecialtyResponse)
async def update_specialty(id: int, request: SpecialtyCreateRequest, db: AsyncSession = Depends(get_db)):
    repo = SqlAlchemySpecialtyRepository(db)
    use_case = UpdateSpecialtyUseCase(repo)
    specialty = Specialty(
        id=id,
        name=request.name,
        slug=request.slug,
        description=request.description,
        duration_min=request.duration_min,
        color=request.color,
        max_slots=request.max_slots,
        available_slots=request.available_slots,
    )
    result = await use_case.execute(specialty)
    return result

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def deactivate_specialty(id: int, db: AsyncSession = Depends(get_db)):
    repo = SqlAlchemySpecialtyRepository(db)
    use_case = DeactivateSpecialtyUseCase(repo)
    await use_case.execute(id)
    return None

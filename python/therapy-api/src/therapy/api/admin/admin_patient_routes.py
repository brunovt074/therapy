from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from therapy.api.schemas.patient_create_request import PatientCreateRequest
from therapy.api.schemas.patient_response import PatientResponse
from therapy.api.schemas.patient_update_request import PatientUpdateRequest
from therapy.patient.application.usecase.create_patient_usecase import CreatePatientUseCase
from therapy.patient.application.usecase.deactivate_patient_usecase import DeactivatePatientUseCase
from therapy.patient.application.usecase.update_patient_usecase import UpdatePatientUseCase
from therapy.patient.domain.model.patient import Patient
from therapy.patient.infrastructure.sqlalchemy_patient_repository import SqlAlchemyPatientRepository
from therapy.shared.domain.errors.exceptions import NotFoundError
from therapy.shared.infrastructure.database.connection import get_db

router = APIRouter()


@router.get("", response_model=list[PatientResponse])
async def list_patients(
    db: AsyncSession = Depends(get_db),
    q: str | None = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
):
    repo = SqlAlchemyPatientRepository(db)
    patients, total = await repo.find_paginated(q, page, per_page)
    return patients


@router.post("", response_model=PatientResponse, status_code=status.HTTP_201_CREATED)
async def create_patient(request: PatientCreateRequest, db: AsyncSession = Depends(get_db)):
    repo = SqlAlchemyPatientRepository(db)
    use_case = CreatePatientUseCase(repo)
    patient = Patient(
        full_name=request.full_name,
        phone=request.phone,
        email=request.email,
        birth_date=request.birth_date,
        notes=request.notes,
        medical_history=request.medical_history,
    )
    return await use_case.execute(patient)


@router.get("/{id}", response_model=PatientResponse)
async def get_patient(id: int, db: AsyncSession = Depends(get_db)):
    repo = SqlAlchemyPatientRepository(db)
    patient = await repo.find_by_id(id)
    if not patient:
        raise NotFoundError(f"Patient with id {id} not found")
    return patient


@router.patch("/{id}", response_model=PatientResponse)
async def update_patient(id: int, request: PatientUpdateRequest, db: AsyncSession = Depends(get_db)):
    repo = SqlAlchemyPatientRepository(db)
    use_case = UpdatePatientUseCase(repo)
    return await use_case.execute(id, request.model_dump(exclude_unset=True))


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def deactivate_patient(id: int, db: AsyncSession = Depends(get_db)):
    repo = SqlAlchemyPatientRepository(db)
    use_case = DeactivatePatientUseCase(repo)
    await use_case.execute(id)
    return None

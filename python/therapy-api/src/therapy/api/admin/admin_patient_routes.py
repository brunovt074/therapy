from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from therapy.api.schemas.paginated_response import PaginatedResponse
from therapy.api.schemas.patient_create_request import PatientCreateRequest
from therapy.api.schemas.patient_detail_response import PatientDetailResponse
from therapy.api.schemas.patient_response import PatientResponse
from therapy.api.schemas.patient_update_request import PatientUpdateRequest
from therapy.patient.application.usecase.create_patient_usecase import CreatePatientUseCase
from therapy.patient.application.usecase.delete_patient_usecase import DeletePatientUseCase
from therapy.patient.application.usecase.update_patient_usecase import UpdatePatientUseCase
from therapy.patient.infrastructure.sqlalchemy_patient_repository import SqlAlchemyPatientRepository
from therapy.shared.infrastructure.database.connection import get_db

router = APIRouter()


@router.get("", response_model=PaginatedResponse[PatientResponse])
async def list_patients(
    db: AsyncSession = Depends(get_db),
    q: str | None = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
):
    repo = SqlAlchemyPatientRepository(db)
    patients, total = await repo.find_paginated(q, page, per_page)
    return PaginatedResponse(total=total, items=patients, page=page, page_size=per_page)


@router.post("", response_model=PatientDetailResponse, status_code=status.HTTP_201_CREATED)
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
    created = await use_case.execute(patient)
    appointment_count = await repo.count_appointments_by_patient(created.id)
    return PatientDetailResponse(
        id=created.id,
        full_name=created.full_name,
        phone=created.phone,
        email=created.email,
        birth_date=created.birth_date,
        notes=created.notes,
        medical_history=created.medical_history,
        created_at=created.created_at,
        updated_at=created.updated_at,
        appointment_count=appointment_count,
    )


@router.get("/{id}", response_model=PatientDetailResponse)
async def get_patient(id: int, db: AsyncSession = Depends(get_db)):
    from therapy.shared.domain.errors.exceptions import NotFoundError
    repo = SqlAlchemyPatientRepository(db)
    patient = await repo.find_by_id(id)
    if not patient:
        raise NotFoundError(f"Patient with id {id} not found")
    appointment_count = await repo.count_appointments_by_patient(id)
    return PatientDetailResponse(
        id=patient.id,
        full_name=patient.full_name,
        phone=patient.phone,
        email=patient.email,
        birth_date=patient.birth_date,
        notes=patient.notes,
        medical_history=patient.medical_history,
        created_at=patient.created_at,
        updated_at=patient.updated_at,
        appointment_count=appointment_count,
    )


@router.patch("/{id}", response_model=PatientResponse)
async def update_patient(id: int, request: PatientUpdateRequest, db: AsyncSession = Depends(get_db)):
    repo = SqlAlchemyPatientRepository(db)
    use_case = UpdatePatientUseCase(repo)
    return await use_case.execute(id, request)


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_patient(id: int, db: AsyncSession = Depends(get_db)):
    repo = SqlAlchemyPatientRepository(db)
    use_case = DeletePatientUseCase(repo)
    await use_case.execute(id)
    return None

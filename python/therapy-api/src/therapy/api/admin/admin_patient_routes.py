from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from therapy.api.schemas.patient_response import PatientResponse
from therapy.patient.infrastructure.sqlalchemy_patient_repository import SqlAlchemyPatientRepository
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

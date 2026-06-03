from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from therapy.api.schemas.appointment_create_request import AppointmentCreateRequest
from therapy.api.schemas.appointment_response import AppointmentResponse
from therapy.appointment.application.usecase.cancel_appointment_usecase import (
    CancelAppointmentUseCase,
)
from therapy.appointment.application.usecase.confirm_appointment_usecase import (
    ConfirmAppointmentUseCase,
)
from therapy.appointment.application.usecase.create_appointment_usecase import (
    CreateAppointmentUseCase,
)
from therapy.appointment.infrastructure.sqlalchemy_appointment_repository import (
    SqlAlchemyAppointmentRepository,
)
from therapy.patient.application.usecase.upsert_patient_usecase import UpsertPatientUseCase
from therapy.patient.domain.model.patient import Patient
from therapy.patient.infrastructure.sqlalchemy_patient_repository import SqlAlchemyPatientRepository
from therapy.shared.infrastructure.database.connection import get_db
from therapy.specialty.infrastructure.sqlalchemy_specialty_repository import (
    SqlAlchemySpecialtyRepository,
)

router = APIRouter()

@router.post("", response_model=AppointmentResponse, status_code=status.HTTP_201_CREATED)
async def create_appointment(request: AppointmentCreateRequest, db: AsyncSession = Depends(get_db)):
    appointment_repo = SqlAlchemyAppointmentRepository(db)
    specialty_repo = SqlAlchemySpecialtyRepository(db)
    patient_repo = SqlAlchemyPatientRepository(db)
    patient_use_case = UpsertPatientUseCase(patient_repo)
    use_case = CreateAppointmentUseCase(appointment_repo, specialty_repo, patient_use_case)

    patient = Patient(
        full_name=request.patient_full_name,
        phone=request.patient_phone,
        email=request.patient_email,
    )
    result = await use_case.execute(patient, request.specialty_id, request.start_at)
    return result

@router.get("/confirm/{token}")
async def confirm_appointment(token: str, db: AsyncSession = Depends(get_db)):
    repo = SqlAlchemyAppointmentRepository(db)
    use_case = ConfirmAppointmentUseCase(repo)
    await use_case.execute(token)
    return {"message": "Appointment confirmed"}

@router.get("/cancel/{token}")
async def cancel_appointment(token: str, db: AsyncSession = Depends(get_db)):
    repo = SqlAlchemyAppointmentRepository(db)
    use_case = CancelAppointmentUseCase(repo)
    await use_case.execute(token)
    return {"message": "Appointment cancelled"}

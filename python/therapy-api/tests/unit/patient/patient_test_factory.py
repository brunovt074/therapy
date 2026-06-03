from datetime import datetime, timezone

from therapy.patient.domain.model.patient import Patient


class PatientTestFactory:
    @staticmethod
    def create(
        id: int = 0,
        full_name: str = "Juan Perez",
        phone: str = "1234567890",
        email: str | None = "juan@test.com",
        birth_date: datetime | None = None,
        notes: str | None = None,
        medical_history: str | None = None,
        created_at: datetime | None = None,
        updated_at: datetime | None = None,
    ) -> Patient:
        return Patient(
            id=id,
            full_name=full_name,
            phone=phone,
            email=email,
            birth_date=birth_date,
            notes=notes,
            medical_history=medical_history,
            created_at=created_at or datetime.now(timezone.utc),
            updated_at=updated_at or datetime.now(timezone.utc),
        )

import pytest

from therapy.patient.application.usecase.upsert_patient_usecase import (
    UpsertPatientUseCase,
)
from therapy.patient.domain.model.patient import Patient
from tests.unit.patient.fake_patient_repository import FakePatientRepository


class TestUpsertPatientUseCase:
    async def test_should_create_new_patient(self):
        repo = FakePatientRepository()
        use_case = UpsertPatientUseCase(repo)
        patient = Patient(full_name="Juan Perez", phone="1234567890")

        result = await use_case.execute(patient)

        assert result.id == 1
        assert result.full_name == "Juan Perez"
        assert result.phone == "1234567890"

    async def test_should_update_existing_patient_by_phone(self):
        repo = FakePatientRepository()
        existing = Patient(full_name="Juan Perez", phone="1234567890")
        saved = await repo.save(existing)
        use_case = UpsertPatientUseCase(repo)
        updated = Patient(full_name="Juan Perez Actualizado", phone="1234567890")

        result = await use_case.execute(updated)

        assert result.id == saved.id
        assert result.full_name == "Juan Perez Actualizado"

    async def test_should_update_existing_patient_by_email(self):
        repo = FakePatientRepository()
        existing = Patient(full_name="Juan Perez", phone="1111111111", email="juan@test.com")
        saved = await repo.save(existing)
        use_case = UpsertPatientUseCase(repo)
        updated = Patient(full_name="Juan Perez Actualizado", phone="2222222222", email="juan@test.com")

        result = await use_case.execute(updated)

        assert result.id == saved.id
        assert result.full_name == "Juan Perez Actualizado"
        assert result.phone == "2222222222"

    async def test_should_create_new_when_no_match(self):
        repo = FakePatientRepository()
        existing = Patient(full_name="Juan Perez", phone="1111111111")
        await repo.save(existing)
        use_case = UpsertPatientUseCase(repo)
        new_patient = Patient(full_name="Maria Lopez", phone="2222222222")

        result = await use_case.execute(new_patient)

        assert result.id == 2
        assert result.full_name == "Maria Lopez"

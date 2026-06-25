import pytest

from therapy.patient.application.usecase.create_patient_usecase import CreatePatientUseCase
from therapy.patient.domain.model.patient import Patient
from therapy.shared.domain.errors.exceptions import AlreadyExistsError
from tests.unit.patient.fake_patient_repository import FakePatientRepository


class TestCreatePatientUseCase:
    async def test_should_create_patient_successfully(self):
        repo = FakePatientRepository()
        use_case = CreatePatientUseCase(repo)
        patient = Patient(full_name="Maria Lopez", phone="1234567890")

        result = await use_case.execute(patient)

        assert result.id == 1
        assert result.full_name == "Maria Lopez"
        assert result.phone == "1234567890"
        assert result.created_at is not None
        assert result.updated_at is not None

    async def test_should_raise_already_exists_error_on_duplicate_phone(self):
        repo = FakePatientRepository()
        use_case = CreatePatientUseCase(repo)
        existing = Patient(full_name="Juan Perez", phone="1234567890")
        await repo.save(existing)

        duplicate = Patient(full_name="Otro Perez", phone="1234567890")

        with pytest.raises(AlreadyExistsError):
            await use_case.execute(duplicate)

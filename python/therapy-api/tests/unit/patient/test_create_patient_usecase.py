import pytest

from therapy.patient.application.usecase.create_patient_usecase import CreatePatientUseCase
from therapy.patient.domain.model.patient import Patient
from therapy.shared.domain.errors.exceptions import AlreadyExistsError
from tests.unit.patient.fake_patient_repository import FakePatientRepository


class TestCreatePatientUseCase:
    async def test_should_create_patient(self):
        repo = FakePatientRepository()
        use_case = CreatePatientUseCase(repo)
        patient = Patient(full_name="Juan Perez", phone="1234567890")

        result = await use_case.execute(patient)

        assert result.id == 1
        assert result.full_name == "Juan Perez"
        assert result.phone == "1234567890"
        assert result.active is True

    async def test_should_create_patient_with_notes(self):
        repo = FakePatientRepository()
        use_case = CreatePatientUseCase(repo)
        patient = Patient(full_name="Maria Lopez", phone="0987654321", notes="alergia al ibuprofeno", medical_history="HTA")

        result = await use_case.execute(patient)

        assert result.notes == "alergia al ibuprofeno"
        assert result.medical_history == "HTA"

    async def test_should_raise_if_phone_already_exists(self):
        repo = FakePatientRepository()
        existing = Patient(full_name="Juan Perez", phone="1234567890")
        await repo.save(existing)
        use_case = CreatePatientUseCase(repo)
        duplicate = Patient(full_name="Otro Nombre", phone="1234567890")

        with pytest.raises(AlreadyExistsError):
            await use_case.execute(duplicate)

import pytest

from therapy.api.schemas.patient_update_request import PatientUpdateRequest
from therapy.patient.application.usecase.update_patient_usecase import UpdatePatientUseCase
from therapy.patient.domain.model.patient import Patient
from therapy.shared.domain.errors.exceptions import NotFoundError
from tests.unit.patient.fake_patient_repository import FakePatientRepository


class TestUpdatePatientUseCase:
    async def test_should_update_patient_preserving_created_at(self):
        repo = FakePatientRepository()
        saved = await repo.save(Patient(full_name="Juan Perez", phone="1234567890"))
        original_created_at = saved.created_at
        use_case = UpdatePatientUseCase(repo)
        update_request = PatientUpdateRequest(full_name="Juan Perez Actualizado")

        result = await use_case.execute(saved.id, update_request)

        assert result.full_name == "Juan Perez Actualizado"
        assert result.created_at == original_created_at

    async def test_should_update_updated_at_on_update(self):
        repo = FakePatientRepository()
        saved = await repo.save(Patient(full_name="Juan Perez", phone="1234567890"))
        original_updated_at = saved.updated_at
        use_case = UpdatePatientUseCase(repo)
        update_request = PatientUpdateRequest(full_name="Juan Perez Actualizado")

        result = await use_case.execute(saved.id, update_request)

        assert result.updated_at is not None
        assert result.updated_at >= original_updated_at

    async def test_should_raise_not_found_error_for_missing_id(self):
        repo = FakePatientRepository()
        use_case = UpdatePatientUseCase(repo)
        update_request = PatientUpdateRequest(full_name="Nadie")

        with pytest.raises(NotFoundError):
            await use_case.execute(999, update_request)

    async def test_should_preserve_existing_fields_not_in_update(self):
        repo = FakePatientRepository()
        saved = await repo.save(
            Patient(full_name="Maria Lopez", phone="5555555555", email="maria@test.com")
        )
        use_case = UpdatePatientUseCase(repo)
        update_request = PatientUpdateRequest(full_name="Maria Lopez Actualizada")

        result = await use_case.execute(saved.id, update_request)

        assert result.full_name == "Maria Lopez Actualizada"
        assert result.phone == "5555555555"
        assert result.email == "maria@test.com"

    async def test_should_apply_only_provided_fields(self):
        repo = FakePatientRepository()
        saved = await repo.save(
            Patient(full_name="Carlos", phone="1111111111", notes="nota original")
        )
        use_case = UpdatePatientUseCase(repo)
        update_request = PatientUpdateRequest(notes="nota actualizada")

        result = await use_case.execute(saved.id, update_request)

        assert result.notes == "nota actualizada"
        assert result.full_name == "Carlos"
        assert result.phone == "1111111111"

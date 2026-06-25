import pytest

from therapy.patient.application.usecase.delete_patient_usecase import DeletePatientUseCase
from therapy.patient.domain.model.patient import Patient
from therapy.shared.domain.errors.exceptions import NotFoundError
from tests.unit.patient.fake_patient_repository import FakePatientRepository


class TestDeletePatientUseCase:
    async def test_should_delete_patient_by_id(self):
        repo = FakePatientRepository()
        saved = await repo.save(Patient(full_name="Juan Perez", phone="1234567890"))
        use_case = DeletePatientUseCase(repo)

        await use_case.execute(saved.id)

        assert await repo.find_by_id(saved.id) is None

    async def test_should_call_delete_with_correct_id(self):
        repo = FakePatientRepository()
        saved = await repo.save(Patient(full_name="Juan Perez", phone="1234567890"))
        use_case = DeletePatientUseCase(repo)

        await use_case.execute(saved.id)

        remaining = list(repo._store.values())
        assert len(remaining) == 0

    async def test_should_raise_not_found_error_for_missing_id(self):
        repo = FakePatientRepository()
        use_case = DeletePatientUseCase(repo)

        with pytest.raises(NotFoundError):
            await use_case.execute(999)

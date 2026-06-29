import pytest

from therapy.patient.application.usecase.deactivate_patient_usecase import DeactivatePatientUseCase
from therapy.patient.domain.model.patient import Patient
from therapy.shared.domain.errors.exceptions import NotFoundError
from tests.unit.patient.fake_patient_repository import FakePatientRepository
from tests.unit.patient.patient_test_factory import PatientTestFactory


class TestDeactivatePatientUseCase:
    async def test_should_deactivate_patient(self):
        repo = FakePatientRepository()
        saved = await repo.save(PatientTestFactory.create())
        use_case = DeactivatePatientUseCase(repo)

        await use_case.execute(saved.id)

        patient = await repo.find_by_id(saved.id)
        assert patient.active is False

    async def test_should_not_appear_in_paginated_after_deactivation(self):
        repo = FakePatientRepository()
        saved = await repo.save(PatientTestFactory.create())
        use_case = DeactivatePatientUseCase(repo)
        await use_case.execute(saved.id)

        patients, total = await repo.find_paginated(None, 1, 20)

        assert total == 0
        assert len(patients) == 0

    async def test_should_raise_if_not_found(self):
        repo = FakePatientRepository()
        use_case = DeactivatePatientUseCase(repo)

        with pytest.raises(NotFoundError):
            await use_case.execute(999)

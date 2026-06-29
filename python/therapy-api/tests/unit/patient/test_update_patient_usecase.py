import pytest

from therapy.patient.application.usecase.update_patient_usecase import UpdatePatientUseCase
from therapy.patient.domain.model.patient import Patient
from therapy.shared.domain.errors.exceptions import NotFoundError
from tests.unit.patient.fake_patient_repository import FakePatientRepository
from tests.unit.patient.patient_test_factory import PatientTestFactory


class TestUpdatePatientUseCase:
    async def test_should_update_patient_fields(self):
        repo = FakePatientRepository()
        saved = await repo.save(PatientTestFactory.create(phone="1234567890"))
        use_case = UpdatePatientUseCase(repo)

        result = await use_case.execute(saved.id, {"full_name": "Nombre Actualizado", "notes": "nueva nota"})

        assert result.full_name == "Nombre Actualizado"
        assert result.notes == "nueva nota"
        assert result.phone == saved.phone

    async def test_should_clear_notes_when_sent_as_none(self):
        repo = FakePatientRepository()
        saved = await repo.save(PatientTestFactory.create(notes="nota existente"))
        use_case = UpdatePatientUseCase(repo)

        result = await use_case.execute(saved.id, {"notes": None})

        assert result.notes is None

    async def test_should_preserve_active_flag(self):
        repo = FakePatientRepository()
        saved = await repo.save(PatientTestFactory.create())
        use_case = UpdatePatientUseCase(repo)

        result = await use_case.execute(saved.id, {"full_name": "Nuevo Nombre"})

        assert result.active is True

    async def test_should_raise_if_not_found(self):
        repo = FakePatientRepository()
        use_case = UpdatePatientUseCase(repo)

        with pytest.raises(NotFoundError):
            await use_case.execute(999, {"full_name": "Alguien"})

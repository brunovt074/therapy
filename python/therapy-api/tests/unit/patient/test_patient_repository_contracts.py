"""
Unit tests that validate FakePatientRepository contracts for behaviors
exercised by the GET /{id} and GET / (pagination) routes.

These tests give runtime confidence that:
- count_appointments_by_patient returns the correct count per patient
- find_paginated returns a tuple with (items, total) matching PaginatedResponse shape
"""
import pytest

from therapy.patient.domain.model.patient import Patient
from tests.unit.patient.fake_patient_repository import FakePatientRepository


class TestGetPatientAppointmentCount:
    async def test_count_appointments_returns_zero_for_patient_with_no_appointments(self):
        repo = FakePatientRepository()
        saved = await repo.save(Patient(full_name="Ana Torres", phone="1000000001"))

        count = await repo.count_appointments_by_patient(saved.id)

        assert count == 0

    async def test_count_appointments_returns_correct_value_when_set(self):
        repo = FakePatientRepository()
        saved = await repo.save(Patient(full_name="Pedro Gomez", phone="1000000002"))
        repo._appointment_counts[saved.id] = 3

        count = await repo.count_appointments_by_patient(saved.id)

        assert count == 3

    async def test_count_appointments_is_isolated_per_patient(self):
        repo = FakePatientRepository()
        p1 = await repo.save(Patient(full_name="Paciente Uno", phone="2000000001"))
        p2 = await repo.save(Patient(full_name="Paciente Dos", phone="2000000002"))
        repo._appointment_counts[p1.id] = 5
        repo._appointment_counts[p2.id] = 2

        count_p1 = await repo.count_appointments_by_patient(p1.id)
        count_p2 = await repo.count_appointments_by_patient(p2.id)

        assert count_p1 == 5
        assert count_p2 == 2

    async def test_find_by_id_returns_none_for_missing_patient(self):
        repo = FakePatientRepository()

        result = await repo.find_by_id(9999)

        assert result is None

    async def test_find_by_id_returns_patient_when_exists(self):
        repo = FakePatientRepository()
        saved = await repo.save(Patient(full_name="Laura Suarez", phone="3000000001"))

        result = await repo.find_by_id(saved.id)

        assert result is not None
        assert result.id == saved.id
        assert result.full_name == "Laura Suarez"


class TestPaginatedResponseContract:
    async def test_find_paginated_returns_tuple_of_items_and_total(self):
        repo = FakePatientRepository()
        await repo.save(Patient(full_name="Paciente A", phone="4000000001"))
        await repo.save(Patient(full_name="Paciente B", phone="4000000002"))
        await repo.save(Patient(full_name="Paciente C", phone="4000000003"))

        items, total = await repo.find_paginated(None, page=1, per_page=20)

        assert total == 3
        assert len(items) == 3

    async def test_find_paginated_total_reflects_filtered_count(self):
        repo = FakePatientRepository()
        await repo.save(Patient(full_name="Carlos Ruiz", phone="5000000001"))
        await repo.save(Patient(full_name="Carlos Medina", phone="5000000002"))
        await repo.save(Patient(full_name="Ana Gomez", phone="5000000003"))

        items, total = await repo.find_paginated("carlos", page=1, per_page=20)

        assert total == 2
        assert len(items) == 2
        assert all("carlos" in p.full_name.lower() for p in items)

    async def test_find_paginated_respects_page_and_per_page(self):
        repo = FakePatientRepository()
        for i in range(5):
            await repo.save(Patient(full_name=f"Paciente {i}", phone=f"600000000{i}"))

        items, total = await repo.find_paginated(None, page=1, per_page=2)

        assert total == 5
        assert len(items) == 2

    async def test_find_paginated_second_page_returns_remaining_items(self):
        repo = FakePatientRepository()
        for i in range(5):
            await repo.save(Patient(full_name=f"Paciente {i}", phone=f"700000000{i}"))

        items_page1, total_p1 = await repo.find_paginated(None, page=1, per_page=3)
        items_page2, total_p2 = await repo.find_paginated(None, page=2, per_page=3)

        assert total_p1 == 5
        assert total_p2 == 5
        assert len(items_page1) == 3
        assert len(items_page2) == 2

    async def test_find_paginated_returns_empty_items_on_out_of_range_page(self):
        repo = FakePatientRepository()
        await repo.save(Patient(full_name="Unico Paciente", phone="8000000001"))

        items, total = await repo.find_paginated(None, page=10, per_page=20)

        assert total == 1
        assert len(items) == 0

    async def test_find_paginated_items_have_required_fields_for_patient_response(self):
        repo = FakePatientRepository()
        await repo.save(
            Patient(full_name="Complete Patient", phone="9000000001", email="cp@test.com")
        )

        items, total = await repo.find_paginated(None, page=1, per_page=20)

        assert total == 1
        patient = items[0]
        assert patient.id > 0
        assert patient.full_name == "Complete Patient"
        assert patient.phone == "9000000001"
        assert patient.created_at is not None
        assert patient.updated_at is not None

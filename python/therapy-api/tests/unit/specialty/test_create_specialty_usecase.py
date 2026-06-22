import pytest

from therapy.specialty.application.usecase.create_specialty_usecase import CreateSpecialtyUseCase
from tests.factories import SpecialtyTestFactory
from tests.unit.specialty.fake_specialty_repository import FakeSpecialtyRepository


class TestCreateSpecialtyUseCase:
    async def test_should_create_specialty_and_auto_generate_slug(self):
        repo = FakeSpecialtyRepository()
        use_case = CreateSpecialtyUseCase(repo)
        specialty = SpecialtyTestFactory.create(name="Pilates")

        result = await use_case.execute(specialty)

        assert result.id == 1
        assert result.name == "Pilates"
        assert result.slug == "pilates"

    async def test_should_initialize_available_slots_from_max_slots(self):
        repo = FakeSpecialtyRepository()
        use_case = CreateSpecialtyUseCase(repo)
        specialty = SpecialtyTestFactory.create(name="Kinesiología", max_slots=4, available_slots=1)

        result = await use_case.execute(specialty)

        assert result.available_slots == 4

    async def test_should_generate_unique_slug_on_collision(self):
        repo = FakeSpecialtyRepository()
        await repo.save(SpecialtyTestFactory.create(name="Pilates", slug="pilates"))
        use_case = CreateSpecialtyUseCase(repo)
        duplicate = SpecialtyTestFactory.create(name="Pilates")

        result = await use_case.execute(duplicate)

        assert result.slug == "pilates-1"

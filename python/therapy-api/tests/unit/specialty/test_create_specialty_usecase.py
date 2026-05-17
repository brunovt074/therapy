import pytest

from therapy.shared.domain.errors.exceptions import AlreadyExistsError
from therapy.specialty.application.usecase.create_specialty_usecase import (
    CreateSpecialtyUseCase,
)
from tests.factories import SpecialtyTestFactory
from tests.unit.specialty.fake_specialty_repository import FakeSpecialtyRepository


class TestCreateSpecialtyUseCase:
    async def test_should_create_specialty(self):
        repo = FakeSpecialtyRepository()
        use_case = CreateSpecialtyUseCase(repo)
        specialty = SpecialtyTestFactory.create(name="Pilates", slug="pilates")

        result = await use_case.execute(specialty)

        assert result.id == 1
        assert result.name == "Pilates"
        assert result.slug == "pilates"

    async def test_should_raise_when_slug_already_exists(self):
        repo = FakeSpecialtyRepository()
        await repo.save(SpecialtyTestFactory.create(slug="pilates"))
        use_case = CreateSpecialtyUseCase(repo)
        duplicate = SpecialtyTestFactory.create(slug="pilates")

        with pytest.raises(AlreadyExistsError):
            await use_case.execute(duplicate)

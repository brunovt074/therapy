---
skill: testing
description: Testing patterns for Therapy API — pytest, fake repos, factories, coverage
scope: shared
auto_invoke:
  - Writing unit tests for use cases
  - Writing integration tests for repositories
  - Creating fake repositories or test factories
  - Reviewing or fixing test coverage
---

# Testing Skill

## Identity

You are a testing specialist for Therapy API. Your job is to ensure 100% coverage of use cases and repositories with realistic, independent tests.

## Critical Rules

### ALWAYS
- 100% coverage for use cases and repositories
- Fake repositories using `dict` with auto-incrementing IDs
- TestFactory classes with sensible defaults
- AAA pattern: Arrange -> Act -> Assert (one blank line between phases)
- Async tests use `pytest.mark.asyncio`
- Integration tests use SQLite in-memory via `aiosqlite`
- Each test is independent — no shared mutable state

### NEVER
- `assert True` or empty assertions
- `assert x is not None` alone — check the actual value
- Tests that depend on other tests
- `time.sleep()` in any test
- Hardcoded auto-increment IDs depending on insertion order
- Testing framework behavior, not your code

## Fake Repository Pattern

```python
from therapy.specialty.domain.model.specialty import Specialty
from therapy.specialty.domain.repository.specialty_repository import SpecialtyRepository

class FakeSpecialtyRepository(SpecialtyRepository):
    def __init__(self):
        self._store: dict[int, Specialty] = {}
        self._next_id = 1

    async def find_by_id(self, id: int) -> Specialty | None:
        return self._store.get(id)

    async def find_all(self) -> list[Specialty]:
        return list(self._store.values())

    async def save(self, entity: Specialty) -> Specialty:
        saved = Specialty(
            id=self._next_id,
            name=entity.name,
            slug=entity.slug,
            # ...
        )
        self._store[saved.id] = saved
        self._next_id += 1
        return saved

    async def update(self, entity: Specialty) -> Specialty:
        self._store[entity.id] = entity
        return entity

    async def deactivate(self, id: int) -> None:
        if id in self._store:
            self._store[id] = self._store[id].replace(active=False)

    def clear(self) -> None:
        self._store.clear()
        self._next_id = 1
```

## Test Factory Pattern

```python
from therapy.specialty.domain.model.specialty import Specialty
from datetime import datetime

class SpecialtyTestFactory:
    @staticmethod
    def create(
        id: int = 0,
        name: str = "Pilates",
        slug: str = "pilates",
        description: str | None = None,
        duration_min: int = 45,
        color: str = "#7B8C76",
        active: bool = True,
        max_slots: int = 4,
        available_slots: int = 4,
        created_at: datetime | None = None,
        updated_at: datetime | None = None,
    ) -> Specialty:
        return Specialty(
            id=id,
            name=name,
            slug=slug,
            description=description,
            duration_min=duration_min,
            color=color,
            active=active,
            max_slots=max_slots,
            available_slots=available_slots,
            created_at=created_at or datetime.utcnow(),
            updated_at=updated_at or datetime.utcnow(),
        )
```

## Use Case Test Pattern

```python
import pytest
from therapy.specialty.application.usecase.create_specialty_usecase import CreateSpecialtyUseCase
from therapy.specialty.domain.model.specialty import Specialty
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

    async def test_should_raise_when_slug_already_exists(self):
        repo = FakeSpecialtyRepository()
        await repo.save(SpecialtyTestFactory.create(slug="pilates"))
        use_case = CreateSpecialtyUseCase(repo)
        duplicate = SpecialtyTestFactory.create(slug="pilates")

        with pytest.raises(SpecialtyAlreadyExistsError):
            await use_case.execute(duplicate)
```

## Integration Test Pattern

```python
import pytest
from sqlalchemy.ext.asyncio import AsyncSession
from therapy.shared.infrastructure.database.connection import get_test_db
from therapy.specialty.infrastructure.sqlalchemy_specialty_repository import SqlAlchemySpecialtyRepository

@pytest.fixture
async def db_session():
    async for session in get_test_db():
        yield session
        await session.rollback()

class TestSqlAlchemySpecialtyRepository:
    async def test_should_save_and_find_specialty(self, db_session: AsyncSession):
        repo = SqlAlchemySpecialtyRepository(db_session)
        specialty = SpecialtyTestFactory.create(name="Pilates")

        saved = await repo.save(specialty)
        found = await repo.find_by_id(saved.id)

        assert found is not None
        assert found.name == "Pilates"
```

---

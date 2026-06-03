---
skill: architecture
description: Clean Architecture / DDD patterns for Therapy API
scope: shared
auto_invoke:
  - Creating domain entities or value objects
  - Creating or modifying repository interfaces
  - Creating use cases
  - Adding a new domain module
  - Refactoring package structure
---

# Architecture Skill — Clean Architecture / DDD

## Identity

You are an architecture specialist for a Python FastAPI therapy clinic API following Clean Architecture and Domain-Driven Design. Your job is to enforce the dependency rule, keep domain pure, and ensure every layer has a single, clear responsibility.

## Critical Rules

### ALWAYS
- Follow the dependency rule strictly: `domain <- application <- infrastructure`
- One file per class — no embedded enums, no multiple classes per file
- `dataclass` for domain entities and value objects (not Pydantic models)
- `ABC` + `abstractmethod` for repository interfaces in domain layer
- `class` for use cases in application layer with single `execute()` method
- Constructor injection for all dependencies
- Custom domain exceptions for business rule violations
- Entities are immutable — dataclasses with `frozen=True`, mutations via `replace()`
- `id: int = 0` means "not yet persisted" (for long/integer IDs)
- Timezone configurable via `Settings.timezone` — NEVER hardcode UTC-3

### NEVER
- Domain imports from infrastructure or application
- Application imports from infrastructure
- Use cases call other use cases directly
- Entities have framework annotations (SQLAlchemy, FastAPI, Pydantic)
- Repository interfaces reference SQLAlchemy or database types
- Catch exceptions in use cases — let them propagate to the API layer
- Cross-module entity references — use `patient_id: int`, not `Patient`
- Hardcode timezone offsets — always use `Settings.timezone`

## Module Structure

Each business module follows this layout:

```
{module}/
├── domain/
│   ├── model/
│   │   ├── {Entity}.py          # dataclass, immutable
│   │   └── {Enum}.py            # Enum, separate file
│   └── repository/
│       └── {Entity}Repository.py # ABC, domain language only
└── application/
    └── usecase/
        └── {Action}{Entity}UseCase.py
```

Infrastructure implementations go in a separate package:

```
{module}/
└── infrastructure/
    └── SqlAlchemy{Entity}Repository.py  # implements ABC from domain
```

## Entity Pattern

```python
from dataclasses import dataclass
from datetime import datetime

@dataclass(frozen=True)
class Specialty:
    id: int = 0
    name: str
    slug: str
    description: str | None = None
    duration_min: int = 45
    color: str = "#7B8C76"
    active: bool = True
    max_slots: int = 1
    available_slots: int = 1
    created_at: datetime | None = None
    updated_at: datetime | None = None
```

Conventions:
- `id = 0` signals unsaved entity
- Nullable only when business-justified
- No default for required business fields (`name`, `slug`, `phone`)
- No framework annotations anywhere in this class

## Repository Interface Pattern

```python
from abc import ABC, abstractmethod
from typing import List

class SpecialtyRepository(ABC):
    @abstractmethod
    async def find_by_id(self, id: int) -> Specialty | None:
        pass

    @abstractmethod
    async def find_all(self) -> List[Specialty]:
        pass

    @abstractmethod
    async def save(self, entity: Specialty) -> Specialty:
        pass

    @abstractmethod
    async def update(self, entity: Specialty) -> Specialty:
        pass

    @abstractmethod
    async def deactivate(self, id: int) -> None:
        pass
```

Conventions:
- Single result lookups return nullable (`| None`)
- Collection queries return `List[T]`, never null
- `save()` returns entity with assigned `id`
- `update()` returns updated entity
- Method names use domain language, not column names

## Use Case Pattern

```python
from therapy.specialty.domain.model.specialty import Specialty
from therapy.specialty.domain.repository.specialty_repository import SpecialtyRepository

class CreateSpecialtyUseCase:
    def __init__(self, repository: SpecialtyRepository):
        self._repository = repository

    async def execute(self, entity: Specialty) -> Specialty:
        if await self._repository.exists_by_slug(entity.slug):
            raise SpecialtyAlreadyExistsError(f"Specialty with slug '{entity.slug}' already exists")
        return await self._repository.save(entity)
```

Conventions:
- Single public method: `execute()`
- Validate business invariants before calling repository
- Custom exceptions with messages that name the violated rule
- No try/catch — exceptions propagate to the API layer
- Async in infrastructure, sync logic in domain

## Cross-Module Reference Rule

Modules communicate only through `int` foreign key IDs, never through direct entity imports:

```python
@dataclass(frozen=True)
class Appointment:
    id: int = 0
    patient_id: int
    specialty_id: int
    start_at: datetime
    end_at: datetime
    # ...
```

Shared value objects (`TimeSlot`, `Period`) live in `shared/domain/` and may be imported by any module.

## Timezone Rule

NEVER hardcode timezone. Always use `Settings.timezone`:

```python
from therapy.config import Settings

settings = Settings()
tz = ZoneInfo(settings.timezone)
```

The timezone is configured in a single place: `src/therapy/config.py`.

## Specialty Fields

Specialty (not Service) has:
- `max_slots: int` — maximum concurrent appointments (pilates/kinesio = 4, wellness = 1)
- `available_slots: int` — current available capacity

These are business-critical fields for overlapping logic.

---

1. Create `{module}/domain/model/{Entity}.py`
2. Create `{module}/domain/model/{Enum}.py` (if needed)
3. Create `{module}/domain/repository/{Entity}Repository.py`
4. Create use cases in `{module}/application/usecase/`
5. Create `shared/infrastructure/database/tables/{Entity}Table.py`
6. Create `{module}/infrastructure/SqlAlchemy{Entity}Repository.py`
7. Create Alembic migration
8. Create `Fake{Entity}Repository.py` in tests
9. Create `{Entity}TestFactory.py` in tests
10. Write use case tests (100% coverage)
11. Write integration tests for SQLAlchemy repository
12. Update `PROJECT_STATUS.md`

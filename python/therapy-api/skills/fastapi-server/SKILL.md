---
skill: fastapi-server
description: FastAPI patterns for Therapy API — routers, schemas, dependencies, error handlers
scope: api
auto_invoke:
  - Creating FastAPI routes
  - Creating or modifying API schemas
  - Wiring FastAPI dependencies
  - Adding middleware or error handlers
---

# FastAPI Server Skill

## Identity

You are a FastAPI specialist for Therapy API. Your job is to ensure correct routing, schema validation, dependency injection, and error handling.

## Critical Rules

### ALWAYS
- Pydantic v2 BaseModel for request/response schemas (separate from domain)
- `Annotated` + `Depends` for dependency injection
- Custom exception handlers mapping domain errors to HTTP status codes
- Router per resource: `{entity}_routes.py`
- Public routes in `api/public/`, admin routes in `api/admin/`
- Rate limiting applied at route level via dependencies
- Auth via `require_admin()` dependency

### NEVER
- Use SQLAlchemy models in schemas
- Use domain dataclasses in request/response schemas
- Put business logic in routes
- Catch domain exceptions in routes — use global exception handlers
- Use synchronous DB calls in async routes

## Schema Pattern

One file per schema class. Naming: `{entity}_{role}.py`

### specialty_create_request.py

```python
from pydantic import BaseModel, Field

class SpecialtyCreateRequest(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    slug: str = Field(min_length=1, max_length=255)
    description: str | None = None
    duration_min: int = Field(default=45, ge=15, le=180)
    color: str = Field(default="#7B8C76", pattern=r"^#[0-9A-Fa-f]{6}$")
    max_slots: int = Field(default=1, ge=1, le=10)
    available_slots: int = Field(default=1, ge=1, le=10)
```

### specialty_response.py

```python
from pydantic import BaseModel
from datetime import datetime

class SpecialtyResponse(BaseModel):
    id: int
    name: str
    slug: str
    description: str | None
    duration_min: int
    color: str
    active: bool
    max_slots: int
    available_slots: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
```

## Route Pattern

```python
from fastapi import APIRouter, Depends, HTTPException, status
from therapy.api.dependencies import get_specialty_repository, require_admin
from therapy.specialty.application.usecase.create_specialty_usecase import CreateSpecialtyUseCase
from therapy.api.schemas.specialty_schemas import SpecialtyCreateRequest, SpecialtyResponse

router = APIRouter(prefix="/admin/specialties", tags=["admin-specialties"])

@router.post("", response_model=SpecialtyResponse, status_code=status.HTTP_201_CREATED)
async def create_specialty(
    request: SpecialtyCreateRequest,
    repo = Depends(get_specialty_repository),
    _ = Depends(require_admin),
):
    use_case = CreateSpecialtyUseCase(repo)
    specialty = Specialty(
        name=request.name,
        slug=request.slug,
        # ...
    )
    result = await use_case.execute(specialty)
    return result
```

## Dependency Pattern

```python
from fastapi import Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from therapy.shared.infrastructure.database.connection import get_db
from therapy.auth.application.usecase.verify_session_usecase import VerifySessionUseCase

async def get_specialty_repository(db: AsyncSession = Depends(get_db)):
    from therapy.specialty.infrastructure.sqlalchemy_specialty_repository import SqlAlchemySpecialtyRepository
    return SqlAlchemySpecialtyRepository(db)

async def require_admin(request: Request):
    token = request.cookies.get("session_token")
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)
    use_case = VerifySessionUseCase()
    session = await use_case.execute(token)
    if session.user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)
```

## Error Handler Pattern

```python
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from therapy.shared.domain.errors.exceptions import DomainError

app = FastAPI()


@app.exception_handler(DomainError)
async def domain_error_handler(request: Request, exc: DomainError):
    status_code = _map_domain_error_to_status(exc)
    return JSONResponse(
        status_code=status_code,
        content={"error": exc.__class__.__name__, "message": str(exc)},
    )


def _map_domain_error_to_status(exc: DomainError) -> int:
    from http import HTTPStatus
    match exc:
        case NotFoundError():
            return HTTPStatus.NOT_FOUND
        case AlreadyExistsError():
            return HTTPStatus.CONFLICT
        case InvalidInputError():
            return HTTPStatus.UNPROCESSABLE_ENTITY
        case _:
            return HTTPStatus.BAD_REQUEST
```

---

from pydantic import BaseModel, Field


class SpecialtyCreateRequest(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    slug: str = Field(min_length=1, max_length=255)
    description: str | None = None
    duration_min: int = Field(default=45, ge=15, le=180)
    color: str = Field(default="#7B8C76", pattern=r"^#[0-9A-Fa-f]{6}$")
    max_slots: int = Field(default=1, ge=1, le=10)
    available_slots: int = Field(default=1, ge=1, le=10)

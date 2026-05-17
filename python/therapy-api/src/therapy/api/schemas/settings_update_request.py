from pydantic import BaseModel, Field


class SettingsUpdateRequest(BaseModel):
    business_hours_start: str | None = Field(default=None, pattern=r"^\d{2}:\d{2}$")
    business_hours_end: str | None = Field(default=None, pattern=r"^\d{2}:\d{2}$")
    business_work_days: list[int] | None = Field(default=None, min_length=1, max_length=7)

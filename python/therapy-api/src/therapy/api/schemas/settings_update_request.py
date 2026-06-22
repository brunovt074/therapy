from pydantic import BaseModel, Field


class BusinessHoursRange(BaseModel):
    start: str = Field(pattern=r"^\d{2}:\d{2}$")
    end: str = Field(pattern=r"^\d{2}:\d{2}$")


class SettingsUpdateRequest(BaseModel):
    business_hours_ranges: list[BusinessHoursRange] | None = Field(default=None, min_length=1)
    business_work_days: list[int] | None = Field(default=None, min_length=1, max_length=7)

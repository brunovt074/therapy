from pydantic import BaseModel


class BusinessHoursRange(BaseModel):
    start: str
    end: str


class SettingsResponse(BaseModel):
    timezone: str
    business_hours_ranges: list[BusinessHoursRange]
    business_work_days: list[int]

    class Config:
        from_attributes = True

from pydantic import BaseModel


class SettingsResponse(BaseModel):
    timezone: str
    business_hours_start: str
    business_hours_end: str
    business_work_days: list[int]

    class Config:
        from_attributes = True

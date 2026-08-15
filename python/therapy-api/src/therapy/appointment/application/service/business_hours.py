from datetime import datetime
from zoneinfo import ZoneInfo

from therapy.config import Settings
from therapy.specialty.domain.model.specialty import Specialty


def is_within_business_hours(
    start_at: datetime, end_at: datetime, specialty: Specialty, settings: Settings
) -> bool:
    tz = ZoneInfo(settings.timezone)
    local_start = start_at.astimezone(tz)
    local_end = end_at.astimezone(tz)
    day_of_week = local_start.weekday()

    has_own_schedule = bool(
        specialty.schedule_days and specialty.schedule_start and specialty.schedule_end
    )
    if has_own_schedule:
        work_days = specialty.schedule_days
        hour_ranges = [{"start": specialty.schedule_start, "end": specialty.schedule_end}]
    else:
        work_days = settings.business_work_days
        hour_ranges = settings.business_hours_ranges

    if day_of_week not in work_days:
        return False

    local_date = local_start.replace(hour=0, minute=0, second=0, microsecond=0)
    for r in hour_ranges:
        start_h, start_m = map(int, r["start"].split(":"))
        end_h, end_m = map(int, r["end"].split(":"))
        range_start = local_date.replace(hour=start_h, minute=start_m)
        range_end = local_date.replace(hour=end_h, minute=end_m)
        if range_start <= local_start and local_end <= range_end:
            return True

    return False

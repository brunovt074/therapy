from datetime import datetime

from therapy.appointment.domain.repository.appointment_repository import AppointmentRepository
from therapy.blocked_slot.domain.repository.blocked_slot_repository import BlockedSlotRepository
from therapy.config import Settings
from therapy.shared.domain.time.value_objects import ParsedDay, TimeSlot
from therapy.specialty.domain.model.specialty import Specialty
from therapy.specialty.domain.repository.specialty_repository import SpecialtyRepository


class GetAvailableSlotsUseCase:
    def __init__(
        self,
        appointment_repository: AppointmentRepository,
        blocked_slot_repository: BlockedSlotRepository,
        specialty_repository: SpecialtyRepository,
        settings: Settings = Settings(),
    ):
        self._appointment_repository = appointment_repository
        self._blocked_slot_repository = blocked_slot_repository
        self._specialty_repository = specialty_repository
        self._settings = settings

    async def execute(self, date: str, specialty_id: int) -> list[TimeSlot]:
        specialty = await self._specialty_repository.find_by_id(specialty_id)
        if not specialty or not specialty.active:
            return []

        parsed = self._parse_date(date)
        if not parsed.is_work_day:
            return []

        appointments = await self._appointment_repository.find_by_date_range(
            parsed.day_start, parsed.day_end
        )
        blocked = await self._blocked_slot_repository.find_by_date_range(
            parsed.day_start, parsed.day_end
        )

        slots = self._generate_slots(
            parsed.day_start, parsed.day_end, specialty.duration_min
        )
        slots = self._apply_blocking(slots, appointments, blocked, specialty)
        return slots

    def _parse_date(self, date: str) -> ParsedDay:
        from zoneinfo import ZoneInfo

        year, month, day = map(int, date.split("-"))
        tz = ZoneInfo(self._settings.timezone)
        local_date = datetime(year, month, day, tzinfo=tz)
        day_of_week = local_date.weekday()

        start_h, start_m = map(int, self._settings.business_hours_start.split(":"))
        end_h, end_m = map(int, self._settings.business_hours_end.split(":"))

        day_start = local_date.replace(hour=start_h, minute=start_m, second=0, microsecond=0)
        day_end = local_date.replace(hour=end_h, minute=end_m, second=0, microsecond=0)

        is_work_day = day_of_week in self._settings.business_work_days

        return ParsedDay(
            is_work_day=is_work_day,
            day_of_week=day_of_week,
            day_start=day_start,
            day_end=day_end,
        )

    def _generate_slots(
        self, day_start: datetime, day_end: datetime, duration_min: int
    ) -> list[TimeSlot]:
        if duration_min <= 0:
            return []

        slots = []
        duration_ms = duration_min * 60_000
        current = day_start.timestamp() * 1000
        end = day_end.timestamp() * 1000

        while current + duration_ms <= end:
            start = datetime.fromtimestamp(current / 1000, tz=day_start.tzinfo)
            end_slot = datetime.fromtimestamp((current + duration_ms) / 1000, tz=day_start.tzinfo)
            slots.append(TimeSlot(start_at=start, end_at=end_slot, available=True))
            current += duration_ms

        return slots

    def _apply_blocking(
        self,
        slots: list[TimeSlot],
        appointments: list,
        blocked_slots: list,
        specialty: Specialty,
    ) -> list[TimeSlot]:
        result = []
        for slot in slots:
            slot_appointments = [
                a for a in appointments
                if a.start_at < slot.end_at and a.end_at > slot.start_at
                and a.specialty_id == specialty.id
            ]
            is_blocked = any(
                b.start_at < slot.end_at and b.end_at > slot.start_at
                for b in blocked_slots
            )
            available = len(slot_appointments) < specialty.available_slots and not is_blocked
            result.append(TimeSlot(start_at=slot.start_at, end_at=slot.end_at, available=available))
        return result

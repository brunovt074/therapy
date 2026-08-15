import httpx

from therapy_mcp.client import TherapyApiClient
from therapy_mcp.server import (
    _cancel_appointment,
    _create_appointment,
    _get_available_days,
    _get_available_slots,
    _list_specialties,
    _register_patient,
    _reschedule_appointment,
    _search_appointments,
    _search_patients,
)
from tests.fake_therapy_api import FakeTherapyApi


def _client(fake: FakeTherapyApi) -> TherapyApiClient:
    http = httpx.Client(base_url="http://therapy-api.test", transport=fake.transport())
    return TherapyApiClient(base_url="http://therapy-api.test", email="bot@x.com", password="pw", http=http)


def test_list_specialties_filters_inactive():
    fake = FakeTherapyApi()
    fake.specialties = [
        {"id": 1, "name": "Kinesiologia", "duration_min": 30, "active": True},
        {"id": 2, "name": "Vieja", "duration_min": 60, "active": False},
    ]

    result = _list_specialties(_client(fake))

    assert "1: Kinesiologia (30 min)" in result
    assert "Vieja" not in result


def test_list_specialties_empty():
    fake = FakeTherapyApi()

    result = _list_specialties(_client(fake))

    assert "No specialties registered" in result


def test_get_available_slots_lists_hours():
    fake = FakeTherapyApi()

    result = _get_available_slots(_client(fake), "2026-08-11", 1)

    assert "09:00" in result


def test_get_available_days():
    fake = FakeTherapyApi()

    result = _get_available_days(_client(fake), "2026-08", 1)

    assert "2026-08-11" in result
    assert "2026-08-12" in result


def test_register_and_search_patient():
    fake = FakeTherapyApi()
    client = _client(fake)

    _register_patient(client, "Ana Test", "1122334455", "", "")
    result = _search_patients(client, "ana")

    assert "Ana Test" in result
    assert "1122334455" in result


def test_search_patients_no_results():
    fake = FakeTherapyApi()

    result = _search_patients(_client(fake), "nadie")

    assert "No patients found" in result


def test_create_appointment_rejects_malformed_datetime():
    fake = FakeTherapyApi()

    result = _create_appointment(_client(fake), "Ana", "1122334455", 1, "mañana a la tarde", "")

    assert "ISO 8601" in result


def test_create_appointment_success():
    fake = FakeTherapyApi()

    result = _create_appointment(_client(fake), "Ana Test", "1122334455", 1, "2026-08-11T09:00:00-03:00", "")

    assert "Appointment confirmed" in result
    assert len(fake.appointments) == 1


def test_search_reschedule_and_cancel_appointment():
    fake = FakeTherapyApi()
    client = _client(fake)
    _create_appointment(client, "Ana Test", "1122334455", 1, "2026-08-11T09:00:00-03:00", "")

    listing = _search_appointments(client, 0, 0, "")
    assert "Ana Test" in listing

    rescheduled = _reschedule_appointment(client, 1, "2026-08-11T10:00:00-03:00", 0)
    assert "rescheduled" in rescheduled

    cancelled = _cancel_appointment(client, 1)
    assert "cancelled" in cancelled
    assert fake.appointments[0]["status"] == "cancelled"


def test_reschedule_nonexistent_appointment():
    fake = FakeTherapyApi()

    result = _reschedule_appointment(_client(fake), 999, "2026-08-11T10:00:00-03:00", 0)

    assert "Could not reschedule" in result
    assert "Appointment not found" in result

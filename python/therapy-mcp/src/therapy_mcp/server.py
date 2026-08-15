"""therapy-mcp: the tool surface the WhatsApp receptionist agent (opencode)
consumes over stdio. Every handler is a thin wrapper around a `_verb(client, ...)`
function so tests call the verb directly without touching the MCP protocol -
mirrors cv-pal's interfaces/mcp/server.py. `_verb` functions never raise -
they catch TherapyApiError/ValueError themselves and return a message, so the
decorated function stays a pure one-liner.

All tools authenticate as the bot-mcp service account (see client.py) and talk
to therapy-api over HTTP. Dates/times are ISO 8601 with an explicit UTC offset,
e.g. "2026-08-11T09:00:00-03:00" (America/Argentina/Buenos_Aires). Tool names,
params and return strings are in English, mirroring therapy-api's own
vocabulary - the agent prompt is the only place the Spanish voice lives.
"""

from __future__ import annotations

import os
from datetime import datetime
from pathlib import Path

from dotenv import load_dotenv
from mcp.server.fastmcp import FastMCP

from therapy_mcp.client import TherapyApiClient, TherapyApiError

mcp = FastMCP("therapy")

_ENV_FILE = Path(__file__).resolve().parents[2] / ".env"


def _client() -> TherapyApiClient:
    return TherapyApiClient(
        base_url=os.environ["THERAPY_API_URL"],
        email=os.environ["THERAPY_MCP_EMAIL"],
        password=os.environ["THERAPY_MCP_PASSWORD"],
    )


def _parse_datetime(value: str, field: str) -> None:
    try:
        datetime.fromisoformat(value)
    except ValueError:
        raise ValueError(
            f"{field} must be ISO 8601 with a UTC offset, e.g. '2026-08-11T09:00:00-03:00'. Got: {value!r}"
        )


def _list_specialties(client: TherapyApiClient) -> str:
    try:
        specialties = client.request("GET", "/api/specialties")
    except TherapyApiError as e:
        return f"Error fetching specialties: {e.detail}"
    if not specialties:
        return "No specialties registered."
    lines = [f"{s['id']}: {s['name']} ({s['duration_min']} min)" for s in specialties if s["active"]]
    return "\n".join(lines) if lines else "No active specialties."


@mcp.tool()
def list_specialties() -> str:
    """Lists active specialties with their id and appointment duration.
    Call this first to find the specialty_id the patient is asking about
    before checking availability or creating an appointment."""
    return _list_specialties(_client())


def _get_available_slots(client: TherapyApiClient, date: str, specialty_id: int) -> str:
    try:
        slots = client.request("GET", "/api/availability", params={"date": date, "specialty_id": specialty_id})
    except TherapyApiError as e:
        return f"Error fetching availability: {e.detail}"
    available = [s for s in slots if s["available"]]
    if not available:
        return f"No available slots on {date} for that specialty."
    hours = ", ".join(s["start_at"][11:16] for s in available)
    return f"Available times on {date}: {hours}"


@mcp.tool()
def get_available_slots(date: str, specialty_id: int) -> str:
    """Available times for a specific day and specialty.
    date in YYYY-MM-DD format (e.g. '2026-08-11'). Call list_specialties
    first to get specialty_id."""
    return _get_available_slots(_client(), date, specialty_id)


def _get_available_days(client: TherapyApiClient, month: str, specialty_id: int) -> str:
    try:
        days = client.request("GET", "/api/availability/days", params={"month": month, "specialty_id": specialty_id})
    except TherapyApiError as e:
        return f"Error fetching available days: {e.detail}"
    if not days:
        return f"No available days in {month} for that specialty."
    return "Days with availability: " + ", ".join(days)


@mcp.tool()
def get_available_days(month: str, specialty_id: int) -> str:
    """Which days of a month have at least one open slot, for a given
    specialty. month in YYYY-MM format (e.g. '2026-08'). Useful when the
    patient asks something broad ("what days do you have this week?")
    before narrowing down with get_available_slots on a specific day."""
    return _get_available_days(_client(), month, specialty_id)


def _search_patients(client: TherapyApiClient, query: str) -> str:
    try:
        patients = client.request("GET", "/api/admin/patients", params={"q": query} if query else {})
    except TherapyApiError as e:
        return f"Error searching patients: {e.detail}"
    if not patients:
        return f"No patients found for '{query}'."
    lines = [f"{p['id']}: {p['full_name']} - {p['phone']}" for p in patients]
    return "\n".join(lines)


@mcp.tool()
def search_patients(query: str = "") -> str:
    """Searches patients by name or phone (partial match). Returns id,
    name and phone. Use the returned id for search_appointments."""
    return _search_patients(_client(), query)


def _register_patient(client: TherapyApiClient, full_name: str, phone: str, email: str, notes: str) -> str:
    body = {"full_name": full_name, "phone": phone}
    if email:
        body["email"] = email
    if notes:
        body["notes"] = notes
    try:
        patient = client.request("POST", "/api/admin/patients", json=body)
    except TherapyApiError as e:
        return f"Error registering patient: {e.detail}"
    return f"Patient registered: id={patient['id']}, {patient['full_name']}"


@mcp.tool()
def register_patient(full_name: str, phone: str, email: str = "", notes: str = "") -> str:
    """Registers a new patient. Usually not necessary to call this
    directly: create_appointment registers the patient automatically if
    they don't exist. Use only if the patient wants to be registered
    without booking yet."""
    return _register_patient(_client(), full_name, phone, email, notes)


def _create_appointment(
    client: TherapyApiClient,
    patient_full_name: str,
    patient_phone: str,
    specialty_id: int,
    start_at: str,
    patient_email: str,
) -> str:
    try:
        _parse_datetime(start_at, "start_at")
    except ValueError as e:
        return str(e)

    body = {
        "patient_full_name": patient_full_name,
        "patient_phone": patient_phone,
        "specialty_id": specialty_id,
        "start_at": start_at,
    }
    if patient_email:
        body["patient_email"] = patient_email
    try:
        appointment = client.request("POST", "/api/appointments", json=body)
    except TherapyApiError as e:
        return f"Could not book the appointment: {e.detail}"
    return f"Appointment confirmed: id={appointment['id']}, {start_at}"


@mcp.tool()
def create_appointment(
    patient_full_name: str,
    patient_phone: str,
    specialty_id: int,
    start_at: str,
    patient_email: str = "",
) -> str:
    """Books a new appointment. Registers or updates the patient
    automatically (by phone). start_at in ISO 8601 with a UTC offset, e.g.
    '2026-08-11T09:00:00-03:00'. Confirm availability with
    get_available_slots before calling this - if the slot is no longer
    free, this tool returns an error explaining why."""
    return _create_appointment(_client(), patient_full_name, patient_phone, specialty_id, start_at, patient_email)


def _search_appointments(client: TherapyApiClient, patient_id: int, specialty_id: int, status: str) -> str:
    params = {}
    if patient_id:
        params["patient_id"] = patient_id
    if specialty_id:
        params["specialty_id"] = specialty_id
    if status:
        params["status"] = status
    try:
        appointments = client.request("GET", "/api/admin/appointments", params=params)
    except TherapyApiError as e:
        return f"Error searching appointments: {e.detail}"
    if not appointments:
        return "No appointments found for those filters."
    lines = [
        f"{a['id']}: {a['patient_name']} - {a['specialty_name']} - {a['start_at']} - {a['status']}"
        for a in appointments
    ]
    return "\n".join(lines)


@mcp.tool()
def search_appointments(patient_id: int = 0, specialty_id: int = 0, status: str = "") -> str:
    """Searches appointments, optionally filtered by patient_id (see
    search_patients), specialty_id and/or status (pending, confirmed,
    cancelled, completed, no_show). Returns the appointment id, needed
    for reschedule_appointment or cancel_appointment."""
    return _search_appointments(_client(), patient_id, specialty_id, status)


def _reschedule_appointment(client: TherapyApiClient, appointment_id: int, start_at: str, specialty_id: int) -> str:
    try:
        _parse_datetime(start_at, "start_at")
    except ValueError as e:
        return str(e)

    body = {"start_at": start_at}
    if specialty_id:
        body["specialty_id"] = specialty_id
    try:
        client.request("PATCH", f"/api/admin/appointments/{appointment_id}", json=body)
    except TherapyApiError as e:
        return f"Could not reschedule appointment {appointment_id}: {e.detail}"
    return f"Appointment {appointment_id} rescheduled to {start_at}"


@mcp.tool()
def reschedule_appointment(appointment_id: int, start_at: str, specialty_id: int = 0) -> str:
    """Changes the date/time of an existing appointment (get appointment_id
    with search_appointments). start_at in ISO 8601 with a UTC offset. Pass
    specialty_id only if the specialty is also changing."""
    return _reschedule_appointment(_client(), appointment_id, start_at, specialty_id)


def _cancel_appointment(client: TherapyApiClient, appointment_id: int) -> str:
    try:
        client.request("DELETE", f"/api/admin/appointments/{appointment_id}")
    except TherapyApiError as e:
        return f"Could not cancel appointment {appointment_id}: {e.detail}"
    return f"Appointment {appointment_id} cancelled."


@mcp.tool()
def cancel_appointment(appointment_id: int) -> str:
    """Cancels an existing appointment (get appointment_id with
    search_appointments)."""
    return _cancel_appointment(_client(), appointment_id)


def main() -> None:
    load_dotenv(_ENV_FILE)
    mcp.run(transport="stdio")


if __name__ == "__main__":
    main()

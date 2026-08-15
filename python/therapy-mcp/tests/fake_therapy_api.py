import httpx


class FakeTherapyApi:
    """In-memory stand-in for therapy-api's HTTP surface, wired via
    httpx.MockTransport so TherapyApiClient's request/retry/auth logic gets
    exercised without a real server."""

    def __init__(self):
        self.specialties = []
        self.patients = []
        self.appointments = []
        self._next_patient_id = 1
        self._next_appointment_id = 1
        self.login_calls = 0

    def transport(self) -> httpx.MockTransport:
        return httpx.MockTransport(self._handle)

    def _handle(self, request: httpx.Request) -> httpx.Response:
        path = request.url.path
        method = request.method

        if path == "/api/auth/login":
            self.login_calls += 1
            return httpx.Response(200, json={"access_token": "fake-token"})

        if path == "/api/specialties" and method == "GET":
            return httpx.Response(200, json=self.specialties)

        if path == "/api/availability" and method == "GET":
            date = request.url.params["date"]
            return httpx.Response(
                200,
                json=[
                    {"start_at": f"{date}T09:00:00-03:00", "end_at": f"{date}T09:30:00-03:00", "available": True}
                ],
            )

        if path == "/api/availability/days" and method == "GET":
            return httpx.Response(200, json=["2026-08-11", "2026-08-12"])

        if path == "/api/admin/patients" and method == "GET":
            q = request.url.params.get("q", "")
            matches = [p for p in self.patients if not q or q.lower() in p["full_name"].lower()]
            return httpx.Response(200, json=matches)

        if path == "/api/admin/patients" and method == "POST":
            body = _json(request)
            patient = {"id": self._next_patient_id, "full_name": body["full_name"], "phone": body["phone"]}
            self._next_patient_id += 1
            self.patients.append(patient)
            return httpx.Response(201, json=patient)

        if path == "/api/appointments" and method == "POST":
            body = _json(request)
            appointment = {
                "id": self._next_appointment_id,
                "patient_name": body["patient_full_name"],
                "specialty_name": "Kinesiologia",
                "start_at": body["start_at"],
                "status": "confirmed",
            }
            self._next_appointment_id += 1
            self.appointments.append(appointment)
            return httpx.Response(201, json=appointment)

        if path == "/api/admin/appointments" and method == "GET":
            return httpx.Response(200, json=self.appointments)

        if path.startswith("/api/admin/appointments/") and method == "PATCH":
            appointment_id = int(path.rsplit("/", 1)[-1])
            body = _json(request)
            for a in self.appointments:
                if a["id"] == appointment_id:
                    a["start_at"] = body["start_at"]
                    return httpx.Response(200, json=a)
            return httpx.Response(404, json={"detail": "Appointment not found"})

        if path.startswith("/api/admin/appointments/") and method == "DELETE":
            appointment_id = int(path.rsplit("/", 1)[-1])
            for a in self.appointments:
                if a["id"] == appointment_id:
                    a["status"] = "cancelled"
                    return httpx.Response(204)
            return httpx.Response(404, json={"detail": "Appointment not found"})

        return httpx.Response(404, json={"detail": f"unhandled {method} {path}"})


def _json(request: httpx.Request) -> dict:
    import json

    return json.loads(request.content)

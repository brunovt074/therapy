import httpx

from therapy_mcp.client import TherapyApiClient, TherapyApiError


def test_logs_in_once_and_reuses_token():
    login_calls = []

    def handler(request: httpx.Request) -> httpx.Response:
        if request.url.path == "/api/auth/login":
            login_calls.append(1)
            return httpx.Response(200, json={"access_token": "tok"})
        return httpx.Response(200, json={"ok": True})

    http = httpx.Client(base_url="http://x", transport=httpx.MockTransport(handler))
    client = TherapyApiClient(base_url="http://x", email="a@x.com", password="pw", http=http)

    client.request("GET", "/api/specialties")
    client.request("GET", "/api/specialties")

    assert len(login_calls) == 1


def test_reauthenticates_once_on_401():
    calls = {"login": 0, "specialties": 0}

    def handler(request: httpx.Request) -> httpx.Response:
        if request.url.path == "/api/auth/login":
            calls["login"] += 1
            return httpx.Response(200, json={"access_token": f"tok-{calls['login']}"})
        calls["specialties"] += 1
        if calls["specialties"] == 1:
            return httpx.Response(401, json={"detail": "expired"})
        return httpx.Response(200, json=[])

    http = httpx.Client(base_url="http://x", transport=httpx.MockTransport(handler))
    client = TherapyApiClient(base_url="http://x", email="a@x.com", password="pw", http=http)

    result = client.request("GET", "/api/specialties")

    assert result == []
    assert calls["login"] == 2
    assert calls["specialties"] == 2


def test_raises_therapy_api_error_with_detail():
    def handler(request: httpx.Request) -> httpx.Response:
        if request.url.path == "/api/auth/login":
            return httpx.Response(200, json={"access_token": "tok"})
        return httpx.Response(404, json={"detail": "Not found"})

    http = httpx.Client(base_url="http://x", transport=httpx.MockTransport(handler))
    client = TherapyApiClient(base_url="http://x", email="a@x.com", password="pw", http=http)

    try:
        client.request("GET", "/api/whatever")
        assert False, "should have raised"
    except TherapyApiError as e:
        assert e.status_code == 404
        assert e.detail == "Not found"


def test_returns_none_for_204():
    def handler(request: httpx.Request) -> httpx.Response:
        if request.url.path == "/api/auth/login":
            return httpx.Response(200, json={"access_token": "tok"})
        return httpx.Response(204)

    http = httpx.Client(base_url="http://x", transport=httpx.MockTransport(handler))
    client = TherapyApiClient(base_url="http://x", email="a@x.com", password="pw", http=http)

    assert client.request("DELETE", "/api/admin/appointments/1") is None

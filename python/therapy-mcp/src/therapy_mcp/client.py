import httpx


class TherapyApiError(Exception):
    def __init__(self, status_code: int, detail: str):
        self.status_code = status_code
        self.detail = detail
        super().__init__(f"{status_code}: {detail}")


class TherapyApiClient:
    def __init__(self, base_url: str, email: str, password: str, http: httpx.Client | None = None):
        self._email = email
        self._password = password
        self._token: str | None = None
        self._http = http or httpx.Client(base_url=base_url.rstrip("/"), timeout=10.0)

    def _login(self) -> str:
        response = self._http.post("/api/auth/login", json={"email": self._email, "password": self._password})
        response.raise_for_status()
        return response.json()["access_token"]

    def request(self, method: str, path: str, **kwargs) -> dict | list | None:
        if not self._token:
            self._token = self._login()

        response = self._http.request(method, path, headers={"Authorization": f"Bearer {self._token}"}, **kwargs)
        if response.status_code == 401:
            self._token = self._login()
            response = self._http.request(method, path, headers={"Authorization": f"Bearer {self._token}"}, **kwargs)

        if response.status_code >= 400:
            detail = response.text
            try:
                detail = response.json().get("detail", detail)
            except ValueError:
                pass
            raise TherapyApiError(response.status_code, detail)

        if response.status_code == 204 or not response.content:
            return None
        return response.json()

import httpx

from therapy_bot_gateway.conversation.domain.port.messenger_port import MessengerPort


class EvolutionMessenger(MessengerPort):
    def __init__(self, base_url: str, api_key: str, http: httpx.AsyncClient | None = None):
        self._api_key = api_key
        self._http = http or httpx.AsyncClient(base_url=base_url.rstrip("/"))

    async def send_text(self, instance_name: str, phone_number: str, text: str) -> None:
        response = await self._http.post(
            f"/message/sendText/{instance_name}",
            json={"number": phone_number, "textMessage": {"text": text}},
            headers={"apikey": self._api_key},
        )
        response.raise_for_status()

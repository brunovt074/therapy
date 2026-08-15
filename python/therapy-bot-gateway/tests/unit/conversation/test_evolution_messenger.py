import json

import httpx

from therapy_bot_gateway.conversation.infrastructure.evolution_messenger import (
    EvolutionMessenger,
)


def _messenger(handler) -> EvolutionMessenger:
    http = httpx.AsyncClient(
        base_url="http://evolution.test", transport=httpx.MockTransport(handler)
    )
    return EvolutionMessenger(base_url="http://evolution.test", api_key="secret-key", http=http)


async def test_send_text_posts_to_the_instance_send_text_endpoint_with_the_api_key_header():
    captured = {}

    def handler(request: httpx.Request) -> httpx.Response:
        captured["path"] = request.url.path
        captured["apikey"] = request.headers.get("apikey")
        captured["body"] = json.loads(request.content)
        return httpx.Response(200, json={"status": "PENDING"})

    await _messenger(handler).send_text(
        instance_name="therapy-bot", phone_number="5492611234567", text="Hola, ¿en qué te ayudo?"
    )

    assert captured["path"] == "/message/sendText/therapy-bot"
    assert captured["apikey"] == "secret-key"
    assert captured["body"]["number"] == "5492611234567"
    assert captured["body"]["textMessage"]["text"] == "Hola, ¿en qué te ayudo?"


async def test_send_text_raises_on_error_response():
    def handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(400, json={"message": "instance not found"})

    try:
        await _messenger(handler).send_text("therapy-bot", "5492611234567", "hola")
        raise AssertionError("should have raised")
    except httpx.HTTPStatusError:
        pass

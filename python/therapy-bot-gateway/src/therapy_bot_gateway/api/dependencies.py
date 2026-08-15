from functools import lru_cache

from therapy_bot_gateway.config import Settings
from therapy_bot_gateway.conversation.infrastructure.evolution_messenger import (
    EvolutionMessenger,
)
from therapy_bot_gateway.conversation.infrastructure.opencode_agent import OpenCodeAgent


@lru_cache
def get_settings() -> Settings:
    return Settings()


@lru_cache
def get_agent() -> OpenCodeAgent:
    settings = get_settings()
    return OpenCodeAgent(
        base_url=settings.opencode_base_url,
        agent=settings.opencode_agent,
        username=settings.opencode_username,
        password=settings.opencode_password,
        timeout_seconds=settings.opencode_request_timeout_seconds,
    )


@lru_cache
def get_messenger() -> EvolutionMessenger:
    settings = get_settings()
    return EvolutionMessenger(base_url=settings.evolution_base_url, api_key=settings.evolution_api_key)

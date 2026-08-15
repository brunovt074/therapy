from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    app_name: str = "Therapy Bot Gateway"
    debug: bool = False

    database_url: str = Field(..., description="Postgres async URL (postgresql+asyncpg://...)")

    opencode_base_url: str = Field(..., description="opencode serve base URL")
    opencode_agent: str = "therapy-reception-bot"
    opencode_username: str | None = None
    opencode_password: str | None = None
    opencode_request_timeout_seconds: float = 60.0

    evolution_base_url: str = Field(..., description="Evolution API base URL")
    evolution_api_key: str = Field(..., description="Evolution API AUTHENTICATION_API_KEY")

    fallback_reply: str = (
        "Perdón, estoy teniendo un problema técnico. "
        "Escribime de nuevo en un ratito, por favor."
    )
    audio_unsupported_reply: str = (
        "Por ahora no puedo escuchar audios — ¿me lo podés escribir, por favor?"
    )
    unsupported_message_reply: str = "Solo puedo leer texto por acá. ¿Me lo podés escribir?"

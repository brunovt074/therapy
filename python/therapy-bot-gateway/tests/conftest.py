import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

import pytest

from therapy_bot_gateway.config import Settings


@pytest.fixture
def settings() -> Settings:
    return Settings(
        database_url="postgresql+asyncpg://test:test@localhost/test",
        opencode_base_url="http://localhost:4096",
        evolution_base_url="http://localhost:8085",
        evolution_api_key="test-key",
    )

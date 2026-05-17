from dataclasses import dataclass
from datetime import datetime
from typing import Any

from therapy.shared.domain.logs.actor_type import ActorType


@dataclass(frozen=True)
class AuditLog:
    actor_type: ActorType
    action: str
    resource_type: str
    id: int = 0
    actor_id: str | None = None
    resource_id: str | None = None
    metadata: dict[str, Any] | None = None
    ip_address: str | None = None
    created_at: datetime | None = None

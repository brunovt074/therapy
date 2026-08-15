from dataclasses import dataclass

from therapy_bot_gateway.conversation.domain.model.message_kind import MessageKind


@dataclass(frozen=True)
class IncomingMessage:
    phone_number: str
    push_name: str
    instance_name: str
    kind: MessageKind
    text: str | None = None

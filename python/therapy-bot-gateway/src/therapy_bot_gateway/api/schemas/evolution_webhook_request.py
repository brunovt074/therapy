from typing import Any

from pydantic import BaseModel, ConfigDict

from therapy_bot_gateway.conversation.domain.model.incoming_message import IncomingMessage
from therapy_bot_gateway.conversation.domain.model.message_kind import MessageKind


class EvolutionWebhookRequest(BaseModel):
    model_config = ConfigDict(extra="allow")

    event: str = ""
    instance: str = ""
    data: dict[str, Any] = {}

    def to_incoming_message(self) -> IncomingMessage | None:
        remote_jid = self.data.get("key", {}).get("remoteJid", "")
        if not remote_jid or remote_jid.endswith("@g.us"):
            return None

        phone_number = remote_jid.replace("@s.whatsapp.net", "")
        push_name = self.data.get("pushName") or "Paciente"
        message_type = self.data.get("messageType", "")
        message = self.data.get("message", {})

        if message_type == "conversation":
            text = message.get("conversation")
            kind = MessageKind.TEXT if text else MessageKind.UNSUPPORTED
        elif message_type == "extendedTextMessage":
            text = message.get("extendedTextMessage", {}).get("text")
            kind = MessageKind.TEXT if text else MessageKind.UNSUPPORTED
        elif message_type == "audioMessage":
            text = None
            kind = MessageKind.AUDIO
        else:
            text = None
            kind = MessageKind.UNSUPPORTED

        return IncomingMessage(
            phone_number=phone_number,
            push_name=push_name,
            instance_name=self.instance,
            kind=kind,
            text=text,
        )

from therapy_bot_gateway.api.schemas.evolution_webhook_request import EvolutionWebhookRequest
from therapy_bot_gateway.conversation.domain.model.message_kind import MessageKind


def _payload(**data_overrides) -> dict:
    data = {
        "key": {"remoteJid": "5492611234567@s.whatsapp.net"},
        "pushName": "Marcela",
        "messageType": "conversation",
        "message": {"conversation": "hola"},
    }
    data.update(data_overrides)
    return {"body": {"instance": "therapy-bot", "data": data}}


def test_group_chats_are_filtered_out():
    payload = _payload()
    payload["body"]["data"]["key"]["remoteJid"] = "120363012345678901@g.us"

    result = EvolutionWebhookRequest(**payload).to_incoming_message()

    assert result is None


def test_conversation_message_maps_to_text():
    result = EvolutionWebhookRequest(**_payload()).to_incoming_message()

    assert result is not None
    assert result.kind == MessageKind.TEXT
    assert result.text == "hola"
    assert result.phone_number == "5492611234567"
    assert result.push_name == "Marcela"
    assert result.instance_name == "therapy-bot"


def test_extended_text_message_maps_to_text():
    payload = _payload(
        messageType="extendedTextMessage",
        message={"extendedTextMessage": {"text": "quiero un turno"}},
    )

    result = EvolutionWebhookRequest(**payload).to_incoming_message()

    assert result.kind == MessageKind.TEXT
    assert result.text == "quiero un turno"


def test_audio_message_maps_to_audio_kind_without_text():
    payload = _payload(messageType="audioMessage", message={})

    result = EvolutionWebhookRequest(**payload).to_incoming_message()

    assert result.kind == MessageKind.AUDIO
    assert result.text is None


def test_unknown_message_type_maps_to_unsupported():
    payload = _payload(messageType="stickerMessage", message={})

    result = EvolutionWebhookRequest(**payload).to_incoming_message()

    assert result.kind == MessageKind.UNSUPPORTED


def test_missing_push_name_falls_back_to_a_default():
    payload = _payload(pushName=None)

    result = EvolutionWebhookRequest(**payload).to_incoming_message()

    assert result.push_name == "Paciente"


def test_missing_remote_jid_is_ignored():
    payload = {"body": {"instance": "therapy-bot", "data": {"messageType": "conversation"}}}

    result = EvolutionWebhookRequest(**payload).to_incoming_message()

    assert result is None

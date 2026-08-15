from therapy_bot_gateway.conversation.domain.port.messenger_port import MessengerPort


class FakeMessenger(MessengerPort):
    def __init__(self):
        self.sent: list[tuple[str, str, str]] = []

    async def send_text(self, instance_name: str, phone_number: str, text: str) -> None:
        self.sent.append((instance_name, phone_number, text))

from abc import ABC, abstractmethod


class MessengerPort(ABC):
    @abstractmethod
    async def send_text(self, instance_name: str, phone_number: str, text: str) -> None:
        pass

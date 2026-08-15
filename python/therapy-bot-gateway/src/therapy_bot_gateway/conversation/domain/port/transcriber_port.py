from abc import ABC, abstractmethod


class TranscriberPort(ABC):
    @abstractmethod
    async def transcribe(self, audio_url: str) -> str:
        pass

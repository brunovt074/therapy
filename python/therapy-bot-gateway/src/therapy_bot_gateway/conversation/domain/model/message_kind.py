from enum import Enum


class MessageKind(Enum):
    TEXT = "text"
    AUDIO = "audio"
    UNSUPPORTED = "unsupported"

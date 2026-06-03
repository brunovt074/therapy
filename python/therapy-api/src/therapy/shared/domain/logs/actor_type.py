from enum import Enum


class ActorType(Enum):
    ADMIN = "admin"
    STAFF = "staff"
    PATIENT = "patient"
    SYSTEM = "system"

from abc import ABC, abstractmethod

from therapy.auth.domain.model.user import User


class UserRepository(ABC):
    @abstractmethod
    async def find_by_id(self, id: str) -> User | None:
        pass

    @abstractmethod
    async def find_by_email(self, email: str) -> User | None:
        pass

    @abstractmethod
    async def save(self, entity: User) -> User:
        pass

    @abstractmethod
    async def verify_password(self, email: str, password: str) -> bool:
        pass

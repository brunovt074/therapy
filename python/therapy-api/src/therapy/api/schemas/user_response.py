from pydantic import BaseModel


class UserResponse(BaseModel):
    user_id: str
    role: str

    class Config:
        from_attributes = True

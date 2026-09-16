from enum import Enum

from pydantic import BaseModel, EmailStr


class RegistrationRole(str, Enum):
    OWNER = "owner"
    CLIENT = "client"


class RegisterRequest(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    phone: str | None = None
    role: RegistrationRole


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    phone: str | None
    role: str
    is_active: bool

    model_config = {
        "from_attributes": True
    }


class TokenResponse(BaseModel):
    access_token: str
    token_type: str
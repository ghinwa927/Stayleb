from enum import Enum
from datetime import datetime
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
    created_at: datetime

    model_config = {
        "from_attributes": True
    }

class UserListResponse(BaseModel):
    items: list[UserResponse]
    page: int
    page_size: int
    total: int
    total_pages: int


class TokenResponse(BaseModel):
    access_token: str
    token_type: str

class ResetPasswordRequest(BaseModel):
    reset_token: str
    new_password: str


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str


class UpdateProfileRequest(BaseModel):
    full_name: str | None = None
    email: EmailStr | None = None
    phone: str | None = None
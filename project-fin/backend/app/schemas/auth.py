from uuid import UUID
from typing import Optional
from app.schemas.base import CamelModel

class RegisterRequest(CamelModel):
    email: str
    password: str
    full_name: str

class LoginRequest(CamelModel):
    email: str
    password: str
    otp_token: Optional[str] = None

class UserResponse(CamelModel):
    id: UUID
    full_name: str
    email: str
    mfa_enabled: bool

class AuthResponse(CamelModel):
    token: Optional[str] = None
    refresh_token: Optional[str] = None
    mfa_required: bool
    user: Optional[UserResponse] = None

class MfaSetupResponse(CamelModel):
    secret: str
    qr_code_url: str

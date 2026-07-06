from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Dict
from app.database.connection import get_db
from app.schemas.auth import RegisterRequest, LoginRequest, AuthResponse, MfaSetupResponse, UserResponse
from app.repositories.base import user_repo, category_repo
from app.models.models import User
from app.core.security import (
    hash_password, verify_password, create_access_token, create_refresh_token,
    generate_totp_secret, verify_totp_token, get_totp_provisioning_url
)
from app.services.audit import AuditLogService
from app.api.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=AuthResponse)
def register(request: RegisterRequest, db: Session = Depends(get_db)):
    if user_repo.exists_by_email(db, request.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="E-mail já está cadastrado"
        )
    
    # Generate base user with Argon2id encrypted password
    mfa_secret = generate_totp_secret()
    user_data = {
        "full_name": request.full_name,
        "email": request.email,
        "password_hash": hash_password(request.password),
        "mfa_enabled": False,
        "mfa_secret": mfa_secret
    }
    user = user_repo.create(db, obj_in=user_data)
    
    # Seed default categories and subcategories for new user
    from app.database.seeding import seed_user_categories
    seed_user_categories(db, user.id)
    
    user_resp = UserResponse(
        id=user.id,
        full_name=user.full_name,
        email=user.email,
        mfa_enabled=user.mfa_enabled
    )
    
    AuditLogService.log_event(None, "CREATE", "USER", user.id, None, user_resp)
    
    token = create_access_token(user.email)
    refresh_token = create_refresh_token(user.email)
    
    return AuthResponse(
        token=token,
        refresh_token=refresh_token,
        mfa_required=False,
        user=user_resp
    )

@router.post("/login", response_model=AuthResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    user = user_repo.find_by_email(db, request.email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="E-mail não cadastrado"
        )
    if not verify_password(request.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Senha incorreta"
        )
    
    user_resp = UserResponse(
        id=user.id,
        full_name=user.full_name,
        email=user.email,
        mfa_enabled=user.mfa_enabled
    )
    
    if user.mfa_enabled:
        if not request.otp_token or not request.otp_token.strip():
            return AuthResponse(
                mfa_required=True,
                user=user_resp
            )
        
        is_otp_valid = verify_totp_token(user.mfa_secret, request.otp_token)
        if not is_otp_valid:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Código de autenticação multifator inválido"
            )
            
    token = create_access_token(user.email)
    refresh_token = create_refresh_token(user.email)
    
    AuditLogService.log_event(user.id, "LOGIN", "USER", user.id, None, None)
    
    return AuthResponse(
        token=token,
        refresh_token=refresh_token,
        mfa_required=False,
        user=user_resp
    )

@router.get("/mfa/setup", response_model=MfaSetupResponse)
def get_mfa_setup(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not current_user.mfa_secret:
        current_user.mfa_secret = generate_totp_secret()
        db.add(current_user)
        db.commit()
        db.refresh(current_user)
    
    qr_code_url = get_totp_provisioning_url(current_user.email, current_user.mfa_secret)
    return MfaSetupResponse(
        secret=current_user.mfa_secret,
        qr_code_url=qr_code_url
    )

@router.post("/mfa/enable")
def enable_mfa(payload: Dict[str, str], current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    code = payload.get("code")
    if not code or not code.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="O código MFA é obrigatório"
        )
    
    is_otp_valid = verify_totp_token(current_user.mfa_secret, code)
    if not is_otp_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Código de autenticação inválido. MFA não foi ativado."
        )
    
    current_user.mfa_enabled = True
    db.add(current_user)
    db.commit()
    
    AuditLogService.log_event(current_user.id, "UPDATE", "MFA_ENABLED", current_user.id, None, None)
    return {"message": "MFA ativado com sucesso"}

@router.post("/mfa/disable")
def disable_mfa(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    current_user.mfa_enabled = False
    db.add(current_user)
    db.commit()
    
    AuditLogService.log_event(current_user.id, "UPDATE", "MFA_DISABLED", current_user.id, None, None)
    return {"message": "MFA desativado com sucesso"}

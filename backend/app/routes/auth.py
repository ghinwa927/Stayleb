from fastapi import APIRouter, Depends, Response, Request, HTTPException, status
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.schemas.user import RegisterRequest, UserResponse
from app.services.auth_service import register_user
from app.schemas.user import (
    RegisterRequest,
    LoginRequest,
    UserResponse,
    TokenResponse
)
from app.services.auth_service import (
    register_user,
    login_user
)

from datetime import datetime, timezone
from sqlalchemy import select

from app.models.refresh_token import RefreshToken
from app.models.user import User
from app.core.security import (
    hash_refresh_token,
    create_access_token
)

from app.schemas.auth import ForgotPasswordRequest,VerifyOTPRequest
from app.services.auth_service import forgot_password,verify_password_reset_otp

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=201
)
def register(
    user_data: RegisterRequest,
    db: Session = Depends(get_db)
):
    return register_user(db, user_data)

@router.post(
    "/login",
    response_model=TokenResponse
)
def login(
    login_data: LoginRequest,
    response: Response,
    db: Session = Depends(get_db)
):
    result = login_user(db, login_data)

    response.set_cookie(
        key="refresh_token",
        value=result["refresh_token"],
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=7 * 24 * 60 * 60
    )

    return {
        "access_token": result["access_token"],
        "token_type": result["token_type"]
    }

@router.post(
    "/refresh",
    response_model=TokenResponse
)
def refresh_access_token(
    request: Request,
    db: Session = Depends(get_db)
):
    refresh_token = request.cookies.get("refresh_token")

    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token missing"
        )

    token_hash = hash_refresh_token(refresh_token)

    statement = select(RefreshToken).where(
        RefreshToken.token_hash == token_hash
    )

    stored_token = db.scalar(statement)

    if not stored_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )

    if stored_token.revoked_at is not None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token has been revoked"
        )

    if stored_token.expires_at < datetime.now(timezone.utc).replace(tzinfo=None):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token has expired"
        )

    user_statement = select(User).where(
        User.id == stored_token.user_id
    )

    user = db.scalar(user_statement)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive"
        )

    access_token = create_access_token({
        "sub": str(user.id),
        "role": user.role.value
    })

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }

@router.post("/logout")
def logout(
    request: Request,
    response: Response,
    db: Session = Depends(get_db)
):
    refresh_token = request.cookies.get("refresh_token")

    if refresh_token:
        token_hash = hash_refresh_token(refresh_token)

        statement = select(RefreshToken).where(
            RefreshToken.token_hash == token_hash
        )

        stored_token = db.scalar(statement)

        if stored_token and stored_token.revoked_at is None:
            stored_token.revoked_at = (
                datetime.now(timezone.utc)
                .replace(tzinfo=None)
            )

            db.commit()

    response.delete_cookie(
        key="refresh_token",
        httponly=True,
        secure=False,
        samesite="lax"
    )

    return {
        "message": "Logged out successfully"
    }

@router.post("/forgot-password")
def forgot_password_route(
    data: ForgotPasswordRequest,
    db: Session = Depends(get_db),
):
    forgot_password(data.email, db)

    return {
        "message": "If that email exists, an OTP has been sent."
    }

@router.post("/verify-reset-otp")
def verify_reset_otp_route(
    data: VerifyOTPRequest,
    db: Session = Depends(get_db),
):
    try:
        reset_token = verify_password_reset_otp(
            data.email,
            data.otp,
            db,
        )

        return {
            "message": "OTP verified successfully",
            "reset_token": reset_token,
        }

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e),
        )
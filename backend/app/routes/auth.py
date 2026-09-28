from fastapi import APIRouter, Depends, Response, Request, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta

from app.database.database import get_db
from app.schemas.user import (
    RegisterRequest,
    LoginRequest,
    UserResponse,
    TokenResponse,
    ResetPasswordRequest,
    ChangePasswordRequest,
)
from app.services.auth_service import register_user, login_user, reset_password
from app.dependencies import get_current_user

from app.core.datetime_utils import utcnow_naive
from app.core.rate_limit import rate_limit
from sqlalchemy import select

from app.models.refresh_token import RefreshToken
from app.models.user import User
from app.core.security import (
    hash_refresh_token,
    create_refresh_token,
    create_access_token
)
from app.config import settings

from app.schemas.auth import ForgotPasswordRequest,VerifyOTPRequest
from app.services.auth_service import forgot_password,verify_password_reset_otp

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=201,
    dependencies=[Depends(rate_limit(
        limit=10, window_seconds=3600, scope="register",
        email_field="email", email_limit=5, email_window_seconds=3600,
    ))],
)
def register(
    user_data: RegisterRequest,
    db: Session = Depends(get_db)
):
    return register_user(db, user_data)

@router.post(
    "/login",
    response_model=TokenResponse,
    dependencies=[Depends(rate_limit(
        limit=10, window_seconds=600, scope="login",
        email_field="email", email_limit=10, email_window_seconds=600,
    ))],
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
        secure=settings.refresh_cookie_secure,
        samesite=settings.refresh_cookie_samesite,
        max_age=settings.refresh_cookie_max_age,
        path="/"
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
    response: Response,
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

    if stored_token.expires_at < utcnow_naive():
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

    # Refresh-token rotation: the presented token is single-use. Revoke
    # it and issue a fresh token, so a replayed (stolen) token fails.
    # No schema change needed: revoked_at already exists.
    stored_token.revoked_at = utcnow_naive()
    new_refresh_token = create_refresh_token()
    db.add(RefreshToken(
        user_id=user.id,
        token_hash=hash_refresh_token(new_refresh_token),
        expires_at=(
            utcnow_naive()
            + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        ),
    ))
    db.commit()

    response.set_cookie(
        key="refresh_token",
        value=new_refresh_token,
        httponly=True,
        secure=settings.refresh_cookie_secure,
        samesite=settings.refresh_cookie_samesite,
        max_age=settings.refresh_cookie_max_age,
        path="/"
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
            # Naive UTC, matching the RefreshToken column convention.
            stored_token.revoked_at = utcnow_naive()

            db.commit()

    response.delete_cookie(
        key="refresh_token",
        httponly=True,
        secure=settings.refresh_cookie_secure,
        samesite=settings.refresh_cookie_samesite,
        path="/"
    )

    return {
        "message": "Logged out successfully"
    }

@router.post(
    "/forgot-password",
    dependencies=[Depends(rate_limit(
        limit=5, window_seconds=600, scope="forgot-password",
        email_field="email", email_limit=5, email_window_seconds=600,
    ))],
)
def forgot_password_route(
    data: ForgotPasswordRequest,
    db: Session = Depends(get_db),
):
    forgot_password(data.email, db)

    return {
        "message": "If that email exists, an OTP has been sent."
    }

@router.post(
    "/verify-reset-otp",
    dependencies=[Depends(rate_limit(
        limit=10, window_seconds=600, scope="verify-reset-otp",
        email_field="email", email_limit=10, email_window_seconds=600,
    ))],
)
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

@router.post("/change-password")
def change_password_route(
    data: ChangePasswordRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from app.core.security import verify_password, hash_password
    from app.core.password_validation import validate_password

    if not verify_password(data.current_password, current_user.password_hash):
        raise HTTPException(status_code=400, detail="Current password is incorrect")

    validate_password(data.new_password)

    current_user.password_hash = hash_password(data.new_password)
    # revoke all refresh tokens for this user for security
    from sqlalchemy import delete
    from app.models.refresh_token import RefreshToken

    db.execute(delete(RefreshToken).where(RefreshToken.user_id == current_user.id))
    db.commit()
    return {"message": "Password updated successfully"}

@router.post(
    "/reset-password",
    dependencies=[Depends(rate_limit(
        limit=10, window_seconds=600, scope="reset-password",
    ))],
)
def reset_password_route(
    data: ResetPasswordRequest,
    db: Session = Depends(get_db),
):
    return reset_password(
        db=db,
        reset_token=data.reset_token,
        new_password=data.new_password,
    )
from datetime import datetime, timedelta, timezone

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.config import settings
from app.models.user import User, UserRole
from app.models.refresh_token import RefreshToken
from app.schemas.user import RegisterRequest, LoginRequest
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    hash_refresh_token,
)

from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from app.models.user import User
from app.models.password_reset_otp import PasswordResetOTP
from app.services.otp_service import generate_otp, hash_otp,verify_otp
from app.services.email_service import send_email
from app.templates.otp_email import generate_otp_template
from app.core.security import create_password_reset_token

def register_user(db: Session, user_data: RegisterRequest):

    # Check if email already exists
    statement = select(User).where(User.email == user_data.email)

    existing_user = db.scalar(statement)

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered"
        )

    # Create the new user
    new_user = User(
        full_name=user_data.full_name,
        email=user_data.email,
        password_hash=hash_password(user_data.password),
        phone=user_data.phone,
        role=UserRole(user_data.role.value)
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user

from app.core.security import verify_password, create_access_token


def login_user(db: Session, login_data: LoginRequest):

    # Find user by email
    statement = select(User).where(User.email == login_data.email)
    user = db.scalar(statement)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    # Verify password
    if not verify_password(
        login_data.password,
        user.password_hash
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    # Check if account is active
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive"
        )

    # Create access token
    access_token = create_access_token({
        "sub": str(user.id),
        "role": user.role.value
    })

    # Create refresh token
    refresh_token = create_refresh_token()

    # Hash refresh token before storing it
    refresh_token_hash = hash_refresh_token(refresh_token)

    # Calculate refresh token expiration
    expires_at = (
        datetime.now(timezone.utc)
        + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    ).replace(tzinfo=None)

    # Store refresh-token session in database
    db_refresh_token = RefreshToken(
        user_id=user.id,
        token_hash=refresh_token_hash,
        expires_at=expires_at
    )

    db.add(db_refresh_token)
    db.commit()

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }

def forgot_password(email: str, db: Session):

    user = db.query(User).filter(User.email == email).first()

    # Don't reveal whether the email exists
    if not user:
        return

    # Generate OTP
    otp = generate_otp()

    # Hash OTP before storing it
    otp_hash = hash_otp(otp)

    # OTP expires after 10 minutes
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=10)

    # Check whether this user already has an OTP
    existing_otp = (
        db.query(PasswordResetOTP)
        .filter(PasswordResetOTP.user_id == user.id)
        .first()
    )

    if existing_otp:
        existing_otp.otp_hash = otp_hash
        existing_otp.expires_at = expires_at
        existing_otp.attempts = 0

    else:
        password_reset_otp = PasswordResetOTP(
            user_id=user.id,
            otp_hash=otp_hash,
            expires_at=expires_at,
            attempts=0,
        )

        db.add(password_reset_otp)

    db.commit()

    # Create email
    html = generate_otp_template(
        full_name=user.full_name,
        otp=otp,
    )

    # Send email
    send_email(
        to=user.email,
        subject="Your StayLeb Password Reset Code",
        html_content=html,
    )

def verify_password_reset_otp(
    email: str,
    otp: str,
    db: Session,
) -> str:

    # Find user by email
    user = db.query(User).filter(User.email == email).first()

    if not user:
        raise ValueError("Invalid email or OTP")

    # Find the user's password-reset OTP
    reset_otp = (
        db.query(PasswordResetOTP)
        .filter(PasswordResetOTP.user_id == user.id)
        .first()
    )

    if not reset_otp:
        raise ValueError("Invalid email or OTP")

    # Maximum 5 incorrect attempts
    if reset_otp.attempts >= 5:
        db.delete(reset_otp)
        db.commit()

        raise ValueError(
            "Too many invalid attempts. Request a new code."
        )

    # MySQL normally returns a timezone-naive datetime
    current_time = datetime.now(timezone.utc).replace(tzinfo=None)

    # Check if OTP expired
    if reset_otp.expires_at < current_time:
        db.delete(reset_otp)
        db.commit()

        raise ValueError("OTP has expired")

    # Verify entered OTP against stored OTP hash
    if not verify_otp(
        otp,
        reset_otp.otp_hash
    ):
        reset_otp.attempts += 1
        db.commit()

        raise ValueError("Invalid OTP")

    # OTP is correct.
    # Delete it so it cannot be used again.
    db.delete(reset_otp)
    db.commit()

    # Create short-lived password reset token
    reset_token = create_password_reset_token(
        user.id
    )

    return reset_token
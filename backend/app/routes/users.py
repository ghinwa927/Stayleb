from fastapi import APIRouter, Depends, HTTPException, status

from app.database.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.user import UpdateProfileRequest, UserResponse
from sqlalchemy.orm import Session


router = APIRouter(
    prefix="/users",
    tags=["Users"]
)


@router.get(
    "/me",
    response_model=UserResponse
)
def get_my_profile(
    current_user: User = Depends(get_current_user)
):
    return current_user


@router.patch(
    "/me",
    response_model=UserResponse
)
def update_my_profile(
    payload: UpdateProfileRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    updated = False
    if payload.full_name is not None:
        name = payload.full_name.strip()
        if not name:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Full name cannot be empty"
            )
        if len(name) < 2:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Full name must be at least 2 characters"
            )
        if len(name) > 200:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Full name must be at most 200 characters"
            )
        current_user.full_name = name
        updated = True
    if payload.phone is not None:
        phone = payload.phone.strip()
        # Allow clearing phone
        if phone == "":
            current_user.phone = None
        else:
            if len(phone) > 30:
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail="Phone must be at most 30 characters"
                )
            current_user.phone = phone
        updated = True
    if payload.email is not None:
        email = payload.email.strip().lower()
        if not email:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Email cannot be empty"
            )
        # check uniqueness
        from sqlalchemy import select
        existing = db.scalar(select(User).where(User.email == email, User.id != current_user.id))
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email already in use"
            )
        current_user.email = email
        updated = True
    if updated:
        db.add(current_user)
        db.commit()
        db.refresh(current_user)
    return current_user
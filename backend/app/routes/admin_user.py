from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.user import User
from app.schemas.user import UserResponse
from app.services.admin_user_service import (
    get_all_users,
    get_user_by_id,
    block_user,
    unblock_user,
)
from app.dependencies import require_admin


router = APIRouter(
    prefix="/admin/users",
    tags=["Admin - Users"],
)


@router.get("", response_model=list[UserResponse])
def admin_get_users(
    role: str | None = Query(
        default=None,
        pattern="^(admin|owner|client)$",
    ),
    is_active: bool | None = Query(default=None),
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin),
):
    return get_all_users(
        db=db,
        role=role,
        is_active=is_active,
    )


@router.get("/{user_id}", response_model=UserResponse)
def admin_get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin),
):
    try:
        return get_user_by_id(
            db=db,
            user_id=user_id,
        )

    except ValueError as e:
        raise HTTPException(
            status_code=404,
            detail=str(e),
        )


@router.patch("/{user_id}/block", response_model=UserResponse)
def admin_block_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin),
):
    try:
        return block_user(
            db=db,
            user_id=user_id,
            current_admin_id=current_admin.id,
        )

    except ValueError as e:
        message = str(e)

        if message == "User not found":
            raise HTTPException(
                status_code=404,
                detail=message,
            )

        raise HTTPException(
            status_code=400,
            detail=message,
        )


@router.patch("/{user_id}/unblock", response_model=UserResponse)
def admin_unblock_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin),
):
    try:
        return unblock_user(
            db=db,
            user_id=user_id,
        )

    except ValueError as e:
        raise HTTPException(
            status_code=404,
            detail=str(e),
        )
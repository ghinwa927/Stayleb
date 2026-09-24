from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import date
from app.database.database import get_db
from app.models.user import User
from app.schemas.user import UserResponse,UserListResponse
from app.services.admin_user_service import (
    get_admin_users,
    get_user_by_id,
    block_user,
    unblock_user,
)
from app.dependencies import require_admin


router = APIRouter(
    prefix="/admin/users",
    tags=["Admin - Users"],
)


@router.get(
    "",
    response_model=UserListResponse,
)
def list_users(
    role: str | None = Query(default=None),
    is_active: bool | None = Query(default=None),

    search: str | None = Query(
        default=None,
        max_length=100,
    ),

    sort: str = Query(
        default="newest",
        pattern="^(newest|oldest|name_asc|name_desc)$",
    ),

    created_from: date | None = Query(
        default=None,
    ),

    created_to: date | None = Query(
        default=None,
    ),

    page: int = Query(
        default=1,
        ge=1,
    ),

    page_size: int = Query(
        default=20,
        ge=1,
        le=100,
    ),

    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    if (
        created_from is not None
        and created_to is not None
        and created_from > created_to
    ):
        raise HTTPException(
            status_code=400,
            detail="created_from cannot be after created_to",
        )

    return get_admin_users(
        db=db,
        role=role,
        is_active=is_active,
        search=search,
        sort=sort,
        created_from=created_from,
        created_to=created_to,
        page=page,
        page_size=page_size,
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
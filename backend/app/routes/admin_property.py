from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.user import User
from app.schemas.property import PropertyResponse,AdminPropertyListResponse
from app.schemas.admin_property import PropertyRejectRequest
from app.services.admin_property_service import (
    get_admin_properties,
    get_property_by_id,
    approve_property,
    reject_property,
)
from app.dependencies import require_admin


router = APIRouter(
    prefix="/admin/properties",
    tags=["Admin - Properties"],
)


@router.get(
    "/",
    response_model=AdminPropertyListResponse,
)
def list_properties(
    status: str | None = Query(
        default=None,
        pattern="^(pending|approved|rejected)$",
    ),
    search: str | None = Query(
        default=None,
        max_length=150,
    ),
    owner_id: int | None = Query(
        default=None,
        ge=1,
    ),
    location: str | None = Query(
        default=None,
        max_length=150,
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
    return get_admin_properties(
        db=db,
        status=status,
        search=search,
        owner_id=owner_id,
        location=location,
        page=page,
        page_size=page_size,
    )

@router.get("/{property_id}", response_model=PropertyResponse)
def admin_get_property(
    property_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    try:
        return get_property_by_id(
            db=db,
            property_id=property_id,
        )

    except ValueError as e:
        raise HTTPException(
            status_code=404,
            detail=str(e),
        )


@router.patch("/{property_id}/approve", response_model=PropertyResponse)
def admin_approve_property(
    property_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    try:
        return approve_property(
            db=db,
            property_id=property_id,
        )

    except ValueError as e:
        raise HTTPException(
            status_code=404,
            detail=str(e),
        )


@router.patch("/{property_id}/reject", response_model=PropertyResponse)
def admin_reject_property(
    property_id: int,
    data: PropertyRejectRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    try:
        return reject_property(
            db=db,
            property_id=property_id,
            rejection_reason=data.rejection_reason,
        )

    except ValueError as e:
        raise HTTPException(
            status_code=404,
            detail=str(e),
        )
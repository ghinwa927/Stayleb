from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.user import User
from app.schemas.property import PropertyResponse
from app.schemas.admin_property import PropertyRejectRequest
from app.services.admin_property_service import (
    get_all_properties,
    get_property_by_id,
    approve_property,
    reject_property,
)
from app.dependencies import require_admin


router = APIRouter(
    prefix="/admin/properties",
    tags=["Admin - Properties"],
)


@router.get("", response_model=list[PropertyResponse])
def admin_get_properties(
    status: str | None = Query(
        default=None,
        pattern="^(pending|approved|rejected)$",
    ),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    return get_all_properties(
        db=db,
        status=status,
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
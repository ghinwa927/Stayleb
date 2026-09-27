from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.user import User
from app.dependencies import require_owner

from app.schemas.property_blocked_date import (
    PropertyBlockedDateCreate,
    PropertyBlockedDateResponse,
)

from app.services.property_blocked_data_service import (
    get_property_blocked_dates,
    create_property_blocked_date,
    delete_property_blocked_date,
)


router = APIRouter(
    prefix="/properties",
    tags=["Property Blocked Dates"]
)


@router.get(
    "/{property_id}/blocked-dates",
    response_model=list[PropertyBlockedDateResponse]
)
def get_blocked_dates_route(
    property_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_owner)
):
    try:
        return get_property_blocked_dates(
            db=db,
            property_id=property_id,
            owner_id=current_user.id
        )

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )


@router.post(
    "/{property_id}/blocked-dates",
    response_model=PropertyBlockedDateResponse,
    status_code=status.HTTP_201_CREATED
)
def create_blocked_date_route(
    property_id: int,
    blocked_date_data: PropertyBlockedDateCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_owner)
):
    try:
        return create_property_blocked_date(
            db=db,
            property_id=property_id,
            owner_id=current_user.id,
            blocked_date_data=blocked_date_data
        )

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.delete(
    "/{property_id}/blocked-dates/{blocked_date_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
def delete_blocked_date_route(
    property_id: int,
    blocked_date_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_owner)
):
    try:
        delete_property_blocked_date(
            db=db,
            property_id=property_id,
            blocked_date_id=blocked_date_id,
            owner_id=current_user.id
        )

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )

    return None
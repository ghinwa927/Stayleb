from datetime import date
from typing import Optional, Literal

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.dependencies import require_owner
from app.models.user import User
from app.schemas.owner_earnings import OwnerEarningsResponse,OwnerEarningsLedgerResponse
from app.services.owner_earnings_service import get_owner_earnings,get_owner_earnings_ledger


router = APIRouter(
    prefix="/owner",
    tags=["Owner Earnings"],
)


@router.get(
    "/earnings",
    response_model=OwnerEarningsResponse,
)
def owner_earnings(
    from_date: Optional[date] = Query(
        default=None,
    ),
    to_date: Optional[date] = Query(
        default=None,
    ),
    property_id: Optional[int] = Query(
        default=None,
        ge=1,
    ),
    group_by: Optional[
        Literal["day", "month"]
    ] = Query(
        default=None,
    ),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_owner),
):
    return get_owner_earnings(
        db=db,
        owner_id=current_user.id,
        from_date=from_date,
        to_date=to_date,
        property_id=property_id,
        group_by=group_by,
    )

@router.get(
    "/earnings/ledger",
    response_model=OwnerEarningsLedgerResponse,
)
def owner_earnings_ledger(
    from_date: Optional[date] = Query(
        default=None,
    ),
    to_date: Optional[date] = Query(
        default=None,
    ),
    property_id: Optional[int] = Query(
        default=None,
        ge=1,
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
    current_user: User = Depends(require_owner),
):
    return get_owner_earnings_ledger(
        db=db,
        owner_id=current_user.id,
        from_date=from_date,
        to_date=to_date,
        property_id=property_id,
        page=page,
        page_size=page_size,
    )
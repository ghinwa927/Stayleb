from datetime import date
from typing import Literal, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.dependencies import require_admin
from app.models.user import User
from app.schemas.admin_booking import (
    AdminBookingListResponse,
    AdminBookingStatsResponse,
)
from app.services.admin_booking_service import (
    get_admin_bookings,
    get_admin_booking_stats,
)
from app.services.booking_service import complete_expired_bookings


router = APIRouter(
    prefix="/admin/bookings",
    tags=["Admin Bookings"],
)


@router.get(
    "/stats",
    response_model=AdminBookingStatsResponse,
)
def get_booking_stats(
    from_date: date | None = Query(default=None),
    to_date: date | None = Query(default=None),
    property_id: int | None = Query(default=None, ge=1),
    group_by: Literal["day", "month"] | None = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    if (
        from_date is not None
        and to_date is not None
        and from_date > to_date
    ):
        raise HTTPException(
            status_code=400,
            detail="from_date cannot be after to_date",
        )

    complete_expired_bookings(db)

    return get_admin_booking_stats(
        db=db,
        from_date=from_date,
        to_date=to_date,
        property_id=property_id,
        group_by=group_by,
    )


@router.get(
    "",
    response_model=AdminBookingListResponse,
)
def list_admin_bookings(
    booking_status: Optional[str] = Query(default=None),
    payment_method: Optional[str] = Query(default=None),
    payment_status: Optional[str] = Query(default=None),
    search: Optional[str] = Query(default=None),
    from_date: Optional[date] = Query(default=None),
    to_date: Optional[date] = Query(default=None),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    complete_expired_bookings(db)

    return get_admin_bookings(
        db=db,
        booking_status=booking_status,
        payment_method=payment_method,
        payment_status=payment_status,
        search=search,
        from_date=from_date,
        to_date=to_date,
        page=page,
        page_size=page_size,
    )
from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session

from app.database.database import get_db

from app.schemas.booking import (
    BookingCreate,
    BookingResponse,
    BookingPreviewResponse,
)

from app.services.booking_service import (
    create_booking,
    preview_booking,
    get_booking_by_id,
    get_owner_cash_requests,
    approve_cash_booking,
    reject_cash_booking,
    cancel_booking,
    complete_expired_bookings
)

from app.dependencies import (
    get_current_user,
    require_client,
    require_owner,
)

from app.models.user import User
from app.models.property import Property


router = APIRouter(
    prefix="/bookings",
    tags=["Bookings"],
)


@router.post(
    "/preview",
    response_model=BookingPreviewResponse,
    status_code=status.HTTP_200_OK,
)
def preview_booking_pricing(
    booking_data: BookingCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_client),
):
    return preview_booking(
        db=db,
        booking_data=booking_data,
        client_id=current_user.id,
    )


@router.post(
    "",
    response_model=BookingResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_new_booking(
    booking_data: BookingCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_client),
):
    return create_booking(
        db=db,
        booking_data=booking_data,
        client_id=current_user.id,
    )


@router.get(
    "/my-bookings",
    response_model=list[BookingResponse],
)
def list_my_bookings(
    db: Session = Depends(get_db),
    current_user=Depends(require_client),
):
    complete_expired_bookings(db)
    from app.models.booking import Booking
    return (
        db.query(Booking)
        .filter(Booking.client_id == current_user.id)
        .order_by(Booking.created_at.desc())
        .all()
    )


@router.get(
    "/owner/cash-requests",
    response_model=list[BookingResponse],
)
def owner_cash_requests(
    db: Session = Depends(get_db),
    current_user=Depends(require_owner),
):
    return get_owner_cash_requests(
        db=db,
        owner_id=current_user.id,
    )


@router.get(
    "/property/{property_id}",
    response_model=list[BookingResponse],
)
def list_bookings_for_property(
    property_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_owner),
):
    # ensure property belongs to owner
    prop = db.query(Property).filter(Property.id == property_id, Property.owner_id == current_user.id).first()
    if not prop:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Property not found or not owned by you")
    from app.models.booking import Booking
    bookings = (
        db.query(Booking)
        .filter(Booking.property_id == property_id)
        .order_by(Booking.check_in.asc())
        .all()
    )
    return bookings


@router.get(
    "/{booking_id}",
    response_model=BookingResponse,
)
def get_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    complete_expired_bookings(db)
    return get_booking_by_id(
        db=db,
        booking_id=booking_id,
        current_user=current_user,
    )

@router.patch(
    "/{booking_id}/approve",
    response_model=BookingResponse,
)
def approve_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_owner),
):
    return approve_cash_booking(
        db=db,
        booking_id=booking_id,
        owner_id=current_user.id,
    )


@router.patch(
    "/{booking_id}/reject",
    response_model=BookingResponse,
)
def reject_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_owner),
):
    return reject_cash_booking(
        db=db,
        booking_id=booking_id,
        owner_id=current_user.id,
    )

@router.patch(
    "/{booking_id}/cancel",
    response_model=BookingResponse,
)
def cancel_client_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_client),
):
    return cancel_booking(
        db=db,
        booking_id=booking_id,
        client_id=current_user.id,
    )


from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.schemas.booking import BookingCreate, BookingResponse
from app.services.booking_service import create_booking

from app.dependencies import require_client, require_owner
from app.models.user import User
from app.models.property import Property


router = APIRouter(
    prefix="/bookings",
    tags=["Bookings"],
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
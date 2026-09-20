from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.schemas.payment import (
    PaymentCreate,
    PaymentResponse,
)
from app.services.payment_service import create_payment

# Use your actual require_client import.
from app.dependencies import require_client


router = APIRouter(
    prefix="/payments",
    tags=["Payments"],
)


@router.post(
    "/bookings/{booking_id}",
    response_model=PaymentResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_booking_payment(
    booking_id: int,
    payment_data: PaymentCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_client),
):
    return create_payment(
        db=db,
        booking_id=booking_id,
        payment_method=payment_data.payment_method,
        client_id=current_user.id,
    )
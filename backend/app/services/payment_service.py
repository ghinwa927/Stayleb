from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.booking import Booking
from app.models.payment import Payment


def create_payment(
    db: Session,
    booking_id: int,
    payment_method: str,
    client_id: int,
):
    # Find booking
    booking = (
        db.query(Booking)
        .filter(Booking.id == booking_id)
        .first()
    )

    if booking is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found",
        )

    # Client can only pay for their own booking
    if booking.client_id != client_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You cannot pay for this booking",
        )

    # Booking must still be pending
    if booking.status != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Payment cannot be created for this booking",
        )

    # Prevent duplicate payment
    existing_payment = (
        db.query(Payment)
        .filter(Payment.booking_id == booking.id)
        .first()
    )

    if existing_payment:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Payment already exists for this booking",
        )

    # ---------------------------------
    # Cash
    # ---------------------------------

    if payment_method == "cash":

        payment = Payment(
            booking_id=booking.id,

            # Never trust amount from frontend.
            amount=booking.total_price,

            payment_method="cash",
            payment_status="pending",

            stripe_payment_id=None,
            paid_at=None,
        )

        db.add(payment)
        db.commit()
        db.refresh(payment)

        return payment

    # ---------------------------------
    # Stripe will be implemented next
    # ---------------------------------

    if payment_method == "stripe":
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail="Stripe payment is not implemented yet",
        )

    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Invalid payment method",
    )
import os
import stripe
from datetime import datetime, timezone

from decimal import Decimal, ROUND_HALF_UP
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.booking import Booking
from app.models.payment import Payment, PaymentMethod, PaymentStatus
from app.models.commission_settlement import CommissionSettlement

stripe.api_key = os.getenv("STRIPE_SECRET_KEY")


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
    

    # Temporary checkout hold must still be active
    if (
       booking.expires_at is not None
       and booking.expires_at <= datetime.now()
    ):
       raise HTTPException(
          status_code=status.HTTP_409_CONFLICT,
          detail=(
            "This booking checkout has expired. "
            "Please create a new booking."
        ),
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

    # Cash payment is now waiting for owner approval.
    # It should no longer use the temporary checkout expiry.
    booking.expires_at = None

    db.commit()

    db.refresh(payment)
    db.refresh(booking)

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

def create_stripe_payment(
    db: Session,
    booking_id: int,
    client_id: int,
):
    # ---------------------------------
    # 1. Find booking
    # ---------------------------------

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

    # ---------------------------------
    # 2. Verify ownership
    # ---------------------------------

    if booking.client_id != client_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You cannot pay for this booking",
        )

    # ---------------------------------
    # 3. Booking must be pending
    # ---------------------------------

    if booking.status != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Payment cannot be created for this booking",
        )

    # ---------------------------------
    # Temporary checkout hold
    # must still be active
    # ---------------------------------

    if (
        booking.expires_at is not None
        and booking.expires_at <= datetime.now()
    ):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "This booking checkout has expired. "
                "Please create a new booking."
            ),
        )

    # ---------------------------------
    # 4. Check existing payment
    # ---------------------------------

    existing_payment = (
        db.query(Payment)
        .filter(
            Payment.booking_id == booking.id
        )
        .first()
    )

    if existing_payment:

        # Cash payment already exists.
        # Do not allow switching it to Stripe.
        if existing_payment.payment_method != "stripe":
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Payment already exists for this booking",
            )

        # ---------------------------------
        # Existing pending Stripe payment
        #
        # Reuse its PaymentIntent.
        # ---------------------------------

        if (
            existing_payment.payment_status == "pending"
            and existing_payment.stripe_payment_id
        ):
            try:
                intent = stripe.PaymentIntent.retrieve(
                    existing_payment.stripe_payment_id
                )

                if (
                    intent
                    and getattr(
                        intent,
                        "client_secret",
                        None,
                    )
                ):
                    return {
                        "payment": existing_payment,
                        "client_secret": intent.client_secret,
                    }

            except stripe.StripeError:
                pass

        # ---------------------------------
        # Previous Stripe attempt failed
        #
        # The booking expiration was already
        # checked above, so retry is allowed.
        # ---------------------------------

        elif existing_payment.payment_status == "failed":
            pass

        # ---------------------------------
        # Any other payment state should
        # not create another payment.
        # ---------------------------------

        else:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Payment already exists for this booking",
            )

    # ---------------------------------
    # 5. Convert amount to cents
    # ---------------------------------

    amount_in_cents = int(
        (
            Decimal(booking.total_price)
            * Decimal("100")
        ).quantize(
            Decimal("1"),
            rounding=ROUND_HALF_UP,
        )
    )

    # ---------------------------------
    # 6. Create Stripe PaymentIntent
    # ---------------------------------

    try:
        payment_intent = stripe.PaymentIntent.create(
            amount=amount_in_cents,
            currency="usd",

            metadata={
                "booking_id": str(booking.id),
                "client_id": str(client_id),
            },

            automatic_payment_methods={
                "enabled": True,
            },
        )

    except stripe.StripeError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Unable to create Stripe payment",
        ) from exc

    # ---------------------------------
    # 7. Create or reuse local payment
    # ---------------------------------

    if existing_payment:
        # Previous Stripe payment failed.
        # Reuse the same database Payment row.

        payment = existing_payment

        payment.amount = booking.total_price
        payment.payment_method = "stripe"
        payment.payment_status = "pending"
        payment.stripe_payment_id = payment_intent.id
        payment.paid_at = None

    else:
        # First Stripe attempt.

        payment = Payment(
            booking_id=booking.id,
            amount=booking.total_price,
            payment_method="stripe",
            payment_status="pending",
            stripe_payment_id=payment_intent.id,
            paid_at=None,
        )

        db.add(payment)

    # ---------------------------------
    # 8. Save local payment
    # ---------------------------------

    try:
        db.commit()
        db.refresh(payment)

    except Exception:
        db.rollback()

        # PaymentIntent was created but
        # local DB save failed.
        try:
            stripe.PaymentIntent.cancel(
                payment_intent.id
            )
        except stripe.StripeError:
            pass

        raise

    # ---------------------------------
    # 9. Return Stripe client secret
    # ---------------------------------

    return {
        "payment": payment,
        "client_secret": payment_intent.client_secret,
    }


def mark_cash_payment_paid(
    db: Session,
    booking_id: int,
    current_user,
):
    # -----------------------------------------
    # Find booking
    # -----------------------------------------

    booking = (
        db.query(Booking)
        .filter(Booking.id == booking_id)
        .first()
    )

    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found",
        )

    # -----------------------------------------
    # Owner authorization
    # -----------------------------------------

    if booking.property.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only manage payments for your own properties",
        )

    # -----------------------------------------
    # Booking must already be confirmed
    # -----------------------------------------

    if booking.status != "confirmed":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only confirmed bookings can be marked as paid",
        )

    # -----------------------------------------
    # Find payment
    # -----------------------------------------

    payment = (
        db.query(Payment)
        .filter(Payment.booking_id == booking.id)
        .first()
    )

    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found",
        )

    # -----------------------------------------
    # Must be CASH
    # -----------------------------------------

    if payment.payment_method != PaymentMethod.CASH.value:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only cash payments can be manually marked as paid",
        )

    # -----------------------------------------
    # Must still be pending
    # -----------------------------------------

    if payment.payment_status != PaymentStatus.PENDING.value:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only pending cash payments can be marked as paid",
        )

    # -----------------------------------------
    # Mark cash as received
    # -----------------------------------------

    # -----------------------------------------
    # Mark cash payment as received
    # -----------------------------------------

    payment.payment_status = PaymentStatus.PAID.value
    payment.paid_at = datetime.now(timezone.utc).replace(tzinfo=None)


   # -----------------------------------------
   # Create commission settlement
   # -----------------------------------------

    existing_settlement = (
      db.query(CommissionSettlement)
      .filter(
          CommissionSettlement.booking_id == booking.id
      )
      .first()
    )

    if not existing_settlement:
      settlement = CommissionSettlement(
          booking_id=booking.id,
          owner_id=booking.property.owner_id,
          commission_amount=booking.commission_amount,
          status="unpaid",
     )

    db.add(settlement)


   # -----------------------------------------
   # Save everything in one transaction
   # -----------------------------------------

    db.commit()
    db.refresh(payment)

    return payment
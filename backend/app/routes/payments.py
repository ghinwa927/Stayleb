import os
import stripe
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, status, Request, HTTPException, Header
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.schemas.payment import (
    PaymentCreate,
    PaymentResponse,
    StripePaymentResponse,
)
from app.services.payment_service import (
    create_payment,
    create_stripe_payment,
    mark_cash_payment_paid
)

from app.dependencies import require_client, get_current_user,require_owner
from app.models.payment import Payment
from app.models.booking import Booking
from app.models.property import Property
from app.schemas.payment import PaymentResponse

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

@router.post(
    "/bookings/{booking_id}/stripe",
    response_model=StripePaymentResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_booking_stripe_payment(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_client),
):
    return create_stripe_payment(
        db=db,
        booking_id=booking_id,
        client_id=current_user.id,
    )


@router.post("/webhook", status_code=status.HTTP_200_OK)
async def stripe_webhook(
    request: Request,
    db: Session = Depends(get_db),
):
    """
    Stripe webhook endpoint.

    Handles:
    - payment_intent.succeeded
    - payment_intent.payment_failed

    Stripe is the authoritative source for online payment status.
    The handler is idempotent and safe if Stripe sends the same event
    more than once.
    """

    # Stripe signature verification requires the RAW request body.
    payload = await request.body()

    sig_header = request.headers.get("stripe-signature")

    webhook_secret = os.getenv("STRIPE_WEBHOOK_SECRET")

    if not webhook_secret or webhook_secret.strip() in (
        "",
        "...",
        "whsec_...",
    ):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Stripe webhook secret not configured",
        )

    if not sig_header:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing Stripe signature",
        )

    # ---------------------------------------------------------
    # Verify that this webhook really came from Stripe
    # ---------------------------------------------------------
    try:
        event = stripe.Webhook.construct_event(
            payload=payload,
            sig_header=sig_header,
            secret=webhook_secret,
        )

    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid Stripe webhook payload",
        )

    except stripe.error.SignatureVerificationError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid Stripe webhook signature",
        )

    # IMPORTANT:
    # Newer stripe-python versions return a Stripe Event object,
    # not a normal Python dict.
    event = event.to_dict()

    event_type = event.get("type")
    data_object = event.get("data", {}).get("object", {})

    # =========================================================
    # PAYMENT SUCCEEDED
    # =========================================================
    if event_type == "payment_intent.succeeded":

        payment_intent_id = data_object.get("id")

        if not payment_intent_id:
            return {"received": True}

        payment = (
            db.query(Payment)
            .filter(
                Payment.stripe_payment_id == payment_intent_id
            )
            .first()
        )

        # This can happen with `stripe trigger` because the CLI
        # creates a test PaymentIntent that does not belong to
        # a StayLeb booking.
        if not payment:
            return {"received": True}

        # Idempotency:
        # Stripe can send payment_intent.succeeded more than once.
        if payment.payment_status == "paid":
            return {"received": True}

        # Update payment
        payment.payment_status = "paid"
        payment.paid_at = datetime.now(timezone.utc)

        # Update associated booking
        booking = (
            db.query(Booking)
            .filter(Booking.id == payment.booking_id)
            .first()
        )

        if booking and booking.status == "pending":
            booking.status = "confirmed"
            booking.expires_at = None

        try:
            db.commit()
        except Exception:
            db.rollback()
            raise

        return {"received": True}

    # =========================================================
    # PAYMENT FAILED
    # =========================================================
    if event_type == "payment_intent.payment_failed":

        payment_intent_id = data_object.get("id")

        if not payment_intent_id:
            return {"received": True}

        payment = (
            db.query(Payment)
            .filter(
                Payment.stripe_payment_id == payment_intent_id
            )
            .first()
        )

        if not payment:
            return {"received": True}

        # Idempotency
        if payment.payment_status == "failed":
            return {"received": True}

        # Don't overwrite paid/refunded/etc. payments.
        if payment.payment_status == "pending":
            payment.payment_status = "failed"

            try:
                db.commit()
            except Exception:
                db.rollback()
                raise

        return {"received": True}

    # =========================================================
    # OTHER STRIPE EVENTS
    # =========================================================

    # We don't currently need other Stripe events.
    # Acknowledge them so Stripe does not retry unnecessarily.
    return {"received": True}

@router.get(
    "/bookings/{booking_id}",
    response_model=PaymentResponse,
    status_code=status.HTTP_200_OK,
)
def get_payment_by_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    # Find booking
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

    # --------------------------------------------------
    # Authorization
    # --------------------------------------------------

    # Client can access only their own booking
    if current_user.role == "client":
        if booking.client_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not allowed to view this payment",
            )

    # Owner can access only bookings for their properties
    elif current_user.role == "owner":
        property = (
            db.query(Property)
            .filter(Property.id == booking.property_id)
            .first()
        )

        if not property or property.owner_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not allowed to view this payment",
            )

    # Admin can access any payment
    elif current_user.role == "admin":
        pass

    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not allowed to view this payment",
        )

    # --------------------------------------------------
    # Payment
    # --------------------------------------------------

    payment = (
        db.query(Payment)
        .filter(Payment.booking_id == booking_id)
        .first()
    )

    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found for this booking",
        )

    return payment

@router.patch(
    "/bookings/{booking_id}/mark-paid",
    response_model=PaymentResponse,
)
def mark_cash_booking_payment_paid(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_owner),
):
    return mark_cash_payment_paid(
        db=db,
        booking_id=booking_id,
        current_user=current_user,
    )
from decimal import Decimal, ROUND_HALF_UP
from datetime import date, datetime, timedelta, timezone
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
import stripe
from sqlalchemy import or_

from app.models.booking import Booking
from app.models.property import Property
from app.models.property_blocked_date import PropertyBlockedDate
from app.models.platform_setting import PlatformSetting
from app.schemas.booking import BookingCreate
from app.services.pricing_service import calculate_stay_price
from app.models.payment import Payment,PaymentStatus,PaymentMethod
from datetime import date, datetime
from decimal import Decimal, ROUND_HALF_UP

def create_booking(
    db: Session,
    booking_data: BookingCreate,
    client_id: int,
):
    # ---------------------------------
    # 1. Find property
    # ---------------------------------

    property = (
        db.query(Property)
        .filter(Property.id == booking_data.property_id)
        .first()
    )

    if property is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Property not found",
        )

    # ---------------------------------
    # 2. Property must be approved
    # ---------------------------------

    if property.status != "approved":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This property is not available for booking",
        )

    # ---------------------------------
    # 3. Owner cannot book own property
    # ---------------------------------

    if property.owner_id == client_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot book your own property",
        )

    # ---------------------------------
    # 4. Validate dates
    # ---------------------------------

    if booking_data.check_out <= booking_data.check_in:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Check-out date must be after check-in date",
        )

    # Do not allow booking in the past
    if booking_data.check_in < date.today():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Check-in date cannot be in the past",
        )

    # Used for initial minimum-night validation.
    requested_nights = (
        booking_data.check_out - booking_data.check_in
    ).days

    # ---------------------------------
    # 5. Minimum nights
    # ---------------------------------

    if requested_nights < property.min_nights:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"This property requires at least "
                f"{property.min_nights} night(s)"
            ),
        )

    # ---------------------------------
    # 6. Guest capacity
    # ---------------------------------

    if booking_data.guests > property.max_guests:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"This property allows a maximum of "
                f"{property.max_guests} guests"
            ),
        )

    # ---------------------------------
    # 7. Check owner-blocked dates
    # ---------------------------------

    blocked_date = (
        db.query(PropertyBlockedDate)
        .filter(
            PropertyBlockedDate.property_id == property.id,
            PropertyBlockedDate.start_date < booking_data.check_out,
            PropertyBlockedDate.end_date > booking_data.check_in,
        )
        .first()
    )

    if blocked_date:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Property is unavailable for the selected dates",
        )

    # ---------------------------------
    # 8. Check existing bookings
    # ---------------------------------

    now = datetime.now()

    conflicting_booking = (
    db.query(Booking)
    .filter(
        Booking.property_id == property.id,

        or_(
            Booking.status == "confirmed",

            (
                (Booking.status == "pending")
                & (
                    (Booking.expires_at.is_(None))
                    | (Booking.expires_at > now)
                )
            ),
        ),

        Booking.check_in < booking_data.check_out,
        Booking.check_out > booking_data.check_in,
    )
    .first()
)

    if conflicting_booking:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Property is already booked for the selected dates",
        )

    # ---------------------------------
    # 9. Calculate stay pricing
    # ---------------------------------

    pricing = calculate_stay_price(
        db=db,
        property=property,
        check_in=booking_data.check_in,
        check_out=booking_data.check_out,
    )

    # Use pricing service as the final source
    # of truth for number of nights.
    number_of_nights = pricing["number_of_nights"]

    total_price = Decimal(
        pricing["total_price"]
    ).quantize(
        Decimal("0.01"),
        rounding=ROUND_HALF_UP,
    )

    average_price_per_night = Decimal(
        pricing["average_price_per_night"]
    ).quantize(
        Decimal("0.01"),
        rounding=ROUND_HALF_UP,
    )

    # ---------------------------------
    # 10. Get platform commission
    # ---------------------------------

    settings = (
        db.query(PlatformSetting)
        .order_by(PlatformSetting.id.asc())
        .first()
    )

    if settings is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Platform settings are not configured",
        )

    commission_percentage = Decimal(
        settings.commission_percentage
    ).quantize(
        Decimal("0.01"),
        rounding=ROUND_HALF_UP,
    )

    # ---------------------------------
    # 11. Calculate commission
    # ---------------------------------

    commission_amount = (
        total_price
        * commission_percentage
        / Decimal("100")
    ).quantize(
        Decimal("0.01"),
        rounding=ROUND_HALF_UP,
    )

    owner_earnings = (
        total_price - commission_amount
    ).quantize(
        Decimal("0.01"),
        rounding=ROUND_HALF_UP,
    )

    checkout_expires_at = (
    datetime.now()
    + timedelta(minutes=15)
)

    # ---------------------------------
    # 12. Create booking
    # ---------------------------------

    booking = Booking(
        client_id=client_id,
        property_id=property.id,

        check_in=booking_data.check_in,
        check_out=booking_data.check_out,
        guests=booking_data.guests,

        price_per_night=average_price_per_night,
        number_of_nights=number_of_nights,
        total_price=total_price,

        status="pending",
        expires_at=checkout_expires_at,

        commission_percentage=commission_percentage,
        commission_amount=commission_amount,
        owner_earnings=owner_earnings,
    )

    db.add(booking)
    db.commit()
    db.refresh(booking)

    return booking

def preview_booking(
    db: Session,
    booking_data: BookingCreate,
    client_id: int,
):
    """
    Price preview without persisting.

    Reuses the same validation and pricing logic as create_booking,
    but does NOT create a database row.
    """

    # ---------------------------------
    # 1. Find property
    # ---------------------------------

    property = (
        db.query(Property)
        .filter(
            Property.id == booking_data.property_id
        )
        .first()
    )

    if property is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Property not found",
        )

    # ---------------------------------
    # 2. Property must be approved
    # ---------------------------------

    if property.status != "approved":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This property is not available for booking",
        )

    # ---------------------------------
    # 3. Owner cannot book own property
    # ---------------------------------

    if property.owner_id == client_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot book your own property",
        )

    # ---------------------------------
    # 4. Validate dates
    # ---------------------------------

    if booking_data.check_out <= booking_data.check_in:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Check-out date must be after check-in date",
        )

    if booking_data.check_in < date.today():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Check-in date cannot be in the past",
        )

    requested_nights = (
        booking_data.check_out
        - booking_data.check_in
    ).days

    # ---------------------------------
    # 5. Minimum nights
    # ---------------------------------

    if requested_nights < property.min_nights:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"This property requires at least "
                f"{property.min_nights} night(s)"
            ),
        )

    # ---------------------------------
    # 6. Guest capacity
    # ---------------------------------

    if booking_data.guests > property.max_guests:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"This property allows a maximum of "
                f"{property.max_guests} guests"
            ),
        )

    # ---------------------------------
    # 7. Owner-blocked dates
    # ---------------------------------

    blocked_date = (
        db.query(PropertyBlockedDate)
        .filter(
            PropertyBlockedDate.property_id
            == property.id,

            PropertyBlockedDate.start_date
            < booking_data.check_out,

            PropertyBlockedDate.end_date
            > booking_data.check_in,
        )
        .first()
    )

    if blocked_date:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Property is unavailable for the selected dates",
        )

    # ---------------------------------
    # 8. Existing booking conflicts
    #
    # confirmed
    #   -> always blocks
    #
    # pending + expires_at IS NULL
    #   -> blocks
    #
    # pending + expires_at > now
    #   -> blocks
    #
    # pending + expires_at <= now
    #   -> does NOT block
    # ---------------------------------

    now = datetime.now()

    conflicting_booking = (
        db.query(Booking)
        .filter(
            Booking.property_id == property.id,

            or_(
                Booking.status == "confirmed",

                (
                    (Booking.status == "pending")
                    & (
                        Booking.expires_at.is_(None)
                        | (Booking.expires_at > now)
                    )
                ),
            ),

            Booking.check_in
            < booking_data.check_out,

            Booking.check_out
            > booking_data.check_in,
        )
        .first()
    )

    if conflicting_booking:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "Property is already booked "
                "for the selected dates"
            ),
        )

    # ---------------------------------
    # 9. Calculate stay pricing
    # ---------------------------------

    pricing = calculate_stay_price(
        db=db,
        property=property,
        check_in=booking_data.check_in,
        check_out=booking_data.check_out,
    )

    number_of_nights = pricing[
        "number_of_nights"
    ]

    total_price = Decimal(
        pricing["total_price"]
    ).quantize(
        Decimal("0.01"),
        rounding=ROUND_HALF_UP,
    )

    average_price_per_night = Decimal(
        pricing["average_price_per_night"]
    ).quantize(
        Decimal("0.01"),
        rounding=ROUND_HALF_UP,
    )

    # ---------------------------------
    # 10. Platform commission settings
    # ---------------------------------

    settings = (
        db.query(PlatformSetting)
        .order_by(
            PlatformSetting.id.asc()
        )
        .first()
    )

    if settings is None:
        raise HTTPException(
            status_code=(
                status.HTTP_500_INTERNAL_SERVER_ERROR
            ),
            detail=(
                "Platform settings are not configured"
            ),
        )

    commission_percentage = Decimal(
        settings.commission_percentage
    ).quantize(
        Decimal("0.01"),
        rounding=ROUND_HALF_UP,
    )

    # ---------------------------------
    # 11. Calculate commission
    # ---------------------------------

    commission_amount = (
        total_price
        * commission_percentage
        / Decimal("100")
    ).quantize(
        Decimal("0.01"),
        rounding=ROUND_HALF_UP,
    )

    owner_earnings = (
        total_price - commission_amount
    ).quantize(
        Decimal("0.01"),
        rounding=ROUND_HALF_UP,
    )

    # ---------------------------------
    # 12. Return preview
    # ---------------------------------

    return {
        "property_id": property.id,
        "check_in": booking_data.check_in,
        "check_out": booking_data.check_out,
        "guests": booking_data.guests,

        "price_per_night":
            average_price_per_night,

        "number_of_nights":
            number_of_nights,

        "total_price":
            total_price,

        "commission_percentage":
            commission_percentage,

        "commission_amount":
            commission_amount,

        "owner_earnings":
            owner_earnings,

        "nightly_breakdown":
            pricing.get(
                "nightly_breakdown",
                [],
            ),
    }

def get_owner_cash_requests(
    db: Session,
    owner_id: int,
):
    return (
        db.query(Booking)
        .join(Property, Booking.property_id == Property.id)
        .join(Payment, Payment.booking_id == Booking.id)
        .filter(
            Property.owner_id == owner_id,
            Booking.status == "pending",
            Payment.payment_method == "cash",
            Payment.payment_status == "pending",
        )
        .order_by(Booking.created_at.desc())
        .all()
    )

def approve_cash_booking(
    db: Session,
    booking_id: int,
    owner_id: int,
):
    booking = (
        db.query(Booking)
        .join(Property, Booking.property_id == Property.id)
        .filter(
            Booking.id == booking_id,
            Property.owner_id == owner_id,
        )
        .first()
    )

    if booking is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found",
        )

    if booking.status != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only pending bookings can be approved",
        )

    payment = (
        db.query(Payment)
        .filter(Payment.booking_id == booking.id)
        .first()
    )

    if payment is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Payment record not found",
        )

    if payment.payment_method != "cash":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only cash bookings can be approved by the owner",
        )

    booking.status = "confirmed"

    db.commit()
    db.refresh(booking)

    return booking


def reject_cash_booking(
    db: Session,
    booking_id: int,
    owner_id: int,
):
    booking = (
        db.query(Booking)
        .join(Property, Booking.property_id == Property.id)
        .filter(
            Booking.id == booking_id,
            Property.owner_id == owner_id,
        )
        .first()
    )

    if booking is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found",
        )

    if booking.status != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only pending bookings can be rejected",
        )

    payment = (
        db.query(Payment)
        .filter(Payment.booking_id == booking.id)
        .first()
    )

    if payment is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Payment record not found",
        )

    if payment.payment_method != "cash":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only cash bookings can be rejected by the owner",
        )

    booking.status = "rejected"
    payment.payment_status = "cancelled"

    db.commit()
    db.refresh(booking)

    return booking

def cancel_booking(
    db: Session,
    booking_id: int,
    client_id: int,
):
    booking = (
        db.query(Booking)
        .filter(
            Booking.id == booking_id,
            Booking.client_id == client_id,
        )
        .first()
    )

    if booking is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found",
        )

    # Only pending or confirmed bookings can be cancelled
    if booking.status not in ["pending", "confirmed"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This booking cannot be cancelled",
        )

    # Cannot cancel after check-in has started
    today = date.today()

    if booking.check_in <= today:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Booking cannot be cancelled on or after check-in date",
        )

    days_before_check_in = (booking.check_in - today).days

    # ----------------------------------
    # Cancellation policy
    # ----------------------------------

    if days_before_check_in >= 10:
        cancellation_percentage = Decimal("0.00")

    elif days_before_check_in >= 5:
        cancellation_percentage = Decimal("10.00")

    else:
        cancellation_percentage = Decimal("30.00")

    total_price = Decimal(booking.total_price)

    cancellation_fee = (
        total_price
        * cancellation_percentage
        / Decimal("100")
    ).quantize(
        Decimal("0.01"),
        rounding=ROUND_HALF_UP,
    )

    refund_amount = (
        total_price - cancellation_fee
    ).quantize(
        Decimal("0.01"),
        rounding=ROUND_HALF_UP,
    )

    # ----------------------------------
    # Cancellation financial split
    # ----------------------------------

    commission_percentage = Decimal(
      booking.commission_percentage
    )

    cancellation_commission_amount = (
      cancellation_fee * commission_percentage/ Decimal("100")
      ).quantize(
      Decimal("0.01"),
      rounding=ROUND_HALF_UP,
    )

    owner_cancellation_earnings = (
      cancellation_fee - cancellation_commission_amount
      ).quantize(
      Decimal("0.01"),
      rounding=ROUND_HALF_UP,
    )

    # ----------------------------------
    # Find payment
    # ----------------------------------

    payment = (
        db.query(Payment)
        .filter(Payment.booking_id == booking.id)
        .first()
    )

    if payment is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Payment record not found",
        )

    # ----------------------------------
    # CASH
    # ----------------------------------

    if payment.payment_method == "cash":

        # We currently do not electronically collect
        # cancellation fees for unpaid cash bookings.
        if payment.payment_status == "pending":

            booking.status = "cancelled"
            booking.cancelled_at = datetime.now()

            # Record which cancellation policy applied.
            booking.cancellation_percentage = cancellation_percentage
            booking.cancellation_fee = cancellation_fee

            # No money was actually paid, therefore no
            # money is actually refunded.
            booking.refund_amount = Decimal("0.00")
            booking.cancellation_commission_amount = Decimal("0.00")
            booking.owner_cancellation_earnings = Decimal("0.00")

            PaymentStatus.CANCELLED.value

            db.commit()
            db.refresh(booking)

            return booking

        # We'll handle already-paid cash separately if needed.
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Paid cash booking cancellation is not supported yet",
        )

    # ----------------------------------
    # STRIPE
    # ----------------------------------

    if payment.payment_method == PaymentMethod.STRIPE.value: 

    # ----------------------------------
    # CASE 1: Stripe payment was successful
    # ----------------------------------

     if payment.payment_status == PaymentStatus.PAID.value:

        if not payment.stripe_payment_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Stripe PaymentIntent ID not found",
            )

        # Convert dollars -> cents
        refund_amount_cents = int(
            (refund_amount * Decimal("100"))
            .quantize(Decimal("1"), rounding=ROUND_HALF_UP)
        )

        try:
            # Full or partial Stripe refund
            stripe_refund = stripe.Refund.create(
                payment_intent=payment.stripe_payment_id,
                amount=refund_amount_cents,
                metadata={
                    "booking_id": str(booking.id),
                    "payment_id": str(payment.id),
                },
            )

        except stripe.StripeError:
            db.rollback()

            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Stripe refund failed. Booking was not cancelled.",
            )

        # Stripe refund succeeded.
        # NOW update our database.

        booking.status = "cancelled"
        booking.cancelled_at = datetime.now()

        booking.cancellation_percentage = cancellation_percentage
        booking.cancellation_fee = cancellation_fee
        booking.refund_amount = refund_amount

        booking.cancellation_commission_amount = (
          cancellation_commission_amount
        )

        booking.owner_cancellation_earnings = (
          owner_cancellation_earnings
        )

        payment.stripe_refund_id = stripe_refund.id
        payment.refunded_amount = refund_amount

        # 100% refund
        if refund_amount == total_price:
            payment.payment_status = PaymentStatus.REFUNDED.value

        # Partial refund
        else:
            payment.payment_status = (
                PaymentStatus.PARTIALLY_REFUNDED.value
            )

        try:
            db.commit()
            db.refresh(booking)

        except Exception:
            db.rollback()

            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=(
                    "Stripe refund succeeded, but the local database "
                    "could not be updated"
                ),
            )

        return booking

    # ----------------------------------
    # CASE 2: Stripe payment not completed
    # ----------------------------------

    if payment.payment_status in [
        PaymentStatus.PENDING.value,
        PaymentStatus.FAILED.value,
    ]:

        # If a PaymentIntent exists, try to cancel it.
        if payment.stripe_payment_id:
            try:
                stripe.PaymentIntent.cancel(
                    payment.stripe_payment_id
                )

            except stripe.StripeError:
                db.rollback()

                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail=(
                        "Stripe PaymentIntent could not be cancelled. "
                        "Booking was not cancelled."
                    ),
                )

        booking.status = "cancelled"
        booking.cancelled_at = datetime.now()

        booking.cancellation_percentage = cancellation_percentage
        booking.cancellation_fee = cancellation_fee

        # Client never paid, so nothing is refunded.
        booking.refund_amount = Decimal("0.00")
        booking.cancellation_commission_amount = Decimal("0.00")
        booking.owner_cancellation_earnings = Decimal("0.00")

        payment.payment_status = PaymentStatus.CANCELLED.value
        payment.refunded_amount = Decimal("0.00")

        db.commit()
        db.refresh(booking)

        return booking

    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="This Stripe payment cannot be cancelled",
    )

    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Unsupported payment method",
    )

def get_booking_by_id(
    db: Session,
    booking_id: int,
    current_user,
):
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

    # CLIENT
    if current_user.role == "client":
        if booking.client_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not allowed to view this booking",
            )

    # OWNER
    elif current_user.role == "owner":
        property = (
            db.query(Property)
            .filter(Property.id == booking.property_id)
            .first()
        )

        if not property or property.owner_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not allowed to view this booking",
            )

    # ADMIN
    elif current_user.role == "admin":
        pass

    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not allowed to view this booking",
        )

    return booking

def complete_expired_bookings(db: Session):
    today = date.today()

    bookings = (
        db.query(Booking)
        .join(Payment, Payment.booking_id == Booking.id)
        .filter(
            Booking.status == "confirmed",
            Booking.check_out <= today,
            Payment.payment_status == PaymentStatus.PAID.value,
        )
        .all()
    )

    if not bookings:
        return 0

    for booking in bookings:
        booking.status = "completed"

    db.commit()

    return len(bookings)
from decimal import Decimal, ROUND_HALF_UP

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.booking import Booking
from app.models.property import Property
from app.models.property_blocked_date import PropertyBlockedDate
from app.models.platform_setting import PlatformSetting
from app.schemas.booking import BookingCreate
from app.services.pricing_service import calculate_stay_price


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

    number_of_nights = (
        booking_data.check_out - booking_data.check_in
    ).days

    # ---------------------------------
    # 5. Minimum nights
    # ---------------------------------

    if number_of_nights < property.min_nights:
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
    # 8. Check existing bookings
    # ---------------------------------

    conflicting_booking = (
        db.query(Booking)
        .filter(
            Booking.property_id == property.id,

            # Rejected and cancelled bookings
            # should not block availability.
            Booking.status.in_(
                ["pending", "confirmed"]
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

        commission_percentage=commission_percentage,
        commission_amount=commission_amount,
        owner_earnings=owner_earnings,
    )

    db.add(booking)
    db.commit()
    db.refresh(booking)

    return booking
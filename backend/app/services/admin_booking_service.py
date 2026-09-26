from datetime import date
from typing import Optional, Literal
from decimal import Decimal
from sqlalchemy import or_
from sqlalchemy.orm import Session, joinedload

from app.models.booking import Booking
from app.models.payment import Payment, PaymentMethod, PaymentStatus
from app.models.property import Property
from app.models.user import User


def get_admin_bookings(
    db: Session,
    booking_status: Optional[str] = None,
    payment_method: Optional[str] = None,
    payment_status: Optional[str] = None,
    search: Optional[str] = None,
    from_date: Optional[date] = None,
    to_date: Optional[date] = None,
    page: int = 1,
    page_size: int = 20,
):
    # -----------------------------------------
    # Base query
    # -----------------------------------------

    query = (
        db.query(Booking)
        .options(
            joinedload(Booking.client),
            joinedload(Booking.property),
            joinedload(Booking.payment),
        )
    )

    # -----------------------------------------
    # Booking status
    # -----------------------------------------

    if booking_status:
        query = query.filter(
            Booking.status == booking_status
        )

    # -----------------------------------------
    # Payment filters
    # -----------------------------------------

    if payment_method or payment_status:
        query = query.outerjoin(
            Payment,
            Payment.booking_id == Booking.id,
        )

        if payment_method:
            query = query.filter(
                Payment.payment_method == payment_method
            )

        if payment_status:
            query = query.filter(
                Payment.payment_status == payment_status
            )

    # -----------------------------------------
    # Date range
    # -----------------------------------------

    if from_date:
        query = query.filter(
            Booking.check_in >= from_date
        )

    if to_date:
        query = query.filter(
            Booking.check_in <= to_date
        )

    # -----------------------------------------
    # Search
    # -----------------------------------------

    if search:
        search_value = search.strip()

        query = (
            query
            .join(
                User,
                User.id == Booking.client_id,
            )
            .join(
                Property,
                Property.id == Booking.property_id,
            )
        )

        search_conditions = [
            User.full_name.ilike(f"%{search_value}%"),
            User.email.ilike(f"%{search_value}%"),
            Property.title.ilike(f"%{search_value}%"),
            Property.location.ilike(f"%{search_value}%"),
        ]

        # Allow searching by booking ID
        if search_value.isdigit():
            search_conditions.append(
                Booking.id == int(search_value)
            )

        query = query.filter(
            or_(*search_conditions)
        )

    # -----------------------------------------
    # Pagination validation
    # -----------------------------------------

    page = max(page, 1)
    page_size = max(1, min(page_size, 100))

    # Count BEFORE applying offset/limit
    total = query.count()

    total_pages = (
        (total + page_size - 1) // page_size
        if total > 0
        else 0
    )

    offset = (page - 1) * page_size

    # -----------------------------------------
    # Retrieve page
    # -----------------------------------------

    bookings = (
        query
        .order_by(Booking.created_at.desc())
        .offset(offset)
        .limit(page_size)
        .all()
    )

    return {
        "items": bookings,
        "page": page,
        "page_size": page_size,
        "total": total,
        "total_pages": total_pages,
    }

from datetime import date
from typing import Optional, Literal
from decimal import Decimal
from sqlalchemy import or_
from sqlalchemy.orm import Session, joinedload

from app.models.booking import Booking
from app.models.payment import Payment, PaymentMethod, PaymentStatus
from app.models.property import Property
from app.models.user import User


def get_admin_booking_stats(
    db: Session,
    from_date: Optional[date] = None,
    to_date: Optional[date] = None,
    property_id: Optional[int] = None,
    group_by: Optional[Literal["day", "month"]] = None,
    owner_id: Optional[int] = None,
):
    zero = Decimal("0.00")

    # -------------------------------------------------
    # Get bookings + payments + commission settlements
    # -------------------------------------------------

    query = (
        db.query(Booking)
        .options(
            joinedload(Booking.payment),
            joinedload(Booking.commission_settlement),
        )
    )

    # Same date-range meaning as the Admin booking list:
    # filter using booking check-in date.
    if from_date:
        query = query.filter(
            Booking.check_in >= from_date
        )

    if to_date:
        query = query.filter(
            Booking.check_in <= to_date
        )

    # Optional property filter
    if property_id is not None:
        query = query.filter(
            Booking.property_id == property_id
        )

    # Optional owner filter — restrict to bookings of properties owned by owner_id
    # Used by Owner Dashboard to reuse the same financial logic.
    if owner_id is not None:
        query = query.join(Property, Property.id == Booking.property_id).filter(
            Property.owner_id == owner_id
        )

    bookings = query.all()

    # -------------------------------------------------
    # Counters / totals
    # -------------------------------------------------

    total_bookings = len(bookings)

    gross_booking_volume = zero
    platform_commission = zero
    owner_earnings = zero

    stripe_gross = zero
    cash_gross = zero

    pending_cash_commission = zero
    pending_cash_bookings = 0

    booking_statuses = {
        "pending": 0,
        "confirmed": 0,
        "cancelled": 0,
        "rejected": 0,
        "completed": 0,
    }

    # -------------------------------------------------
    # Breakdown
    # -------------------------------------------------

    breakdown_data = {}

    def get_period(booking):
        if group_by == "day":
            return booking.check_in.strftime("%Y-%m-%d")

        if group_by == "month":
            return booking.check_in.strftime("%Y-%m")

        return None

    def get_breakdown_item(period):
        if period not in breakdown_data:
            breakdown_data[period] = {
                "period": period,
                "total_bookings": 0,
                "gross_booking_volume": zero,
                "platform_commission": zero,
                "owner_earnings": zero,
            }

        return breakdown_data[period]

    # -------------------------------------------------
    # Process bookings
    # -------------------------------------------------

    for booking in bookings:

        # ---------------------------------------------
        # Booking status counts
        # ---------------------------------------------

        if booking.status in booking_statuses:
            booking_statuses[booking.status] += 1

        period = get_period(booking)

        breakdown_item = (
            get_breakdown_item(period)
            if period is not None
            else None
        )

        # Every booking counts in the period, even if
        # it did not result in collected revenue.
        if breakdown_item is not None:
            breakdown_item["total_bookings"] += 1

        payment = booking.payment

        # Booking may not have a payment yet.
        if payment is None:
            continue

        amount = Decimal(
            payment.amount or zero
        )

        # =================================================
        # PENDING CASH PAYMENT
        # =================================================

        if (
            payment.payment_method == PaymentMethod.CASH.value
            and payment.payment_status == PaymentStatus.PENDING.value
            and booking.status == "confirmed"
        ):
            continue

        # =================================================
        # SUCCESSFULLY PAID BOOKING
        # =================================================

        if payment.payment_status == PaymentStatus.PAID.value:

            gross_booking_volume += amount

            if breakdown_item is not None:
                breakdown_item["gross_booking_volume"] += amount

            # ---------------------------------------------
            # STRIPE PAYMENT
            # ---------------------------------------------

            if (
                payment.payment_method
                == PaymentMethod.STRIPE.value
            ):
                stripe_gross += amount

                commission = Decimal(
                    booking.commission_amount or zero
                )

                earnings = Decimal(
                    booking.owner_earnings or zero
                )

                platform_commission += commission
                owner_earnings += earnings

                if breakdown_item is not None:
                    breakdown_item["platform_commission"] += commission
                    breakdown_item["owner_earnings"] += earnings

            # ---------------------------------------------
            # CASH PAYMENT
            # ---------------------------------------------

            elif (
                payment.payment_method
                == PaymentMethod.CASH.value
            ):
                cash_gross += amount

                earnings = Decimal(
                    booking.owner_earnings or zero
                )

                owner_earnings += earnings

                if breakdown_item is not None:
                    breakdown_item["owner_earnings"] += earnings

                settlement = booking.commission_settlement

                if settlement:

                    if settlement.status == "unpaid":

                        pending_cash_bookings += 1

                        pending_cash_commission += Decimal(
                            settlement.commission_amount
                            or zero
                        )

                    elif settlement.status == "paid":

                        commission = Decimal(
                            settlement.commission_amount
                            or zero
                        )

                        platform_commission += commission

                        if breakdown_item is not None:
                            breakdown_item["platform_commission"] += commission

            continue

        # =================================================
        # PARTIALLY REFUNDED
        # =================================================

        if (
            payment.payment_status
            == PaymentStatus.PARTIALLY_REFUNDED.value
        ):
            gross_booking_volume += amount

            if breakdown_item is not None:
                breakdown_item["gross_booking_volume"] += amount

            if (
                payment.payment_method
                == PaymentMethod.STRIPE.value
            ):
                stripe_gross += amount

                commission = Decimal(
                    booking.cancellation_commission_amount
                    or zero
                )

                earnings = Decimal(
                    booking.owner_cancellation_earnings
                    or zero
                )

                platform_commission += commission
                owner_earnings += earnings

                if breakdown_item is not None:
                    breakdown_item["platform_commission"] += commission
                    breakdown_item["owner_earnings"] += earnings

            elif (
                payment.payment_method
                == PaymentMethod.CASH.value
            ):
                cash_gross += amount

                # Paid cash cancellation is currently not
                # part of the supported StayLeb flow.

            continue

        # =================================================
        # FULLY REFUNDED
        # =================================================

        if (
            payment.payment_status
            == PaymentStatus.REFUNDED.value
        ):
            gross_booking_volume += amount

            if breakdown_item is not None:
                breakdown_item["gross_booking_volume"] += amount

            if (
                payment.payment_method
                == PaymentMethod.STRIPE.value
            ):
                stripe_gross += amount

            elif (
                payment.payment_method
                == PaymentMethod.CASH.value
            ):
                cash_gross += amount

            # No retained commission or owner earnings.
            continue

        # =================================================
        # FAILED / CANCELLED / OTHER PENDING
        # =================================================
        #
        # These contribute nothing to collected financial
        # totals.
        # =================================================

    # -------------------------------------------------
    # Convert breakdown dictionary to sorted list
    # -------------------------------------------------

    breakdown = []

    if group_by is not None:
        breakdown = [
            breakdown_data[key]
            for key in sorted(breakdown_data.keys())
        ]

    # -------------------------------------------------
    # Return
    # -------------------------------------------------

    return {
        "total_bookings": total_bookings,

        "gross_booking_volume": gross_booking_volume,

        "platform_commission": platform_commission,
        "owner_earnings": owner_earnings,

        "stripe_gross": stripe_gross,
        "cash_gross": cash_gross,

        "pending_cash_commission": pending_cash_commission,
        "pending_cash_bookings": pending_cash_bookings,

        "booking_statuses": booking_statuses,

        "breakdown": breakdown,
    }
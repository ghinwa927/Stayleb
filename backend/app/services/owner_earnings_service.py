from datetime import date
from typing import Optional, Literal
from decimal import Decimal

from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.orm import joinedload

from app.models.property import Property
from app.models.booking import Booking
from app.models.payment import PaymentMethod, PaymentStatus
from app.services.admin_booking_service import get_admin_booking_stats


def get_owner_earnings(
    db: Session,
    owner_id: int,
    from_date: Optional[date] = None,
    to_date: Optional[date] = None,
    property_id: Optional[int] = None,
    group_by: Optional[Literal["day", "month"]] = None,
):
    # -------------------------------------------------
    # Validate property ownership
    # -------------------------------------------------

    if property_id is not None:
        property_record = (
            db.query(Property)
            .filter(
                Property.id == property_id,
                Property.owner_id == owner_id,
            )
            .first()
        )

        if property_record is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Property not found",
            )

    # -------------------------------------------------
    # Reuse StayLeb financial calculations
    # -------------------------------------------------

    stats = get_admin_booking_stats(
        db=db,
        from_date=from_date,
        to_date=to_date,
        property_id=property_id,
        group_by=group_by,
        owner_id=owner_id,
    )

    # -------------------------------------------------
    # Owner-facing response
    # -------------------------------------------------

    return {
        "total_bookings": stats["total_bookings"],

        "gross_revenue": stats["gross_booking_volume"],
        "platform_commission": stats["platform_commission"],
        "owner_earnings": stats["owner_earnings"],

        "stripe_revenue": stats["stripe_gross"],
        "cash_revenue": stats["cash_gross"],

        "outstanding_cash_commission": (
            stats["pending_cash_commission"]
        ),

        "pending_cash_commission_bookings": (
            stats["pending_cash_bookings"]
        ),

        "booking_statuses": stats["booking_statuses"],

        "breakdown": stats["breakdown"],
    }

def get_owner_earnings_ledger(
    db: Session,
    owner_id: int,
    from_date: Optional[date] = None,
    to_date: Optional[date] = None,
    property_id: Optional[int] = None,
    page: int = 1,
    page_size: int = 20,
):
    zero = Decimal("0.00")

    # -------------------------------------------------
    # Validate property ownership
    # -------------------------------------------------

    if property_id is not None:
        property_record = (
            db.query(Property)
            .filter(
                Property.id == property_id,
                Property.owner_id == owner_id,
            )
            .first()
        )

        if property_record is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Property not found",
            )

    # -------------------------------------------------
    # Base query
    # -------------------------------------------------

    query = (
        db.query(Booking)
        .options(
            joinedload(Booking.property),
            joinedload(Booking.payment),
            joinedload(Booking.commission_settlement),
        )
        .join(
            Property,
            Property.id == Booking.property_id,
        )
        .filter(
            Property.owner_id == owner_id
        )
    )

    # -------------------------------------------------
    # Filters
    # -------------------------------------------------

    if from_date is not None:
        query = query.filter(
            Booking.check_in >= from_date
        )

    if to_date is not None:
        query = query.filter(
            Booking.check_in <= to_date
        )

    if property_id is not None:
        query = query.filter(
            Booking.property_id == property_id
        )

    # -------------------------------------------------
    # Pagination
    # -------------------------------------------------

    page = max(page, 1)
    page_size = max(
        1,
        min(page_size, 100),
    )

    total = query.count()

    total_pages = (
        (total + page_size - 1) // page_size
        if total > 0
        else 0
    )

    offset = (page - 1) * page_size

    bookings = (
        query
        .order_by(Booking.created_at.desc())
        .offset(offset)
        .limit(page_size)
        .all()
    )

    # -------------------------------------------------
    # Build ledger
    # -------------------------------------------------

    items = []

    for booking in bookings:
        payment = booking.payment

        payment_method = None
        payment_status = None

        gross = zero
        commission = zero
        earnings = zero

        if payment is not None:
            payment_method = payment.payment_method
            payment_status = payment.payment_status

            amount = Decimal(
                payment.amount or zero
            )

            # =============================================
            # SUCCESSFULLY PAID
            # =============================================

            if (
                payment.payment_status
                == PaymentStatus.PAID.value
            ):
                gross = amount

                if (
                    payment.payment_method
                    == PaymentMethod.STRIPE.value
                ):
                    commission = Decimal(
                        booking.commission_amount or zero
                    )

                    earnings = Decimal(
                        booking.owner_earnings or zero
                    )

                elif (
                    payment.payment_method
                    == PaymentMethod.CASH.value
                ):
                    earnings = Decimal(
                        booking.owner_earnings or zero
                    )

                    settlement = (
                        booking.commission_settlement
                    )

                    # For cash bookings, StayLeb commission
                    # becomes settled platform commission only
                    # after Admin marks the settlement paid.
                    if (
                        settlement is not None
                        and settlement.status == "paid"
                    ):
                        commission = Decimal(
                            settlement.commission_amount
                            or zero
                        )

            # =============================================
            # PARTIALLY REFUNDED
            # =============================================

            elif (
                payment.payment_status
                == PaymentStatus.PARTIALLY_REFUNDED.value
            ):
                gross = amount

                if (
                    payment.payment_method
                    == PaymentMethod.STRIPE.value
                ):
                    commission = Decimal(
                        booking.cancellation_commission_amount
                        or zero
                    )

                    earnings = Decimal(
                        booking.owner_cancellation_earnings
                        or zero
                    )

                # Paid cash cancellation is currently not
                # part of the supported StayLeb flow.

            # =============================================
            # FULLY REFUNDED
            # =============================================

            elif (
                payment.payment_status
                == PaymentStatus.REFUNDED.value
            ):
                gross = amount

                # Full refund:
                # commission = 0
                # owner earnings = 0

            # Pending / failed / cancelled payment statuses
            # remain zero in the financial ledger.

        # -------------------------------------------------
        # Nights
        # -------------------------------------------------

        number_of_nights = (
            booking.check_out - booking.check_in
        ).days

        # -------------------------------------------------
        # Ledger item
        # -------------------------------------------------

        items.append({
            "booking_id": booking.id,

            "property_id": booking.property_id,
            "property_title": booking.property.title,

            "check_in": booking.check_in,
            "check_out": booking.check_out,
            "number_of_nights": number_of_nights,

            "booking_status": booking.status,

            "payment_method": payment_method,
            "payment_status": payment_status,

            "gross_booking_volume": gross,
            "platform_commission": commission,
            "owner_earnings": earnings,
        })

    return {
        "items": items,
        "page": page,
        "page_size": page_size,
        "total": total,
        "total_pages": total_pages,
    }
from decimal import Decimal

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.property import Property
from app.models.booking import Booking
from app.models.review import Review
from app.models.commission_settlement import CommissionSettlement

from app.services.admin_booking_service import get_admin_booking_stats


def get_admin_dashboard_stats(db: Session):
    # =====================================================
    # USERS
    # =====================================================

    total_users = (
        db.query(func.count(User.id))
        .scalar()
        or 0
    )

    total_owners = (
        db.query(func.count(User.id))
        .filter(User.role == "owner")
        .scalar()
        or 0
    )

    total_clients = (
        db.query(func.count(User.id))
        .filter(User.role == "client")
        .scalar()
        or 0
    )

    active_users = (
        db.query(func.count(User.id))
        .filter(User.is_active.is_(True))
        .scalar()
        or 0
    )

    inactive_users = (
        db.query(func.count(User.id))
        .filter(User.is_active.is_(False))
        .scalar()
        or 0
    )

    # =====================================================
    # PROPERTIES
    # =====================================================

    total_properties = (
        db.query(func.count(Property.id))
        .scalar()
        or 0
    )

    pending_properties = (
        db.query(func.count(Property.id))
        .filter(Property.status == "pending")
        .scalar()
        or 0
    )

    approved_properties = (
        db.query(func.count(Property.id))
        .filter(Property.status == "approved")
        .scalar()
        or 0
    )

    rejected_properties = (
        db.query(func.count(Property.id))
        .filter(Property.status == "rejected")
        .scalar()
        or 0
    )

    # =====================================================
    # BOOKINGS
    # =====================================================

    total_bookings = (
        db.query(func.count(Booking.id))
        .scalar()
        or 0
    )

    pending_bookings = (
        db.query(func.count(Booking.id))
        .filter(Booking.status == "pending")
        .scalar()
        or 0
    )

    confirmed_bookings = (
        db.query(func.count(Booking.id))
        .filter(Booking.status == "confirmed")
        .scalar()
        or 0
    )

    cancelled_bookings = (
        db.query(func.count(Booking.id))
        .filter(Booking.status == "cancelled")
        .scalar()
        or 0
    )

    completed_bookings = (
        db.query(func.count(Booking.id))
        .filter(Booking.status == "completed")
        .scalar()
        or 0
    )

    # =====================================================
    # FINANCIALS
    # =====================================================

    # Reuse the financial rules already implemented for
    # GET /admin/bookings/stats.
    booking_stats = get_admin_booking_stats(
        db=db,
    )

    total_revenue = booking_stats[
        "gross_booking_volume"
    ]

    platform_commission = booking_stats[
        "platform_commission"
    ]

    owner_earnings = booking_stats[
        "owner_earnings"
    ]

    # Cash commission already collected by an owner but
    # not yet reconciled/paid to StayLeb.
    outstanding_cash_commission = (
        db.query(
            func.coalesce(
                func.sum(
                    CommissionSettlement.commission_amount
                ),
                0,
            )
        )
        .filter(
            CommissionSettlement.status == "unpaid"
        )
        .scalar()
        or Decimal("0.00")
    )

    # =====================================================
    # REVIEWS
    # =====================================================

    total_reviews = (
      db.query(func.count(Review.id))
      .filter(
        Review.moderation_status != "removed",
    )
    .scalar()
    or 0
)

    average_rating = (
      db.query(
        func.avg(Review.overall_rating)
      )
      .filter(
        Review.moderation_status != "removed",
      )
    .scalar()
)

    if average_rating is None:
        average_rating = Decimal("0.00")
    else:
        average_rating = Decimal(
            str(average_rating)
        ).quantize(
            Decimal("0.01")
        )

    # =====================================================
    # RESPONSE
    # =====================================================

    return {
        "users": {
            "total": total_users,
            "owners": total_owners,
            "clients": total_clients,
            "active": active_users,
            "inactive": inactive_users,
        },

        "properties": {
            "total": total_properties,
            "pending": pending_properties,
            "approved": approved_properties,
            "rejected": rejected_properties,
        },

        "bookings": {
            "total": total_bookings,
            "pending": pending_bookings,
            "confirmed": confirmed_bookings,
            "cancelled": cancelled_bookings,
            "completed": completed_bookings,
        },

        "financials": {
            "total_revenue": total_revenue,
            "platform_commission": platform_commission,
            "owner_earnings": owner_earnings,
            "outstanding_cash_commission": (
                outstanding_cash_commission
            ),
        },

        "reviews": {
            "total": total_reviews,
            "average_rating": average_rating,
        },
    }
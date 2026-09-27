from datetime import date
from decimal import Decimal

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.property import Property
from app.models.booking import Booking
from app.models.commission_settlement import CommissionSettlement
from app.models.user import User
from app.services.booking_service import complete_expired_bookings, get_owner_cash_requests
from app.services.admin_booking_service import get_admin_booking_stats
from app.services.review_service import get_owner_review_stats


def get_owner_dashboard_stats(db: Session, current_user: User):
    # Ensure completed statuses are current (same as booking routes)
    complete_expired_bookings(db)

    owner_id = current_user.id
    zero = Decimal("0.00")

    # ----------------------------------
    # PROPERTY COUNTS
    # ----------------------------------
    total_properties = (
        db.query(func.count(Property.id))
        .filter(Property.owner_id == owner_id)
        .scalar()
        or 0
    )

    approved_properties = (
        db.query(func.count(Property.id))
        .filter(Property.owner_id == owner_id, Property.status == "approved")
        .scalar()
        or 0
    )

    pending_properties = (
        db.query(func.count(Property.id))
        .filter(Property.owner_id == owner_id, Property.status == "pending")
        .scalar()
        or 0
    )

    rejected_properties = (
        db.query(func.count(Property.id))
        .filter(Property.owner_id == owner_id, Property.status == "rejected")
        .scalar()
        or 0
    )

    # ----------------------------------
    # TOTAL BOOKINGS
    # ----------------------------------
    total_bookings = (
        db.query(func.count(Booking.id))
        .join(Property, Property.id == Booking.property_id)
        .filter(Property.owner_id == owner_id)
        .scalar()
        or 0
    )

    # ----------------------------------
    # PENDING CASH REQUESTS — reuse existing inbox logic
    # Booking.status == pending + Payment cash pending + owner
    # ----------------------------------
    try:
        pending_cash_requests_list = get_owner_cash_requests(db=db, owner_id=owner_id)
        pending_cash_requests = len(pending_cash_requests_list)
    except Exception:
        pending_cash_requests = 0

    # ----------------------------------
    # UPCOMING BOOKINGS
    # ----------------------------------
    upcoming_bookings = (
        db.query(func.count(Booking.id))
        .join(Property, Property.id == Booking.property_id)
        .filter(
            Property.owner_id == owner_id,
            Booking.status == "confirmed",
            Booking.check_in > date.today(),
        )
        .scalar()
        or 0
    )

    # ----------------------------------
    # FINANCIAL STATS — reuse admin financial logic with owner_id filter
    # ----------------------------------
    booking_stats = get_admin_booking_stats(db=db, owner_id=owner_id)

    total_revenue = booking_stats["gross_booking_volume"]
    platform_commission = booking_stats["platform_commission"]
    owner_earnings = booking_stats["owner_earnings"]

    # ----------------------------------
    # OUTSTANDING CASH COMMISSION — CommissionSettlement source of truth
    # owner_id == current owner AND status == unpaid SUM commission_amount
    # ----------------------------------
    outstanding_cash_commission = (
        db.query(func.coalesce(func.sum(CommissionSettlement.commission_amount), 0))
        .filter(
            CommissionSettlement.owner_id == owner_id,
            CommissionSettlement.status == "unpaid",
        )
        .scalar()
        or zero
    )
    # Ensure Decimal with 2 decimals
    if not isinstance(outstanding_cash_commission, Decimal):
        outstanding_cash_commission = Decimal(str(outstanding_cash_commission))
    outstanding_cash_commission = outstanding_cash_commission.quantize(Decimal("0.00"))

    # ----------------------------------
    # PORTFOLIO RATING
    # ----------------------------------
    review_stats = get_owner_review_stats(db=db, current_user=current_user)
    portfolio_rating = review_stats.get("overall_rating", zero)
    total_reviews = review_stats.get("total_reviews", 0)

    if portfolio_rating is None:
        portfolio_rating = zero
    if not isinstance(portfolio_rating, Decimal):
        portfolio_rating = Decimal(str(portfolio_rating))
    portfolio_rating = portfolio_rating.quantize(Decimal("0.00"))

    return {
        "total_properties": total_properties,
        "approved_properties": approved_properties,
        "pending_properties": pending_properties,
        "rejected_properties": rejected_properties,
        "total_bookings": total_bookings,
        "pending_cash_requests": pending_cash_requests,
        "upcoming_bookings": upcoming_bookings,
        "total_revenue": total_revenue,
        "platform_commission": platform_commission,
        "owner_earnings": owner_earnings,
        "outstanding_cash_commission": outstanding_cash_commission,
        "portfolio_rating": portfolio_rating,
        "total_reviews": total_reviews,
    }

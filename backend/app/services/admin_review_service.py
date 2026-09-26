from decimal import Decimal
from typing import Optional

from datetime import datetime, timezone,date
from fastapi import HTTPException, status
from sqlalchemy import or_
from sqlalchemy.orm import Session, joinedload

from app.models.review import Review
from app.models.booking import Booking
from app.models.property import Property
from app.models.user import User


# =========================================================
# GET ADMIN REVIEWS
# =========================================================

def get_admin_reviews(
    db: Session,
    search: Optional[str] = None,
    rating: Optional[int] = None,
    moderation_status: str | None = None,
    property_id: int | None = None,
    from_date: date | None = None,
    to_date: date | None = None,
    page: int = 1,
    page_size: int = 20,
):
    query = (
    db.query(Review)
    .join(
        Booking,
        Booking.id == Review.booking_id,
    )
    .join(
        User,
        User.id == Booking.client_id,
    )
    .join(
        Property,
        Property.id == Booking.property_id,
    )
    .options(
        joinedload(Review.booking)
        .joinedload(Booking.client),

        joinedload(Review.booking)
        .joinedload(Booking.property),
    )
)

    # -------------------------------------------------
    # Rating filter
    # -------------------------------------------------

    if rating is not None:
        query = query.filter(
            Review.overall_rating == rating
        )

    # -------------------------------------------------
    # Moderation status filter
    # -------------------------------------------------

    if moderation_status is not None:
        query = query.filter(
            Review.moderation_status == moderation_status
        )

    # -------------------------------------------------
    # Property filter
    # -------------------------------------------------

    if property_id is not None:
      query = query.filter(
        Booking.property_id == property_id
    )

    # -------------------------------------------------
    # Review date filters
    # -------------------------------------------------

    if from_date is not None:
      query = query.filter(
          Review.created_at >= datetime.combine(
              from_date,
              datetime.min.time(),
          )
      )

    if to_date is not None:
      query = query.filter(
          Review.created_at <= datetime.combine(
              to_date,
               datetime.max.time(),
          )
      )    

    # -------------------------------------------------
    # Search
    # -------------------------------------------------

    if search:
        search_value = search.strip()

        if search_value:

            conditions = [
                User.full_name.ilike(
                    f"%{search_value}%"
                ),
                User.email.ilike(
                    f"%{search_value}%"
                ),
                Property.title.ilike(
                    f"%{search_value}%"
                ),
                Property.location.ilike(
                    f"%{search_value}%"
                ),
            ]

            # Allow searching by review ID or booking ID
            if search_value.isdigit():
                numeric_value = int(search_value)

                conditions.extend([
                    Review.id == numeric_value,
                    Review.booking_id == numeric_value,
                ])

            query = query.filter(
                or_(*conditions)
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

    reviews = (
        query
        .order_by(
            Review.created_at.desc()
        )
        .offset(offset)
        .limit(page_size)
        .all()
    )

    # -------------------------------------------------
    # Build response
    # -------------------------------------------------

    items = []

    for review in reviews:
        booking = review.booking

        items.append({
            "id": review.id,
            "booking_id": review.booking_id,

            "overall_rating": review.overall_rating,
            "cleanliness_rating": review.cleanliness_rating,
            "privacy_rating": review.privacy_rating,
            "wifi_rating": review.wifi_rating,
            "hot_water_rating": review.hot_water_rating,
            "location_rating": review.location_rating,
            "value_rating": review.value_rating,

            "comment": review.comment,

            "moderation_status": review.moderation_status,
            "report_reason": review.report_reason,
            "reported_at": review.reported_at,
            "moderated_at": review.moderated_at,

            "created_at": review.created_at,

            "client": {
                "id": booking.client.id,
                "full_name": booking.client.full_name,
                "email": booking.client.email,
            },

            "property": {
                "id": booking.property.id,
                "title": booking.property.title,
                "location": booking.property.location,
            },
        })

    return {
        "items": items,
        "page": page,
        "page_size": page_size,
        "total": total,
        "total_pages": total_pages,
    }


# =========================================================
# GET ADMIN REVIEW STATS
# =========================================================

def get_admin_review_stats(
    db: Session,
):
    reviews = (
      db.query(Review)
      .filter(
        Review.moderation_status != "removed",
      )
      .all()
)

    total_reviews = len(reviews)

    zero = Decimal("0.00")

    if total_reviews == 0:
        return {
            "total_reviews": 0,
            "overall_rating": zero,
            "cleanliness_rating": zero,
            "privacy_rating": zero,
            "wifi_rating": zero,
            "hot_water_rating": zero,
            "location_rating": zero,
            "value_rating": zero,
        }

    # -------------------------------------------------
    # Calculate averages
    # -------------------------------------------------

    def average(field_name: str):
        total = sum(
            getattr(review, field_name)
            for review in reviews
        )

        return (
            Decimal(total)
            / Decimal(total_reviews)
        ).quantize(
            Decimal("0.01")
        )

    return {
        "total_reviews": total_reviews,

        "overall_rating": average(
            "overall_rating"
        ),

        "cleanliness_rating": average(
            "cleanliness_rating"
        ),

        "privacy_rating": average(
            "privacy_rating"
        ),

        "wifi_rating": average(
            "wifi_rating"
        ),

        "hot_water_rating": average(
            "hot_water_rating"
        ),

        "location_rating": average(
            "location_rating"
        ),

        "value_rating": average(
            "value_rating"
        ),
    }

def restore_admin_review(
    db: Session,
    review_id: int,
):
    review = (
        db.query(Review)
        .filter(
            Review.id == review_id
        )
        .first()
    )

    if review is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Review not found",
        )

    if review.moderation_status != "flagged":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only flagged reviews can be restored",
        )

    review.moderation_status = "visible"

    # The report has been resolved and rejected by Admin.
    review.report_reason = None
    review.reported_at = None

    review.moderated_at = datetime.now(
        timezone.utc
    ).replace(tzinfo=None)

    db.commit()
    db.refresh(review)

    return build_admin_review_response(review)

def remove_admin_review(
    db: Session,
    review_id: int,
):
    review = (
        db.query(Review)
        .filter(Review.id == review_id)
        .first()
    )

    if review is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Review not found",
        )

    if review.moderation_status != "flagged":
       raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Only flagged reviews can be removed",
    )

    review.moderation_status = "removed"
    review.moderated_at = datetime.now(
        timezone.utc
        ).replace(tzinfo=None)

    db.commit()
    db.refresh(review)

    return build_admin_review_response(review)

def build_admin_review_response(review: Review):
    booking = review.booking

    return {
        "id": review.id,
        "booking_id": review.booking_id,

        "overall_rating": review.overall_rating,
        "cleanliness_rating": review.cleanliness_rating,
        "privacy_rating": review.privacy_rating,
        "wifi_rating": review.wifi_rating,
        "hot_water_rating": review.hot_water_rating,
        "location_rating": review.location_rating,
        "value_rating": review.value_rating,

        "comment": review.comment,

        "moderation_status": review.moderation_status,
        "report_reason": review.report_reason,
        "reported_at": review.reported_at,
        "moderated_at": review.moderated_at,

        "created_at": review.created_at,

        "client": {
            "id": booking.client.id,
            "full_name": booking.client.full_name,
            "email": booking.client.email,
        },

        "property": {
            "id": booking.property.id,
            "title": booking.property.title,
            "location": booking.property.location,
        },
    }
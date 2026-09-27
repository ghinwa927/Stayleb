from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.booking import Booking
from app.models.review import Review
from app.models.user import User
from app.schemas.review import ReviewCreate
from decimal import Decimal
from app.models.property import Property
from datetime import datetime, timezone

# =========================================================
# CREATE REVIEW
# =========================================================

def create_review(
    db: Session,
    review_data: ReviewCreate,
    current_user: User,
):
    # -------------------------------------------------
    # 1. Find booking
    # -------------------------------------------------

    booking = (
        db.query(Booking)
        .filter(
            Booking.id == review_data.booking_id
        )
        .first()
    )

    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found",
        )

    # -------------------------------------------------
    # 2. Booking must belong to logged-in client
    # -------------------------------------------------

    if booking.client_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only review your own bookings",
        )

    # -------------------------------------------------
    # 3. Booking must be completed
    # -------------------------------------------------

    if booking.status != "completed":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only completed bookings can be reviewed",
        )

    # -------------------------------------------------
    # 4. One review per booking
    # -------------------------------------------------

    existing_review = (
        db.query(Review)
        .filter(
            Review.booking_id == booking.id
        )
        .first()
    )

    if existing_review:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This booking has already been reviewed",
        )

    # -------------------------------------------------
    # 5. Create review
    # -------------------------------------------------

    review = Review(
        booking_id=booking.id,

        overall_rating=review_data.overall_rating,
        cleanliness_rating=review_data.cleanliness_rating,
        privacy_rating=review_data.privacy_rating,
        wifi_rating=review_data.wifi_rating,
        hot_water_rating=review_data.hot_water_rating,
        location_rating=review_data.location_rating,
        value_rating=review_data.value_rating,

        comment=review_data.comment,
    )

    db.add(review)
    db.commit()
    db.refresh(review)

    return review

# =========================================================
# GET REVIEW BY BOOKING
# =========================================================

def get_review_by_booking(
    db: Session,
    booking_id: int,
):
    return (
        db.query(Review)
        .filter(
            Review.booking_id == booking_id
        )
        .first()
    )


# =========================================================
# GET PROPERTY REVIEWS
# =========================================================

def get_property_reviews(
    db: Session,
    property_id: int,
):
    reviews = (
        db.query(Review)
        .join(
            Booking,
            Booking.id == Review.booking_id,
        )
        .filter(
            Booking.property_id == property_id,
            Review.moderation_status != "removed",
        )
        .order_by(
            Review.created_at.desc()
        )
        .all()
    )

    return reviews

# =========================================================
# GET PROPERTY REVIEW STATS
# =========================================================

def get_property_review_stats(
    db: Session,
    property_id: int,
):
    reviews = get_property_reviews(
        db=db,
        property_id=property_id,
        
    )

    total_reviews = len(reviews)

    if total_reviews == 0:
        return {
            "total_reviews": 0,
            "overall_rating": Decimal("0.00"),
            "cleanliness_rating": Decimal("0.00"),
            "privacy_rating": Decimal("0.00"),
            "wifi_rating": Decimal("0.00"),
            "hot_water_rating": Decimal("0.00"),
            "location_rating": Decimal("0.00"),
            "value_rating": Decimal("0.00"),
        }

    def average(field_name: str):
        total = sum(
            getattr(review, field_name)
            for review in reviews
        )

        return (
            Decimal(total) / Decimal(total_reviews)
        ).quantize(Decimal("0.01"))

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

# =========================================================
# GET OWNER REVIEWS
# =========================================================

def get_owner_reviews(
    db: Session,
    current_user: User,
    property_id: int | None = None,
    search: str | None = None,
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
            Property,
            Property.id == Booking.property_id,
        )
        .filter(
            Property.owner_id == current_user.id,
            Review.moderation_status != "removed",
        )
    )

    # -------------------------------------------------
    # Optional property filter
    # -------------------------------------------------

    if property_id is not None:
        query = query.filter(
            Property.id == property_id
        )

    # -------------------------------------------------
    # Optional search
    # -------------------------------------------------

    if search:
        search_value = search.strip()

        query = query.filter(
            Property.title.ilike(
                f"%{search_value}%"
            )
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
            "created_at": review.created_at,

            "property": {
                "id": review.booking.property.id,
                "title": review.booking.property.title,
                "location": review.booking.property.location,
            },
        })

    return {
        "items": items,
        "page": page,
        "page_size": page_size,
        "total": total,
        "total_pages": total_pages,
    }


def report_review_by_owner(
    db: Session,
    review_id: int,
    reason: str,
    current_user: User,
):
    # -------------------------------------------------
    # 1. Find review and related booking/property
    # -------------------------------------------------

    review = (
        db.query(Review)
        .join(
            Booking,
            Booking.id == Review.booking_id,
        )
        .join(
            Property,
            Property.id == Booking.property_id,
        )
        .filter(
            Review.id == review_id,
        )
        .first()
    )

    if review is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Review not found",
        )

    # -------------------------------------------------
    # 2. Verify property belongs to this owner
    # -------------------------------------------------

    if review.booking.property.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only report reviews for your own properties",
        )

    # -------------------------------------------------
    # 3. Removed reviews cannot be reported
    # -------------------------------------------------

    if review.moderation_status == "removed":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Removed review cannot be reported",
        )

    # -------------------------------------------------
    # 4. Prevent duplicate report
    # -------------------------------------------------

    if review.moderation_status == "flagged":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Review is already reported",
        )

    # -------------------------------------------------
    # 5. Flag for Admin moderation
    # -------------------------------------------------

    clean_reason = reason.strip()

    if len(clean_reason) < 5:
      raise HTTPException(
         status_code=status.HTTP_400_BAD_REQUEST,
         detail="Report reason must contain at least 5 characters",
    )

    review.moderation_status = "flagged"
    review.report_reason = clean_reason
    review.reported_at = datetime.now(
        timezone.utc
    ).replace(tzinfo=None)

    review.moderated_at = None

    db.commit()
    db.refresh(review)

    return review


# =========================================================
# GET OWNER REVIEW STATS
# =========================================================

def get_owner_review_stats(
    db: Session,
    current_user: User,
    property_id: int | None = None,
):
    query = (
        db.query(Review)
        .join(
            Booking,
            Booking.id == Review.booking_id,
        )
        .join(
            Property,
            Property.id == Booking.property_id,
        )
        .filter(
            Property.owner_id == current_user.id,
            Review.moderation_status != "removed",
        )
    )

    # -------------------------------------------------
    # Optional property filter
    # -------------------------------------------------

    if property_id is not None:
        query = query.filter(
            Property.id == property_id
        )

    reviews = query.all()

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
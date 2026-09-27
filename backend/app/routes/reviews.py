from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.dependencies import require_client, require_owner

from app.models.user import User

from app.schemas.review import (
    ReviewCreate,
    ReviewResponse,
    PropertyReviewStatsResponse,
    OwnerReviewListResponse,
    OwnerReviewStatsResponse,
    ReviewReportRequest,
    OwnerReviewReportResponse,
)

from app.services.review_service import (
    create_review,
    get_review_by_booking,
    get_property_reviews,
    get_property_review_stats,
    get_owner_reviews,
    get_owner_review_stats,
    report_review_by_owner
)


router = APIRouter(
    prefix="/reviews",
    tags=["Reviews"],
)


# =========================================================
# CREATE REVIEW
# =========================================================

@router.post(
    "",
    response_model=ReviewResponse,
    status_code=status.HTTP_201_CREATED,
)
def submit_review(
    review_data: ReviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_client),
):
    return create_review(
        db=db,
        review_data=review_data,
        current_user=current_user,
    )


# =========================================================
# GET OWNER REVIEWS
# =========================================================

@router.get(
    "/owner",
    response_model=OwnerReviewListResponse,
)
def owner_reviews(
    property_id: int | None = None,
    search: str | None = None,
    page: int = 1,
    page_size: int = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_owner),
):
    return get_owner_reviews(
        db=db,
        current_user=current_user,
        property_id=property_id,
        search=search,
        page=page,
        page_size=page_size,
    )


# =========================================================
# GET OWNER REVIEW STATS
# =========================================================

@router.get(
    "/owner/stats",
    response_model=OwnerReviewStatsResponse,
)
def owner_review_stats(
    property_id: int | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_owner),
):
    return get_owner_review_stats(
        db=db,
        current_user=current_user,
        property_id=property_id,
    )

# =========================================================
# GET REVIEW BY BOOKING
# Client only
# =========================================================

@router.get(
    "/booking/{booking_id}",
    response_model=ReviewResponse,
)
def review_by_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_client),
):
    review = get_review_by_booking(
        db=db,
        booking_id=booking_id,
    )

    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Review not found",
        )

    # Prevent one client from reading another client's
    # booking review through this client-specific endpoint.
    if review.booking.client_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only access reviews for your own bookings",
        )

    return review


# =========================================================
# GET PROPERTY REVIEWS
# Public endpoint
# =========================================================

@router.get(
    "/property/{property_id}",
    response_model=list[ReviewResponse],
)
def property_reviews(
    property_id: int,
    db: Session = Depends(get_db),
):
    return get_property_reviews(
        db=db,
        property_id=property_id,
    )


# =========================================================
# GET PROPERTY REVIEW STATISTICS
# Public endpoint
# =========================================================

@router.get(
    "/property/{property_id}/stats",
    response_model=PropertyReviewStatsResponse,
)
def property_review_stats(
    property_id: int,
    db: Session = Depends(get_db),
):
    return get_property_review_stats(
        db=db,
        property_id=property_id,
    )

@router.patch(
    "/owner/{review_id}/report",
    response_model=OwnerReviewReportResponse,
)
def report_owner_review(
    review_id: int,
    payload: ReviewReportRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_owner),
):
    return report_review_by_owner(
        db=db,
        review_id=review_id,
        reason=payload.reason,
        current_user=current_user,
    )
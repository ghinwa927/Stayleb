from typing import Optional
from datetime import date
from fastapi import (
    APIRouter,
    Depends,
    Query,
    HTTPException,
)
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.dependencies import require_admin
from app.models.user import User

from app.schemas.admin_review import (
    AdminReviewListResponse,
    AdminReviewStatsResponse,
    AdminReviewResponse,
    
)

from app.services.admin_review_service import (
    get_admin_reviews,
    get_admin_review_stats,
    restore_admin_review,
    remove_admin_review,
)


router = APIRouter(
    prefix="/admin/reviews",
    tags=["Admin Reviews"],
)


# =========================================================
# REVIEW STATISTICS
# =========================================================

@router.get(
    "/stats",
    response_model=AdminReviewStatsResponse,
)
def admin_review_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    return get_admin_review_stats(
        db=db,
    )


# =========================================================
# REVIEW LIST
# =========================================================

@router.get("", response_model=AdminReviewListResponse)
def list_admin_reviews(
    search: Optional[str] = Query(default=None),
    rating: Optional[int] = Query(
        default=None,
        ge=1,
        le=5,
    ),
    moderation_status: Optional[str] = Query(
        default=None,
        pattern="^(visible|flagged|removed)$",
    ),
    property_id: Optional[int] = Query(
        default=None,
        ge=1,
    ),
    from_date: Optional[date] = Query(
        default=None,
    ),
    to_date: Optional[date] = Query(
        default=None,
    ),
    page: int = Query(
        default=1,
        ge=1,
    ),
    page_size: int = Query(
        default=20,
        ge=1,
        le=100,
    ),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    # -------------------------------------------------
    # Validate date range
    # -------------------------------------------------

    if (
        from_date is not None
        and to_date is not None
        and from_date > to_date
    ):
        raise HTTPException(
            status_code=400,
            detail="from_date cannot be after to_date",
        )

    # -------------------------------------------------
    # Get reviews
    # -------------------------------------------------

    return get_admin_reviews(
        db=db,
        search=search,
        rating=rating,
        moderation_status=moderation_status,
        property_id=property_id,
        from_date=from_date,
        to_date=to_date,
        page=page,
        page_size=page_size,
    )


# =========================================================
# FLAG REVIEW
# =========================================================

@router.patch(
    "/{review_id}/restore",
    response_model=AdminReviewResponse,
)
def restore_review(
    review_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    return restore_admin_review(
        db=db,
        review_id=review_id,
    )


# =========================================================
# REMOVE REVIEW
# =========================================================

@router.delete(
    "/{review_id}",
    response_model=AdminReviewResponse,
)
def delete_review(
    review_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    return remove_admin_review(
        db=db,
        review_id=review_id,
    )
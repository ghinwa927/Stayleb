from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


# =========================================================
# CREATE REVIEW
# =========================================================

class ReviewCreate(BaseModel):
    booking_id: int = Field(gt=0)

    overall_rating: int = Field(ge=1, le=5)
    cleanliness_rating: int = Field(ge=1, le=5)
    privacy_rating: int = Field(ge=1, le=5)
    wifi_rating: int = Field(ge=1, le=5)
    hot_water_rating: int = Field(ge=1, le=5)
    location_rating: int = Field(ge=1, le=5)
    value_rating: int = Field(ge=1, le=5)

    comment: str | None = Field(
        default=None,
        max_length=2000,
    )


# =========================================================
# REVIEW RESPONSE
# =========================================================

class ReviewResponse(BaseModel):
    id: int
    booking_id: int

    overall_rating: int
    cleanliness_rating: int
    privacy_rating: int
    wifi_rating: int
    hot_water_rating: int
    location_rating: int
    value_rating: int

    comment: str | None

    created_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )


# =========================================================
# PROPERTY REVIEW STATISTICS
# =========================================================

class PropertyReviewStatsResponse(BaseModel):
    total_reviews: int

    overall_rating: Decimal
    cleanliness_rating: Decimal
    privacy_rating: Decimal
    wifi_rating: Decimal
    hot_water_rating: Decimal
    location_rating: Decimal
    value_rating: Decimal

# =========================================================
# OWNER REVIEW PROPERTY
# =========================================================

class OwnerReviewPropertyResponse(BaseModel):
    id: int
    title: str
    location: str

    model_config = ConfigDict(
        from_attributes=True
    )


# =========================================================
# OWNER REVIEW
# =========================================================

class OwnerReviewResponse(BaseModel):
    id: int
    booking_id: int

    overall_rating: int
    cleanliness_rating: int
    privacy_rating: int
    wifi_rating: int
    hot_water_rating: int
    location_rating: int
    value_rating: int

    comment: str | None

    created_at: datetime

    property: OwnerReviewPropertyResponse


# =========================================================
# OWNER REVIEW LIST
# =========================================================

class OwnerReviewListResponse(BaseModel):
    items: list[OwnerReviewResponse]

    page: int
    page_size: int
    total: int
    total_pages: int


# =========================================================
# OWNER REVIEW STATISTICS
# =========================================================

class OwnerReviewStatsResponse(BaseModel):
    total_reviews: int

    overall_rating: Decimal
    cleanliness_rating: Decimal
    privacy_rating: Decimal
    wifi_rating: Decimal
    hot_water_rating: Decimal
    location_rating: Decimal
    value_rating: Decimal

class ReviewReportRequest(BaseModel):
    reason: str = Field(
        ...,
        min_length=5,
        max_length=500,
    )

class OwnerReviewReportResponse(BaseModel):
    id: int
    booking_id: int
    moderation_status: str
    report_reason: str | None
    reported_at: datetime | None

    model_config = {
        "from_attributes": True
    }
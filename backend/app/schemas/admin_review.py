from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel,ConfigDict


class AdminReviewClientResponse(BaseModel):
    id: int
    full_name: str
    email: str


class AdminReviewPropertyResponse(BaseModel):
    id: int
    title: str
    location: str


class AdminReviewResponse(BaseModel):
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

    moderation_status: str
    report_reason: str | None
    reported_at: datetime | None
    moderated_at: datetime | None

    created_at: datetime

    client: AdminReviewClientResponse
    property: AdminReviewPropertyResponse

    model_config = ConfigDict(from_attributes=True)


class AdminReviewListResponse(BaseModel):
    items: list[AdminReviewResponse]

    page: int
    page_size: int
    total: int
    total_pages: int


class AdminReviewStatsResponse(BaseModel):
    total_reviews: int

    overall_rating: Decimal
    cleanliness_rating: Decimal
    privacy_rating: Decimal
    wifi_rating: Decimal
    hot_water_rating: Decimal
    location_rating: Decimal
    value_rating: Decimal
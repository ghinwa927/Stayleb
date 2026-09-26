from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class BookingCreate(BaseModel):
    property_id: int
    check_in: date
    check_out: date
    guests: int = Field(ge=1)


class BookingResponse(BaseModel):
    id: int
    client_id: int
    property_id: int

    check_in: date
    check_out: date
    guests: int

    price_per_night: Decimal
    number_of_nights: int
    total_price: Decimal

    status: str
    expires_at: datetime | None = None

    commission_percentage: Decimal
    commission_amount: Decimal
    owner_earnings: Decimal

    cancelled_at: datetime | None = None
    cancellation_percentage: Decimal | None = None
    cancellation_fee: Decimal | None = None
    refund_amount: Decimal | None = None
    cancellation_commission_amount: Decimal = Decimal("0.00")
    owner_cancellation_earnings: Decimal = Decimal("0.00")

    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class NightlyBreakdown(BaseModel):
    date: date
    price: Decimal
    pricing_source: str
    season_name: str | None = None


class BookingPreviewResponse(BaseModel):
    property_id: int
    check_in: date
    check_out: date
    guests: int

    price_per_night: Decimal
    number_of_nights: int
    total_price: Decimal

    commission_percentage: Decimal
    commission_amount: Decimal
    owner_earnings: Decimal

    nightly_breakdown: list[NightlyBreakdown]
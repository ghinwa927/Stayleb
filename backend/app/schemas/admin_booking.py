from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


# -----------------------------------------
# Nested client information
# -----------------------------------------

class AdminBookingClientResponse(BaseModel):
    id: int
    full_name: str
    email: str
    phone: str | None = None

    model_config = ConfigDict(from_attributes=True)


# -----------------------------------------
# Nested property information
# -----------------------------------------

class AdminBookingPropertyResponse(BaseModel):
    id: int
    title: str
    location: str

    model_config = ConfigDict(from_attributes=True)


# -----------------------------------------
# Nested payment information
# -----------------------------------------

class AdminBookingPaymentResponse(BaseModel):
    id: int
    amount: Decimal

    payment_method: str
    payment_status: str

    stripe_payment_id: str | None = None
    stripe_refund_id: str | None = None

    refunded_amount: Decimal

    paid_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)


# -----------------------------------------
# One booking row
# -----------------------------------------

class AdminBookingListItem(BaseModel):
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

    # Original booking financial snapshot
    commission_percentage: Decimal
    commission_amount: Decimal
    owner_earnings: Decimal

    # Cancellation information
    cancelled_at: datetime | None = None
    cancellation_percentage: Decimal | None = None
    cancellation_fee: Decimal | None = None
    refund_amount: Decimal | None = None

    cancellation_commission_amount: Decimal
    owner_cancellation_earnings: Decimal

    created_at: datetime
    updated_at: datetime

    # Relationships
    client: AdminBookingClientResponse
    property: AdminBookingPropertyResponse
    payment: AdminBookingPaymentResponse | None = None

    model_config = ConfigDict(from_attributes=True)


# -----------------------------------------
# Paginated admin booking response
# -----------------------------------------

class AdminBookingListResponse(BaseModel):
    items: list[AdminBookingListItem]

    page: int
    page_size: int
    total: int
    total_pages: int

class AdminBookingStatusStats(BaseModel):
    pending: int = 0
    confirmed: int = 0
    cancelled: int = 0
    rejected: int = 0
    completed: int = 0


class AdminBookingStatsBreakdownItem(BaseModel):
    period: str
    total_bookings: int
    gross_booking_volume: Decimal
    platform_commission: Decimal
    owner_earnings: Decimal


class AdminBookingStatsResponse(BaseModel):
    total_bookings: int
    gross_booking_volume: Decimal
    platform_commission: Decimal
    owner_earnings: Decimal

    stripe_gross: Decimal
    cash_gross: Decimal

    pending_cash_commission: Decimal
    pending_cash_bookings: int

    booking_statuses: AdminBookingStatusStats

    breakdown: list[AdminBookingStatsBreakdownItem] = Field(
        default_factory=list
    )
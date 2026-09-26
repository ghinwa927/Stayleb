from decimal import Decimal
from typing import List

from pydantic import BaseModel


# =========================================================
# BOOKING STATUS COUNTS
# =========================================================

class OwnerEarningsBookingStatuses(BaseModel):
    pending: int
    confirmed: int
    cancelled: int
    rejected: int
    completed: int


# =========================================================
# EARNINGS BREAKDOWN
# =========================================================

class OwnerEarningsBreakdownItem(BaseModel):
    period: str
    total_bookings: int

    gross_booking_volume: Decimal
    platform_commission: Decimal
    owner_earnings: Decimal


# =========================================================
# OWNER EARNINGS RESPONSE
# =========================================================

class OwnerEarningsResponse(BaseModel):
    total_bookings: int

    gross_revenue: Decimal
    platform_commission: Decimal
    owner_earnings: Decimal

    stripe_revenue: Decimal
    cash_revenue: Decimal

    outstanding_cash_commission: Decimal
    pending_cash_commission_bookings: int

    booking_statuses: OwnerEarningsBookingStatuses

    breakdown: List[OwnerEarningsBreakdownItem]

from datetime import date
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel


# =========================================================
# OWNER EARNINGS LEDGER ITEM
# =========================================================

class OwnerEarningsLedgerItem(BaseModel):
    booking_id: int

    property_id: int
    property_title: str

    check_in: date
    check_out: date
    number_of_nights: int

    booking_status: str

    payment_method: Optional[str] = None
    payment_status: Optional[str] = None

    gross_booking_volume: Decimal
    platform_commission: Decimal
    owner_earnings: Decimal


# =========================================================
# OWNER EARNINGS LEDGER RESPONSE
# =========================================================

class OwnerEarningsLedgerResponse(BaseModel):
    items: list[OwnerEarningsLedgerItem]

    page: int
    page_size: int
    total: int
    total_pages: int
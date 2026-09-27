from decimal import Decimal
from pydantic import BaseModel


class OwnerDashboardStatsResponse(BaseModel):
    total_properties: int
    approved_properties: int
    pending_properties: int
    rejected_properties: int

    total_bookings: int
    pending_cash_requests: int
    upcoming_bookings: int

    total_revenue: Decimal
    platform_commission: Decimal
    owner_earnings: Decimal
    outstanding_cash_commission: Decimal

    portfolio_rating: Decimal
    total_reviews: int

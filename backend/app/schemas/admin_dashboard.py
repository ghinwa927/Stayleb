from decimal import Decimal

from pydantic import BaseModel


class AdminDashboardUserStats(BaseModel):
    total: int
    owners: int
    clients: int
    active: int
    inactive: int


class AdminDashboardPropertyStats(BaseModel):
    total: int
    pending: int
    approved: int
    rejected: int


class AdminDashboardBookingStats(BaseModel):
    total: int
    pending: int
    confirmed: int
    cancelled: int
    completed: int


class AdminDashboardFinancialStats(BaseModel):
    total_revenue: Decimal
    platform_commission: Decimal
    owner_earnings: Decimal
    outstanding_cash_commission: Decimal


class AdminDashboardReviewStats(BaseModel):
    total: int
    average_rating: Decimal


class AdminDashboardStatsResponse(BaseModel):
    users: AdminDashboardUserStats
    properties: AdminDashboardPropertyStats
    bookings: AdminDashboardBookingStats
    financials: AdminDashboardFinancialStats
    reviews: AdminDashboardReviewStats
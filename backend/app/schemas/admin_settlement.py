from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict


# -----------------------------------------
# Property information
# -----------------------------------------

class AdminSettlementPropertyResponse(BaseModel):
    id: int
    title: str
    location: str

    model_config = ConfigDict(from_attributes=True)


# -----------------------------------------
# Owner information
# -----------------------------------------

class AdminSettlementOwnerResponse(BaseModel):
    id: int
    full_name: str
    email: str
    phone: str | None = None

    model_config = ConfigDict(from_attributes=True)


# -----------------------------------------
# One settlement
# -----------------------------------------

class AdminSettlementResponse(BaseModel):
    id: int

    booking_id: int
    owner_id: int

    commission_amount: Decimal

    status: str
    paid_at: datetime | None = None

    created_at: datetime
    updated_at: datetime

    owner: AdminSettlementOwnerResponse
    property: AdminSettlementPropertyResponse


# -----------------------------------------
# Paginated settlement list
# -----------------------------------------

class AdminSettlementListResponse(BaseModel):
    items: list[AdminSettlementResponse]

    page: int
    page_size: int
    total: int
    total_pages: int


# -----------------------------------------
# Settlement statistics
# -----------------------------------------

class AdminSettlementStatsResponse(BaseModel):
    total_settlements: int

    unpaid_count: int
    paid_count: int

    outstanding_commission: Decimal
    settled_commission: Decimal
from datetime import datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel


# =========================================================
# OWNER INFO
# =========================================================

class OwnerSettlementOwnerResponse(BaseModel):
    id: int
    full_name: str
    email: str

    model_config = {
        "from_attributes": True
    }


# =========================================================
# PROPERTY INFO
# =========================================================

class OwnerSettlementPropertyResponse(BaseModel):
    id: int
    title: str
    location: str

    model_config = {
        "from_attributes": True
    }


# =========================================================
# SETTLEMENT ITEM
# =========================================================

class OwnerSettlementResponse(BaseModel):
    id: int
    booking_id: int
    owner_id: int

    commission_amount: Decimal
    status: str

    paid_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    owner: OwnerSettlementOwnerResponse
    property: OwnerSettlementPropertyResponse


# =========================================================
# SETTLEMENT LIST
# =========================================================

class OwnerSettlementListResponse(BaseModel):
    items: list[OwnerSettlementResponse]

    page: int
    page_size: int
    total: int
    total_pages: int


# =========================================================
# SETTLEMENT STATS
# =========================================================

class OwnerSettlementStatsResponse(BaseModel):
    total_settlements: int

    unpaid_count: int
    paid_count: int

    outstanding_commission: Decimal
    settled_commission: Decimal
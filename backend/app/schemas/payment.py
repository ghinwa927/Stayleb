from datetime import datetime
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, ConfigDict


class PaymentCreate(BaseModel):
    payment_method: Literal["cash", "stripe"]


class PaymentResponse(BaseModel):
    id: int
    booking_id: int
    amount: Decimal

    payment_method: str
    payment_status: str

    stripe_payment_id: str | None = None
    paid_at: datetime | None = None

    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
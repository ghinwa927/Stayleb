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

    commission_percentage: Decimal
    commission_amount: Decimal
    owner_earnings: Decimal

    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
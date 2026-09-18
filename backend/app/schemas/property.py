from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, Literal
from decimal import Decimal
from datetime import datetime

from app.schemas.property_seasonal_price import (
    SeasonalPriceCreate,
    SeasonalPriceResponse,
)

from app.schemas.property_seasonal_price import (
    SeasonalPriceCreate,
    SeasonalPriceResponse,
)
from app.schemas.property_image import (
    PropertyImageCreate,
    PropertyImageResponse,
)
from app.schemas.property_rule import (
    PropertyRuleCreate,
    PropertyRuleResponse,
)

from app.schemas.amenity import AmenityResponse

class PropertyCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=255)
    description: str = Field(..., min_length=10)

    property_type: Literal["chalet", "furnished_house"]

    location: str = Field(..., min_length=2, max_length=150)
    address: Optional[str] = Field(None, max_length=255)

    price_per_night: Decimal = Field(
        ...,
        gt=0,
        max_digits=10,
        decimal_places=2
    )

    bedrooms: int = Field(..., ge=0)
    beds: int = Field(..., ge=1)
    bathrooms: int = Field(..., ge=1)
    max_guests: int = Field(..., ge=1)
    min_nights: int = Field(default=1, ge=1)

    images: list[PropertyImageCreate] = Field(
        default_factory=list
    )

    amenity_ids: list[int] = Field(
        default_factory=list
    )

    rules: list[PropertyRuleCreate] = Field(
        default_factory=list
    )

    seasonal_prices: list[SeasonalPriceCreate] = Field(
        default_factory=list
    )

class PropertyUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=3, max_length=255)
    description: Optional[str] = Field(None, min_length=10)

    property_type: Optional[
        Literal["chalet", "furnished_house"]
    ] = None

    location: Optional[str] = Field(
        None,
        min_length=2,
        max_length=150
    )

    address: Optional[str] = Field(
        None,
        max_length=255
    )

    price_per_night: Optional[Decimal] = Field(
        None,
        gt=0,
        max_digits=10,
        decimal_places=2
    )

    bedrooms: Optional[int] = Field(None, ge=0)
    beds: Optional[int] = Field(None, ge=1)
    bathrooms: Optional[int] = Field(None, ge=1)
    max_guests: Optional[int] = Field(None, ge=1)
    min_nights: Optional[int] = Field(None, ge=1)

    images: list[PropertyImageCreate] | None = None

    amenity_ids: list[int] | None = None

    rules: list[PropertyRuleCreate] | None = None

    seasonal_prices: list[SeasonalPriceCreate] | None = None
class PropertyResponse(BaseModel):
    id: int
    owner_id: int

    title: str
    description: str
    property_type: str

    location: str
    address: Optional[str]

    price_per_night: Decimal

    bedrooms: int
    beds: int
    bathrooms: int
    max_guests: int
    min_nights: int

    status: str
    rejection_reason: Optional[str]

    images: list[PropertyImageResponse] = Field(
        default_factory=list
    )

    amenities: list[AmenityResponse] = Field(
        default_factory=list
    )

    property_rules: list[PropertyRuleResponse] = Field(
        default_factory=list
    )

    seasonal_prices: list[SeasonalPriceResponse] = Field(
        default_factory=list
    )

    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
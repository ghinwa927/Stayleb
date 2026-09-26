from typing import Literal
from decimal import Decimal
from pydantic import BaseModel, Field
from app.schemas.property import PropertySearchItem


class AIPropertyRule(BaseModel):
    name: str = Field(
        min_length=1,
        max_length=150,
    )

    allowed: bool

    value: str | None = Field(
        default=None,
        max_length=100,
    )


class PropertyDescriptionGenerateRequest(BaseModel):
    title: str = Field(
        min_length=2,
        max_length=255,
    )

    property_type: Literal[
        "chalet",
        "furnished_house",
    ]

    location: str = Field(
        min_length=2,
        max_length=150,
    )

    bedrooms: int = Field(
        ge=0,
        le=50,
    )

    beds: int = Field(
        ge=0,
        le=100,
    )

    bathrooms: int = Field(
        ge=0,
        le=50,
    )

    max_guests: int = Field(
        ge=1,
        le=100,
    )

    amenities: list[str] = Field(
        default_factory=list,
        max_length=100,
    )

    rules: list[AIPropertyRule] = Field(
        default_factory=list,
        max_length=100,
    )


class PropertyDescriptionGenerateResponse(BaseModel):
    description: str

# =========================================================
# AI PROPERTY SEARCH REQUEST
# =========================================================

class AIPropertySearchRequest(BaseModel):
    query: str = Field(
        min_length=2,
        max_length=500,
    )


# =========================================================
# AI EXTRACTED SEARCH FILTERS
# =========================================================

class AIPropertySearchFilters(BaseModel):
    location: str | None = None

    guests: int | None = Field(
        default=None,
        ge=1,
    )

    min_price: Decimal | None = Field(
        default=None,
        ge=0,
    )

    max_price: Decimal | None = Field(
        default=None,
        ge=0,
    )

    property_type: Literal[
        "chalet",
        "furnished_house",
    ] | None = None

    bedrooms: int | None = Field(
        default=None,
        ge=0,
    )

    bathrooms: int | None = Field(
        default=None,
        ge=0,
    )

    beds: int | None = Field(
        default=None,
        ge=0,
    )

    amenities: list[str] = Field(
        default_factory=list,
    )

class AIPropertySearchResponse(BaseModel):
    items: list[PropertySearchItem]
    total: int
    page: int
    page_size: int
    total_pages: int
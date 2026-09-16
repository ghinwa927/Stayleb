from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field, model_validator


class SeasonalPriceCreate(BaseModel):
    season_name: str = Field(
        ...,
        min_length=2,
        max_length=100,
    )

    start_date: date
    end_date: date

    price_per_night: Decimal = Field(
        ...,
        gt=0,
        max_digits=10,
        decimal_places=2,
    )

    @model_validator(mode="after")
    def validate_dates(self):
        if self.end_date < self.start_date:
            raise ValueError(
                "End date must be on or after start date"
            )

        return self


class SeasonalPriceUpdate(BaseModel):
    season_name: str | None = Field(
        None,
        min_length=2,
        max_length=100,
    )

    start_date: date | None = None
    end_date: date | None = None

    price_per_night: Decimal | None = Field(
        None,
        gt=0,
        max_digits=10,
        decimal_places=2,
    )


class SeasonalPriceResponse(BaseModel):
    id: int
    property_id: int

    season_name: str
    start_date: date
    end_date: date

    price_per_night: Decimal

    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
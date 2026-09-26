from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class PlatformSettingUpdate(BaseModel):
    commission_percentage: Decimal | None = Field(
        None,
        ge=0,
        le=100,
        max_digits=5,
        decimal_places=2,
    )

    currency: str | None = Field(
        None,
        min_length=3,
        max_length=10,
    )


class PlatformSettingResponse(BaseModel):
    id: int
    commission_percentage: Decimal
    currency: str

    model_config = ConfigDict(from_attributes=True)
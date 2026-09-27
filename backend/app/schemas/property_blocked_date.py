from datetime import date, datetime
from pydantic import BaseModel, ConfigDict, Field, model_validator


class PropertyBlockedDateCreate(BaseModel):
    start_date: date
    end_date: date

    reason: str | None = Field(
        None,
        max_length=255
    )

    @model_validator(mode="after")
    def validate_dates(self):
        if self.end_date < self.start_date:
            raise ValueError(
                "End date must be on or after start date"
            )

        return self


class PropertyBlockedDateResponse(BaseModel):
    id: int
    property_id: int
    start_date: date
    end_date: date
    reason: str | None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
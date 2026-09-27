from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class PropertyImageCreate(BaseModel):
    image_url: str = Field(..., min_length=1, max_length=500)

    imagekit_file_id: str | None = Field(
        None,
        max_length=255
    )

    is_primary: bool = False

    display_order: int = Field(
        default=0,
        ge=0
    )


class PropertyImageUpdate(BaseModel):
    image_url: str | None = Field(None, min_length=1, max_length=500)
    imagekit_file_id: str | None = Field(None, max_length=255)
    is_primary: bool | None = None
    display_order: int | None = Field(None, ge=0)


class PropertyImageResponse(BaseModel):
    id: int
    property_id: int
    image_url: str
    imagekit_file_id: str | None
    is_primary: bool
    display_order: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
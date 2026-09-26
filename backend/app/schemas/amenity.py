from pydantic import BaseModel, ConfigDict, Field

from enum import Enum
from app.models.amenity import AmenityCategory

class AmenityCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    description: str | None = Field(None, max_length=255)
    category: AmenityCategory


class AmenityUpdate(BaseModel):
    name: str | None = Field(None, min_length=2, max_length=100)
    description: str | None = Field(None, max_length=255)
    category: AmenityCategory | None = None
    is_active: bool | None = None


class AmenityResponse(BaseModel):
    id: int
    name: str
    description: str | None
    category: AmenityCategory
    is_active: bool

    model_config = ConfigDict(from_attributes=True)
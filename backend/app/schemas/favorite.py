from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.schemas.property import PropertyResponse


# =========================================================
# CREATE FAVORITE
# =========================================================

class FavoriteCreate(BaseModel):
    property_id: int


# =========================================================
# FAVORITE RESPONSE
# Used after adding a property to favorites
# =========================================================

class FavoriteResponse(BaseModel):
    client_id: int
    property_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# =========================================================
# FAVORITE PROPERTY
# Used by GET /favorites
# =========================================================

class FavoritePropertyResponse(BaseModel):
    property: PropertyResponse
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# =========================================================
# FAVORITES LIST
# =========================================================

class FavoriteListResponse(BaseModel):
    items: list[FavoritePropertyResponse]
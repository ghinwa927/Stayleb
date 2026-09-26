from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.user import User
from app.schemas.amenity import AmenityResponse
from app.services.amenity_service import get_active_amenities
from app.dependencies import require_owner


router = APIRouter(
    prefix="/amenities",
    tags=["Amenities"]
)


@router.get(
    "/public",
    response_model=list[AmenityResponse]
)
def get_public_amenities_route(
    db: Session = Depends(get_db),
):
    return get_active_amenities(db)


@router.get(
    "",
    response_model=list[AmenityResponse]
)
def get_amenities_route(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_owner)
):
    return get_active_amenities(db)
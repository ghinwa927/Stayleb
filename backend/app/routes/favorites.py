from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.dependencies import require_client
from app.schemas.favorite import (
    FavoriteCreate,
    FavoriteResponse,
    FavoriteListResponse,
)
from app.services.favorite_service import (
    add_favorite,
    get_favorites,
    remove_favorite,
)


router = APIRouter(
    prefix="/favorites",
    tags=["Favorites"],
)


# =========================================================
# GET MY FAVORITES
# =========================================================

@router.get(
    "",
    response_model=FavoriteListResponse,
    status_code=status.HTTP_200_OK,
)
def get_my_favorites(
    db: Session = Depends(get_db),
    current_user=Depends(require_client),
):
    return get_favorites(
        db=db,
        client_id=current_user.id,
    )


# =========================================================
# ADD FAVORITE
# =========================================================

@router.post(
    "",
    response_model=FavoriteResponse,
    status_code=status.HTTP_201_CREATED,
)
def add_property_to_favorites(
    favorite_data: FavoriteCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_client),
):
    return add_favorite(
        db=db,
        client_id=current_user.id,
        property_id=favorite_data.property_id,
    )


# =========================================================
# REMOVE FAVORITE
# =========================================================

@router.delete(
    "/{property_id}",
    status_code=status.HTTP_200_OK,
)
def remove_property_from_favorites(
    property_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_client),
):
    return remove_favorite(
        db=db,
        client_id=current_user.id,
        property_id=property_id,
    )
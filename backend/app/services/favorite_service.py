from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.favorite import Favorite
from app.models.property import Property


# =========================================================
# ADD FAVORITE
# =========================================================

def add_favorite(
    db: Session,
    client_id: int,
    property_id: int,
):
    # ---------------------------------
    # 1. Find approved property
    # ---------------------------------

    property_obj = (
        db.query(Property)
        .filter(
            Property.id == property_id,
            Property.status == "approved",
        )
        .first()
    )

    if property_obj is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Property not found",
        )

    # ---------------------------------
    # 2. Check if already favorited
    # ---------------------------------

    existing_favorite = (
        db.query(Favorite)
        .filter(
            Favorite.client_id == client_id,
            Favorite.property_id == property_id,
        )
        .first()
    )

    if existing_favorite:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Property is already in favorites",
        )

    # ---------------------------------
    # 3. Create favorite
    # ---------------------------------

    favorite = Favorite(
        client_id=client_id,
        property_id=property_id,
    )

    db.add(favorite)

    try:
        db.commit()
        db.refresh(favorite)

    except Exception:
        db.rollback()
        raise

    return favorite

# =========================================================
# GET FAVORITES
# =========================================================

def get_favorites(
    db: Session,
    client_id: int,
):
    favorites = (
        db.query(Favorite)
        .join(
            Property,
            Property.id == Favorite.property_id,
        )
        .filter(
            Favorite.client_id == client_id,
            Property.status == "approved",
        )
        .order_by(
            Favorite.created_at.desc()
        )
        .all()
    )

    return {
        "items": [
            {
                "property": favorite.property,
                "created_at": favorite.created_at,
            }
            for favorite in favorites
        ]
    }

# =========================================================
# REMOVE FAVORITE
# =========================================================

def remove_favorite(
    db: Session,
    client_id: int,
    property_id: int,
):
    # ---------------------------------
    # 1. Find client's favorite
    # ---------------------------------

    favorite = (
        db.query(Favorite)
        .filter(
            Favorite.client_id == client_id,
            Favorite.property_id == property_id,
        )
        .first()
    )

    if favorite is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Favorite not found",
        )

    # ---------------------------------
    # 2. Delete favorite
    # ---------------------------------

    db.delete(favorite)

    try:
        db.commit()

    except Exception:
        db.rollback()
        raise

    # ---------------------------------
    # 3. Return confirmation
    # ---------------------------------

    return {
        "message": "Property removed from favorites"
    }
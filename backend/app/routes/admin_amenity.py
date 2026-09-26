from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.user import User
from app.schemas.amenity import (
    AmenityCreate,
    AmenityUpdate,
    AmenityResponse,
)
from app.services.admin_amenity_service import (
    get_all_amenities,
    create_amenity,
    update_amenity,
    deactivate_amenity,
)
from app.dependencies import require_admin


router = APIRouter(
    prefix="/admin/amenities",
    tags=["Admin - Amenities"],
)


@router.get("", response_model=list[AmenityResponse])
def admin_get_amenities(
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin),
):
    return get_all_amenities(db)


@router.post(
    "",
    response_model=AmenityResponse,
    status_code=status.HTTP_201_CREATED,
)
def admin_create_amenity(
    data: AmenityCreate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin),
):
    try:
        return create_amenity(
            db=db,
            name=data.name,
            description=data.description,
            category=data.category,
        )

    except ValueError as e:
        raise HTTPException(
            status_code=409,
            detail=str(e),
        )


@router.patch(
    "/{amenity_id}",
    response_model=AmenityResponse,
)
def admin_update_amenity(
    amenity_id: int,
    data: AmenityUpdate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin),
):
    try:
        update_data = data.model_dump(exclude_unset=True)

        return update_amenity(
            db=db,
            amenity_id=amenity_id,
            **update_data,
        )

    except ValueError as e:
        message = str(e)

        if message == "Amenity not found":
            raise HTTPException(
                status_code=404,
                detail=message,
            )

        raise HTTPException(
            status_code=409,
            detail=message,
        )


@router.delete(
    "/{amenity_id}",
    response_model=AmenityResponse,
)
def admin_deactivate_amenity(
    amenity_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin),
):
    try:
        return deactivate_amenity(
            db=db,
            amenity_id=amenity_id,
        )

    except ValueError as e:
        raise HTTPException(
            status_code=404,
            detail=str(e),
        )
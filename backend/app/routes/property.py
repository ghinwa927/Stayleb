from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.user import User
from app.schemas.property import (
    PropertyCreate,
    PropertyUpdate,
    PropertyResponse,
)
from app.services.property_service import (
    create_property,
    get_owner_properties,
    get_owner_property_by_id,
    update_property,
    delete_property,
)

# Change this import path if your auth file has a different name
from app.dependencies import require_owner


router = APIRouter(
    prefix="/properties",
    tags=["Properties"],
)

@router.post(
    "",
    response_model=PropertyResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_property_route(
    property_data: PropertyCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_owner),
):
    try:
        return create_property(
            db=db,
            property_data=property_data,
            owner_id=current_user.id,
        )

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )

@router.get(
    "/my-properties",
    response_model=list[PropertyResponse],
)
def get_my_properties_route(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_owner),
):
    return get_owner_properties(
        db=db,
        owner_id=current_user.id,
    )

@router.get(
    "/{property_id}",
    response_model=PropertyResponse,
)
def get_my_property_route(
    property_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_owner),
):
    try:
        return get_owner_property_by_id(
            db=db,
            property_id=property_id,
            owner_id=current_user.id,
        )

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )
    
@router.patch(
    "/{property_id}",
    response_model=PropertyResponse,
)
def update_property_route(
    property_id: int,
    property_data: PropertyUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_owner),
):
    try:
        return update_property(
            db=db,
            property_id=property_id,
            owner_id=current_user.id,
            property_data=property_data,
        )

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )

@router.delete(
    "/{property_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_property_route(
    property_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_owner),
):
    try:
        delete_property(
            db=db,
            property_id=property_id,
            owner_id=current_user.id,
        )

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )

    return None
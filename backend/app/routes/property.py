from fastapi import APIRouter, Depends, HTTPException, status,Query
from sqlalchemy.orm import Session

from datetime import date
from decimal import Decimal
from typing import Literal

from app.database.database import get_db
from app.models.user import User
from app.services.property_search_service import search_properties
from app.schemas.property import (
    PropertyCreate,
    PropertyUpdate,
    PropertyResponse,
    PropertySearchResponse
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
    "",
    response_model=PropertySearchResponse,
)
def public_search_properties(
    location: str | None = Query(
        None,
        min_length=1,
        max_length=150,
    ),
    check_in: date | None = None,
    check_out: date | None = None,
    guests: int | None = Query(
        None,
        ge=1,
    ),
    min_price: Decimal | None = Query(
        None,
        ge=0,
    ),
    max_price: Decimal | None = Query(
        None,
        ge=0,
    ),
    property_type: Literal[
        "chalet",
        "furnished_house",
    ] | None = None,
    bedrooms: int | None = Query(
        None,
        ge=0,
    ),
    bathrooms: int | None = Query(
        None,
        ge=1,
    ),
    amenity_ids: list[int] | None = Query(None),
    sort: Literal[
        "recommended",
        "price_low",
        "price_high",
        "newest",
    ] = "recommended",
    page: int = Query(
        1,
        ge=1,
    ),
    page_size: int = Query(
        12,
        ge=1,
        le=50,
    ),
    db: Session = Depends(get_db),
):
    if (check_in is None) != (check_out is None):
        raise HTTPException(
            status_code=400,
            detail="Both check_in and check_out must be provided together",
        )

    if (
        min_price is not None
        and max_price is not None
        and min_price > max_price
    ):
        raise HTTPException(
            status_code=400,
            detail="min_price cannot be greater than max_price",
        )

    try:
        return search_properties(
            db=db,
            location=location,
            check_in=check_in,
            check_out=check_out,
            guests=guests,
            min_price=min_price,
            max_price=max_price,
            property_type=property_type,
            bedrooms=bedrooms,
            bathrooms=bathrooms,
            amenity_ids=amenity_ids,
            sort=sort,
            page=page,
            page_size=page_size,
        )

    except ValueError as e:
        raise HTTPException(
            status_code=400,
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
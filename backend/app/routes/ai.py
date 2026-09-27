from fastapi import APIRouter, Depends

from app.dependencies import require_owner,require_client
from app.models.user import User
from app.schemas.ai import (
    PropertyDescriptionGenerateRequest,
    PropertyDescriptionGenerateResponse,
    AIPropertySearchRequest,
)

from app.schemas.property import PropertySearchResponse
from app.services.ai_service import (
    generate_property_description,
    search_properties_with_ai,
)

from sqlalchemy.orm import Session

from app.database.database import get_db

router = APIRouter(
    prefix="/ai",
    tags=["AI"],
)


@router.post(
    "/property/generate-description",
    response_model=PropertyDescriptionGenerateResponse,
)
def generate_description(
    data: PropertyDescriptionGenerateRequest,
    current_user: User = Depends(require_owner),
):
    description = generate_property_description(
        data=data,
    )

    return {
        "description": description,
    }

@router.post(
    "/search",
    response_model=PropertySearchResponse,
)
def ai_property_search(
    data: AIPropertySearchRequest,
    page: int = 1,
    page_size: int = 12,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_client),
):
    return search_properties_with_ai(
        db=db,
        query=data.query,
        page=page,
        page_size=page_size,
    )
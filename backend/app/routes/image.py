from fastapi import (
    APIRouter,
    Depends,
    File,
    HTTPException,
    UploadFile,
    status,
)

from app.dependencies import require_owner
from app.models.user import User
from app.services.image_service import upload_property_image


router = APIRouter(
    prefix="/images",
    tags=["Images"]
)


@router.post(
    "/property",
    status_code=status.HTTP_201_CREATED
)
async def upload_property_image_route(
    file: UploadFile = File(...),
    current_user: User = Depends(require_owner)
):
    try:
        return await upload_property_image(file)

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


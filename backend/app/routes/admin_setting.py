from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.user import User
from app.schemas.platform_setting import (
    PlatformSettingUpdate,
    PlatformSettingResponse,
)
from app.services.platform_setting_service import (
    get_platform_settings,
    update_platform_settings,
)
from app.dependencies import require_admin


router = APIRouter(
    prefix="/admin/settings",
    tags=["Admin - Settings"],
)


@router.get(
    "",
    response_model=PlatformSettingResponse,
)
def admin_get_platform_settings(
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin),
):
    try:
        return get_platform_settings(db)

    except ValueError as e:
        raise HTTPException(
            status_code=404,
            detail=str(e),
        )


@router.patch(
    "",
    response_model=PlatformSettingResponse,
)
def admin_update_platform_settings(
    data: PlatformSettingUpdate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin),
):
    try:
        update_data = data.model_dump(exclude_unset=True)

        if not update_data:
            raise HTTPException(
                status_code=400,
                detail="No fields provided for update",
            )

        return update_platform_settings(
            db=db,
            update_data=update_data,
        )

    except ValueError as e:
        raise HTTPException(
            status_code=404,
            detail=str(e),
        )
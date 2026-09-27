from sqlalchemy.orm import Session

from app.models.platform_setting import PlatformSetting


def get_platform_settings(db: Session):
    settings = (
        db.query(PlatformSetting)
        .order_by(PlatformSetting.id.asc())
        .first()
    )

    if not settings:
        raise ValueError("Platform settings not found")

    return settings


def update_platform_settings(
    db: Session,
    update_data: dict,
):
    settings = get_platform_settings(db)

    for field, value in update_data.items():
        setattr(settings, field, value)

    db.commit()
    db.refresh(settings)

    return settings
from sqlalchemy.orm import Session

from app.models.property_blocked_date import PropertyBlockedDate
from app.schemas.property_blocked_date import PropertyBlockedDateCreate
from app.services.property_service import get_owner_property_by_id


def get_property_blocked_dates(
    db: Session,
    property_id: int,
    owner_id: int
):
    # Make sure the property exists and belongs to this owner
    get_owner_property_by_id(
        db=db,
        property_id=property_id,
        owner_id=owner_id
    )

    return (
        db.query(PropertyBlockedDate)
        .filter(
            PropertyBlockedDate.property_id == property_id
        )
        .order_by(PropertyBlockedDate.start_date.asc())
        .all()
    )


def create_property_blocked_date(
    db: Session,
    property_id: int,
    owner_id: int,
    blocked_date_data: PropertyBlockedDateCreate
):
    # Make sure the property belongs to the logged-in owner
    get_owner_property_by_id(
        db=db,
        property_id=property_id,
        owner_id=owner_id
    )

    # Check whether the new range overlaps an existing blocked range
    overlapping_block = (
        db.query(PropertyBlockedDate)
        .filter(
            PropertyBlockedDate.property_id == property_id,
            PropertyBlockedDate.start_date <= blocked_date_data.end_date,
            PropertyBlockedDate.end_date >= blocked_date_data.start_date
        )
        .first()
    )

    if overlapping_block:
        raise ValueError(
            "The selected dates overlap an existing blocked period"
        )

    try:
        new_blocked_date = PropertyBlockedDate(
            property_id=property_id,
            start_date=blocked_date_data.start_date,
            end_date=blocked_date_data.end_date,
            reason=blocked_date_data.reason
        )

        db.add(new_blocked_date)
        db.commit()
        db.refresh(new_blocked_date)

        return new_blocked_date

    except Exception:
        db.rollback()
        raise


def delete_property_blocked_date(
    db: Session,
    property_id: int,
    blocked_date_id: int,
    owner_id: int
):
    # Verify property ownership
    get_owner_property_by_id(
        db=db,
        property_id=property_id,
        owner_id=owner_id
    )

    blocked_date = (
        db.query(PropertyBlockedDate)
        .filter(
            PropertyBlockedDate.id == blocked_date_id,
            PropertyBlockedDate.property_id == property_id
        )
        .first()
    )

    if not blocked_date:
        raise ValueError("Blocked date not found")

    try:
        db.delete(blocked_date)
        db.commit()

    except Exception:
        db.rollback()
        raise
from sqlalchemy.orm import Session

from app.models.property import Property


def get_all_properties(
    db: Session,
    status: str | None = None,
):
    query = db.query(Property)

    if status:
        query = query.filter(Property.status == status)

    return query.order_by(Property.created_at.desc()).all()


def get_property_by_id(
    db: Session,
    property_id: int,
):
    property_obj = (
        db.query(Property)
        .filter(Property.id == property_id)
        .first()
    )

    if not property_obj:
        raise ValueError("Property not found")

    return property_obj


def approve_property(
    db: Session,
    property_id: int,
):
    property_obj = get_property_by_id(db, property_id)

    property_obj.status = "approved"
    property_obj.rejection_reason = None

    db.commit()
    db.refresh(property_obj)

    return property_obj


def reject_property(
    db: Session,
    property_id: int,
    rejection_reason: str,
):
    property_obj = get_property_by_id(db, property_id)

    property_obj.status = "rejected"
    property_obj.rejection_reason = rejection_reason

    db.commit()
    db.refresh(property_obj)

    return property_obj
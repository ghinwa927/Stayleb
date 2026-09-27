from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.models.property import Property

def get_admin_properties(
    db: Session,
    status: str | None = None,
    search: str | None = None,
    owner_id: int | None = None,
    location: str | None = None,
    page: int = 1,
    page_size: int = 20,
):
    query = db.query(Property)

    # =====================================================
    # STATUS FILTER
    # =====================================================

    if status is not None:
        query = query.filter(
            Property.status == status
        )

    # =====================================================
    # OWNER FILTER
    # =====================================================

    if owner_id is not None:
        query = query.filter(
            Property.owner_id == owner_id
        )

    # =====================================================
    # LOCATION FILTER
    # =====================================================

    if location:
        location_value = location.strip()

        if location_value:
            query = query.filter(
                Property.location.ilike(
                    f"%{location_value}%"
                )
            )

    # =====================================================
    # SEARCH
    # =====================================================

    if search:
        search_value = search.strip()

        if search_value:
            pattern = f"%{search_value}%"

            query = query.filter(
                or_(
                    Property.title.ilike(pattern),
                    Property.location.ilike(pattern),
                    Property.address.ilike(pattern),
                    Property.description.ilike(pattern),
                )
            )

    # =====================================================
    # TOTAL BEFORE PAGINATION
    # =====================================================

    total = query.count()

    # =====================================================
    # PAGINATION
    # =====================================================

    page = max(page, 1)

    page_size = max(
        1,
        min(page_size, 100),
    )

    total_pages = (
        (total + page_size - 1) // page_size
        if total > 0
        else 0
    )

    properties = (
        query
        .order_by(Property.created_at.desc())
        .offset(
            (page - 1) * page_size
        )
        .limit(page_size)
        .all()
    )

    return {
        "items": properties,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages,
    }

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
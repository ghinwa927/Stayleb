from sqlalchemy.orm import Session

from app.models.amenity import Amenity, AmenityCategory


def get_all_amenities(db: Session):
    return (
        db.query(Amenity)
        .order_by(Amenity.name.asc())
        .all()
    )


def get_amenity_by_id(
    db: Session,
    amenity_id: int,
):
    amenity = (
        db.query(Amenity)
        .filter(Amenity.id == amenity_id)
        .first()
    )

    if not amenity:
        raise ValueError("Amenity not found")

    return amenity


def create_amenity(
    db: Session,
    name: str,
    description: str | None,
    category: AmenityCategory,
):
    name = name.strip()

    existing_amenity = (
        db.query(Amenity)
        .filter(Amenity.name == name)
        .first()
    )

    if existing_amenity:
        raise ValueError("Amenity name already exists")

    amenity = Amenity(
        name=name,
        description=description,
        category=category,
        is_active=True,
    )

    db.add(amenity)
    db.commit()
    db.refresh(amenity)

    return amenity


def update_amenity(
    db: Session,
    amenity_id: int,
    name: str | None = None,
    description: str | None = None,
    is_active: bool | None = None,
    category: AmenityCategory | None = None,
):
    amenity = get_amenity_by_id(
        db=db,
        amenity_id=amenity_id,
    )

    # Update name
    if name is not None:
        name = name.strip()

        existing_amenity = (
            db.query(Amenity)
            .filter(
                Amenity.name == name,
                Amenity.id != amenity_id,
            )
            .first()
        )

        if existing_amenity:
            raise ValueError("Amenity name already exists")

        amenity.name = name

    # Update description
    if description is not None:
        amenity.description = description

    # Update category
    if category is not None:
        amenity.category = category

    # Activate / deactivate
    if is_active is not None:
        amenity.is_active = is_active

    db.commit()
    db.refresh(amenity)

    return amenity


def deactivate_amenity(
    db: Session,
    amenity_id: int,
):
    amenity = get_amenity_by_id(
        db=db,
        amenity_id=amenity_id,
    )

    amenity.is_active = False

    db.commit()
    db.refresh(amenity)

    return amenity
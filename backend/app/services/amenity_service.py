from sqlalchemy.orm import Session

from app.models.amenity import Amenity


def get_active_amenities(db: Session):
    return (
        db.query(Amenity)
        .filter(Amenity.is_active.is_(True))
        .order_by(Amenity.name.asc())
        .all()
    )
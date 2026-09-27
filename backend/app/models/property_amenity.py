from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import relationship

from app.database.database import Base


class PropertyAmenity(Base):
    __tablename__ = "property_amenities"

    property_id = Column(
        Integer,
        ForeignKey("properties.id", ondelete="CASCADE"),
        primary_key=True
    )

    amenity_id = Column(
        Integer,
        ForeignKey("amenities.id"),
        primary_key=True
    )

    property = relationship(
        "Property",
        back_populates="property_amenities"
    )

    amenity = relationship(
        "Amenity",
        back_populates="property_amenities"
    )
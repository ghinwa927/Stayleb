from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Enum as SQLEnum,
    Integer,
    String,
)
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from enum import Enum
from app.database.database import Base


class AmenityCategory(str, Enum):
    HEATING_COMFORT = "Heating & Comfort"
    WELLNESS_LEISURE = "Wellness & Leisure"
    ATMOSPHERE_VIEWS = "Atmosphere & Views"
    DINING_OUTDOOR = "Dining & Outdoor"
    COASTAL_STAYS = "Coastal Stays"
    OTHERS = "Other"

class Amenity(Base):
    __tablename__ = "amenities"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    name = Column(
        String(100),
        nullable=False,
        unique=True
    )

    description = Column(
        String(255),
        nullable=True
    )

    category = Column(
        SQLEnum(
            AmenityCategory,
            values_callable=lambda enum: [
                item.value for item in enum
            ],
        ),
        nullable=False,
    )

    is_active = Column(
        Boolean,
        nullable=False,
        default=True
    )

    created_at = Column(
        DateTime,
        nullable=False,
        server_default=func.now()
    )

    updated_at = Column(
        DateTime,
        nullable=False,
        server_default=func.now(),
        onupdate=func.now()
    )

    property_amenities = relationship(
    "PropertyAmenity",
    back_populates="amenity",
    cascade="all, delete-orphan"
)
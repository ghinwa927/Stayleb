from sqlalchemy import Column, Integer, String, Text, DECIMAL, Enum, DateTime, ForeignKey
from sqlalchemy.sql import func

from app.database.database import Base
from sqlalchemy.orm import relationship


class Property(Base):
    __tablename__ = "properties"

    id = Column(Integer, primary_key=True, index=True)

    owner_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True
    )

    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)

    property_type = Column(
        Enum("chalet", "furnished_house"),
        nullable=False
    )

    location = Column(String(150), nullable=False)
    address = Column(String(255), nullable=True)

    price_per_night = Column(DECIMAL(10, 2), nullable=False)

    bedrooms = Column(Integer, nullable=False)
    beds = Column(Integer, nullable=False)
    bathrooms = Column(Integer, nullable=False)
    max_guests = Column(Integer, nullable=False)

    min_nights = Column(Integer, nullable=False, default=1)

    status = Column(
        Enum("pending", "approved", "rejected"),
        nullable=False,
        default="pending"
    )

    rejection_reason = Column(Text, nullable=True)

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

    seasonal_prices = relationship(
    "PropertySeasonalPrice",
    back_populates="property",
    cascade="all, delete-orphan"
)
    
    images = relationship(
    "PropertyImage",
    back_populates="property",
    cascade="all, delete-orphan",
    order_by="PropertyImage.display_order"
)
    
    property_rules = relationship(
    "PropertyRule",
    back_populates="property",
    cascade="all, delete-orphan"
)

    property_amenities = relationship(
    "PropertyAmenity",
    back_populates="property",
    cascade="all, delete-orphan"
)

    blocked_dates = relationship(
    "PropertyBlockedDate",
    back_populates="property",
    cascade="all, delete-orphan"
)

    bookings = relationship(
    "Booking",
    back_populates="property",
    cascade="all, delete-orphan",
)

    favorites = relationship(
    "Favorite",
    back_populates="property",
    cascade="all, delete-orphan",
)
    @property
    def amenities(self):
     return [
        property_amenity.amenity
        for property_amenity in self.property_amenities
    ]
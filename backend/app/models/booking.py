from sqlalchemy import (
    Column,
    Integer,
    Date,
    DateTime,
    DECIMAL,
    Enum,
    ForeignKey,
)
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.database.database import Base


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    client_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True,
    )

    property_id = Column(
        Integer,
        ForeignKey("properties.id"),
        nullable=False,
        index=True,
    )

    check_in = Column(
        Date,
        nullable=False,
    )

    check_out = Column(
        Date,
        nullable=False,
    )

    guests = Column(
        Integer,
        nullable=False,
    )

    # Historical average/effective nightly price
    # at the time the booking was created.
    price_per_night = Column(
        DECIMAL(10, 2),
        nullable=False,
    )

    number_of_nights = Column(
        Integer,
        nullable=False,
    )

    total_price = Column(
        DECIMAL(10, 2),
        nullable=False,
    )

    status = Column(
        Enum(
            "pending",
            "confirmed",
            "rejected",
            "cancelled",
            "completed",
        ),
        nullable=False,
        default="pending",
    )

    commission_percentage = Column(
        DECIMAL(5, 2),
        nullable=False,
    )

    commission_amount = Column(
        DECIMAL(10, 2),
        nullable=False,
    )

    owner_earnings = Column(
        DECIMAL(10, 2),
        nullable=False,
    )

    created_at = Column(
        DateTime,
        nullable=False,
        server_default=func.now(),
    )

    updated_at = Column(
        DateTime,
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )

    property = relationship(
        "Property",
        back_populates="bookings",
    )

    client = relationship(
        "User",
        back_populates="bookings",
    )

    payment = relationship(
    "Payment",
    back_populates="booking",
    uselist=False,
    cascade="all, delete-orphan",
)
from sqlalchemy import (
    Column,
    Integer,
    DECIMAL,
    Enum,
    String,
    DateTime,
    ForeignKey,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database.database import Base


class Payment(Base):
    __tablename__ = "payments"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    booking_id = Column(
        Integer,
        ForeignKey("bookings.id"),
        nullable=False,
        unique=True,
        index=True,
    )

    amount = Column(
        DECIMAL(10, 2),
        nullable=False,
    )

    payment_method = Column(
        Enum(
            "stripe",
            "cash",
        ),
        nullable=False,
    )

    payment_status = Column(
        Enum(
            "pending",
            "paid",
            "failed",
            "refunded",
        ),
        nullable=False,
        default="pending",
    )

    stripe_payment_id = Column(
        String(255),
        nullable=True,
    )

    paid_at = Column(
        DateTime,
        nullable=True,
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

    booking = relationship(
        "Booking",
        back_populates="payment",
    )
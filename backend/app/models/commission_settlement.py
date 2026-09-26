from sqlalchemy import (
    Column,
    Integer,
    DECIMAL,
    DateTime,
    ForeignKey,
    Enum,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database.database import Base


class CommissionSettlement(Base):
    __tablename__ = "commission_settlements"

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

    owner_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True,
    )

    commission_amount = Column(
        DECIMAL(10, 2),
        nullable=False,
    )

    status = Column(
        Enum("unpaid", "paid"),
        nullable=False,
        default="unpaid",
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
        back_populates="commission_settlement",
    )

    owner = relationship(
        "User",
        foreign_keys=[owner_id],
    )
from enum import Enum
from decimal import Decimal

from sqlalchemy import (
    Column,
    Integer,
    DECIMAL,
    String,
    DateTime,
    ForeignKey,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database.database import Base


class PaymentStatus(str, Enum):
    PENDING = "pending"
    PAID = "paid"
    FAILED = "failed"
    REFUNDED = "refunded"
    PARTIALLY_REFUNDED = "partially_refunded"
    CANCELLED = "cancelled"


class PaymentMethod(str, Enum):
    CASH = "cash"
    STRIPE = "stripe"


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
        String(20),
        nullable=False,
    )

    payment_status = Column(
        String(20),
        nullable=False,
        default=PaymentStatus.PENDING.value,
    )

    stripe_payment_id = Column(
        String(255),
        nullable=True,
    )

    stripe_refund_id = Column(
        String(255),
        nullable=True,
    )

    refunded_amount = Column(
        DECIMAL(10, 2),
        nullable=False,
        default=Decimal("0.00"),
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
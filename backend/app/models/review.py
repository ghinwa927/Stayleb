from sqlalchemy import (
    Column,
    Integer,
    ForeignKey,
    Text,
    DateTime,
    Enum,
    func,
    String
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database.database import Base


class Review(Base):
    __tablename__ = "reviews"

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

    overall_rating = Column(
        Integer,
        nullable=False,
    )

    cleanliness_rating = Column(
        Integer,
        nullable=False,
    )

    privacy_rating = Column(
        Integer,
        nullable=False,
    )

    wifi_rating = Column(
        Integer,
        nullable=False,
    )

    hot_water_rating = Column(
        Integer,
        nullable=False,
    )

    location_rating = Column(
        Integer,
        nullable=False,
    )

    value_rating = Column(
        Integer,
        nullable=False,
    )

    comment = Column(
        Text,
        nullable=True,
    )

    moderation_status = Column(
      Enum("visible", "flagged", "removed"),
      nullable=False,
      default="visible",
      server_default="visible",
      index=True,
)

    report_reason = Column(
      String(500),
      nullable=True,
)

    reported_at = Column(
      DateTime,
      nullable=True,
)

    moderated_at = Column(
      DateTime,
      nullable=True,
)

    created_at = Column(
        DateTime,
        nullable=False,
        server_default=func.now(),
    )

    booking = relationship(
        "Booking",
        back_populates="review",
    )
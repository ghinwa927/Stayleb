from sqlalchemy import (
    Column,
    Integer,
    String,
    DECIMAL,
    Date,
    DateTime,
    ForeignKey,
)
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.database.database import Base


class PropertySeasonalPrice(Base):
    __tablename__ = "property_seasonal_prices"

    id = Column(Integer, primary_key=True, index=True)

    property_id = Column(
        Integer,
        ForeignKey("properties.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    season_name = Column(
        String(100),
        nullable=False,
    )

    start_date = Column(
        Date,
        nullable=False,
    )

    end_date = Column(
        Date,
        nullable=False,
    )

    price_per_night = Column(
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
        back_populates="seasonal_prices",
    )
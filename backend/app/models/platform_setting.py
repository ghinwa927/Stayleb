from sqlalchemy import Column, Integer, Numeric, String, DateTime
from sqlalchemy.sql import func

from app.database.database import Base


class PlatformSetting(Base):
    __tablename__ = "platform_settings"

    id = Column(Integer, primary_key=True, index=True)

    commission_percentage = Column(
        Numeric(5, 2),
        nullable=False,
    )

    currency = Column(
        String(10),
        nullable=False,
        default="USD",
    )

    updated_at = Column(
        DateTime,
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )
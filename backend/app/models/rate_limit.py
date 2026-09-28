from datetime import datetime

from sqlalchemy import DateTime, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database.database import Base


class RateLimitCounter(Base):
    """Fixed-window counter for API rate limiting.

    One row per (scope, identifier, window). Lives in the application
    database, so limits are shared across every backend instance behind
    the load balancer — unlike an in-memory limiter.
    """

    __tablename__ = "rate_limit_counters"

    key: Mapped[str] = mapped_column(
        String(255),
        primary_key=True,
    )

    window_start: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        index=True,
    )

    count: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
    )

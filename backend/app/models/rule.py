from enum import Enum

from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    DateTime,
    Enum as SQLEnum,
)
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.database.database import Base


class RuleCategory(str, Enum):
    NIGHTTIME_SERENITY = "Nighttime Serenity"
    ANIMAL_PET_STAYS = "Animal & Pet stays"
    CLEAN_AIR_SAFETY = "Clean Air & Safety"
    NOISE_COMMUNITY = "Noise & Community"
    FIRE_SAFETY_CAPACITY = "Fire Safety & Capacity"
    MEDIA_LICENSING = "Media Licensing"
    OTHERS = "Others"

class Rule(Base):
    __tablename__ = "rules"

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
        RuleCategory,
        values_callable=lambda enum: [
            item.value for item in enum
        ],
    ),
    nullable=False,
    default=RuleCategory.OTHERS,
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

    property_rules = relationship(
        "PropertyRule",
        back_populates="rule"
    )
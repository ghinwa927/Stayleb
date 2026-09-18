from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    DateTime,
    ForeignKey,
)
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.database.database import Base


class PropertyRule(Base):
    __tablename__ = "property_rules"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    property_id = Column(
        Integer,
        ForeignKey("properties.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    rule_id = Column(
        Integer,
        ForeignKey("rules.id"),
        nullable=False,
        index=True
    )

    allowed = Column(
        Boolean,
        nullable=False
    )

    value = Column(
        String(100),
        nullable=True
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

    property = relationship(
        "Property",
        back_populates="property_rules"
    )

    rule = relationship(
        "Rule",
        back_populates="property_rules"
    )
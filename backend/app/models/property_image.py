from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.database.database import Base


class PropertyImage(Base):
    __tablename__ = "property_images"

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

    image_url = Column(
        String(500),
        nullable=False
    )

    imagekit_file_id = Column(
    String(255),
    nullable=True
)

    is_primary = Column(
        Boolean,
        nullable=False,
        default=False
    )

    display_order = Column(
        Integer,
        nullable=False,
        default=0
    )

    created_at = Column(
        DateTime,
        nullable=False,
        server_default=func.now()
    )

    property = relationship(
        "Property",
        back_populates="images"
    )
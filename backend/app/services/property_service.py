from sqlalchemy.orm import Session, selectinload
from sqlalchemy import or_

from app.models.property import Property
from app.models.property_seasonal_price import PropertySeasonalPrice
from app.schemas.property import PropertyCreate, PropertyUpdate

def validate_seasonal_price_overlaps(seasonal_prices):
    for i in range(len(seasonal_prices)):
        for j in range(i + 1, len(seasonal_prices)):

            first = seasonal_prices[i]
            second = seasonal_prices[j]

            overlap = (
                first.start_date <= second.end_date
                and second.start_date <= first.end_date
            )

            if overlap:
                raise ValueError(
                    f"Seasonal pricing periods "
                    f"'{first.season_name}' and "
                    f"'{second.season_name}' overlap."
                )

def create_property(
    db: Session,
    property_data: PropertyCreate,
    owner_id: int,
) -> Property:

    validate_seasonal_price_overlaps(
        property_data.seasonal_prices
    )

    try:
        # Separate property fields from seasonal pricing
        property_dict = property_data.model_dump(
            exclude={"seasonal_prices"}
        )

        # Create property
        new_property = Property(
            **property_dict,
            owner_id=owner_id,
            status="pending",
            rejection_reason=None,
        )

        db.add(new_property)

        # Get generated property ID without committing
        db.flush()

        # Create seasonal prices
        for seasonal_data in property_data.seasonal_prices:
            seasonal_price = PropertySeasonalPrice(
                property_id=new_property.id,
                **seasonal_data.model_dump(),
            )

            db.add(seasonal_price)

        # Commit property + seasonal prices together
        db.commit()

        db.refresh(new_property)

        return get_owner_property_by_id(
            db=db,
            property_id=new_property.id,
            owner_id=owner_id,
        )

    except Exception:
        db.rollback()
        raise

def get_owner_properties(
    db: Session,
    owner_id: int,
) -> list[Property]:

    return (
        db.query(Property)
        .options(
            selectinload(Property.seasonal_prices)
        )
        .filter(Property.owner_id == owner_id)
        .order_by(Property.created_at.desc())
        .all()
    )

def get_owner_property_by_id(
    db: Session,
    property_id: int,
    owner_id: int,
) -> Property:

    property_obj = (
        db.query(Property)
        .options(
            selectinload(Property.seasonal_prices)
        )
        .filter(
            Property.id == property_id,
            Property.owner_id == owner_id,
        )
        .first()
    )

    if not property_obj:
        raise ValueError("Property not found")

    return property_obj

def update_property(
    db: Session,
    property_id: int,
    owner_id: int,
    property_data: PropertyUpdate,
) -> Property:

    property_obj = get_owner_property_by_id(
        db=db,
        property_id=property_id,
        owner_id=owner_id,
    )

    update_data = property_data.model_dump(
        exclude_unset=True
    )

    seasonal_prices = update_data.pop(
        "seasonal_prices",
        None,
    )

    try:
        # Update normal property fields
        for field, value in update_data.items():
            setattr(property_obj, field, value)

        # If seasonal pricing was included in request
        if seasonal_prices is not None:

            # Convert dictionaries back into objects
            seasonal_objects = (
                property_data.seasonal_prices or []
            )

            validate_seasonal_price_overlaps(
                seasonal_objects
            )

            # Remove old seasonal prices
            db.query(PropertySeasonalPrice).filter(
                PropertySeasonalPrice.property_id
                == property_obj.id
            ).delete(
                synchronize_session=False
            )

            # Add new seasonal prices
            for seasonal_data in seasonal_objects:
                db.add(
                    PropertySeasonalPrice(
                        property_id=property_obj.id,
                        **seasonal_data.model_dump(),
                    )
                )

        # Any owner edit requires admin review again
        property_obj.status = "pending"
        property_obj.rejection_reason = None

        db.commit()

        return get_owner_property_by_id(
            db=db,
            property_id=property_obj.id,
            owner_id=owner_id,
        )

    except Exception:
        db.rollback()
        raise

def delete_property(
    db: Session,
    property_id: int,
    owner_id: int,
) -> None:

    property_obj = get_owner_property_by_id(
        db=db,
        property_id=property_id,
        owner_id=owner_id,
    )

    try:
        db.delete(property_obj)
        db.commit()

    except Exception:
        db.rollback()
        raise


def get_approved_properties(
    db: Session,
) -> list[Property]:

    return (
        db.query(Property)
        .options(
            selectinload(Property.seasonal_prices)
        )
        .filter(Property.status == "approved")
        .order_by(Property.created_at.desc())
        .all()
    )

def get_approved_property_by_id(
    db: Session,
    property_id: int,
) -> Property:

    property_obj = (
        db.query(Property)
        .options(
            selectinload(Property.seasonal_prices)
        )
        .filter(
            Property.id == property_id,
            Property.status == "approved",
        )
        .first()
    )

    if not property_obj:
        raise ValueError("Property not found")

    return property_obj
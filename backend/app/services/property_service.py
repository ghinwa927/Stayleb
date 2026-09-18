from sqlalchemy.orm import Session, selectinload
from sqlalchemy import or_

from app.models.property import Property
from app.models.property_seasonal_price import PropertySeasonalPrice
from app.schemas.property import PropertyCreate, PropertyUpdate
from app.models.property_image import PropertyImage
from app.models.amenity import Amenity
from app.models.property_amenity import PropertyAmenity
from app.models.rule import Rule
from app.models.property_rule import PropertyRule
from app.services.image_service import delete_property_image

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


def validate_property_images(images):
    primary_count = sum(1 for image in images if image.is_primary)

    if primary_count > 1:
        raise ValueError("Only one property image can be primary")


def validate_amenities(db: Session, amenity_ids: list[int]):
    if len(amenity_ids) != len(set(amenity_ids)):
        raise ValueError("Duplicate amenities are not allowed")

    if not amenity_ids:
        return

    amenities = (
        db.query(Amenity)
        .filter(
            Amenity.id.in_(amenity_ids),
            Amenity.is_active.is_(True)
        )
        .all()
    )

    found_ids = {amenity.id for amenity in amenities}

    invalid_ids = [
        amenity_id
        for amenity_id in amenity_ids
        if amenity_id not in found_ids
    ]

    if invalid_ids:
        raise ValueError(
            f"Invalid or inactive amenity IDs: {invalid_ids}"
        )


def validate_rules(db: Session, rules):
    rule_ids = [rule.rule_id for rule in rules]

    if len(rule_ids) != len(set(rule_ids)):
        raise ValueError("Duplicate rules are not allowed")

    if not rule_ids:
        return

    existing_rules = (
        db.query(Rule)
        .filter(
            Rule.id.in_(rule_ids),
            Rule.is_active.is_(True)
        )
        .all()
    )

    found_ids = {rule.id for rule in existing_rules}

    invalid_ids = [
        rule_id
        for rule_id in rule_ids
        if rule_id not in found_ids
    ]

    if invalid_ids:
        raise ValueError(
            f"Invalid or inactive rule IDs: {invalid_ids}"
        )

def create_property(
    db: Session,
    property_data: PropertyCreate,
    owner_id: int
):
    # -----------------------------------------
    # 1. Validate nested property information
    # -----------------------------------------

    validate_seasonal_price_overlaps(
        property_data.seasonal_prices
    )

    validate_property_images(
        property_data.images
    )

    validate_amenities(
        db,
        property_data.amenity_ids
    )

    validate_rules(
        db,
        property_data.rules
    )

    try:
        # -----------------------------------------
        # 2. Create main property
        # -----------------------------------------

        property_dict = property_data.model_dump(
            exclude={
                "seasonal_prices",
                "images",
                "amenity_ids",
                "rules",
            }
        )

        new_property = Property(
            **property_dict,
            owner_id=owner_id,
            status="pending",
            rejection_reason=None
        )

        db.add(new_property)

        # Get the property ID without committing yet.
        db.flush()

        # -----------------------------------------
        # 3. Create seasonal prices
        # -----------------------------------------

        for seasonal_data in property_data.seasonal_prices:
            seasonal_price = PropertySeasonalPrice(
                property_id=new_property.id,
                **seasonal_data.model_dump()
            )

            db.add(seasonal_price)

        # -----------------------------------------
        # 4. Create property images
        # -----------------------------------------

        for image_data in property_data.images:
            property_image = PropertyImage(
                property_id=new_property.id,
                **image_data.model_dump()
            )

            db.add(property_image)

        # -----------------------------------------
        # 5. Create property amenities
        # -----------------------------------------

        for amenity_id in property_data.amenity_ids:
            property_amenity = PropertyAmenity(
                property_id=new_property.id,
                amenity_id=amenity_id
            )

            db.add(property_amenity)

        # -----------------------------------------
        # 6. Create property rules
        # -----------------------------------------

        for rule_data in property_data.rules:
            property_rule = PropertyRule(
                property_id=new_property.id,
                rule_id=rule_data.rule_id,
                allowed=rule_data.allowed,
                value=rule_data.value
            )

            db.add(property_rule)

        # -----------------------------------------
        # 7. Save everything together
        # -----------------------------------------

        db.commit()

        return get_owner_property_by_id(
            db,
            new_property.id,
            owner_id
        )

    except Exception:
        db.rollback()
        raise

def get_owner_properties(
    db: Session,
    owner_id: int
):
    return (
        db.query(Property)
        .options(
            selectinload(Property.seasonal_prices),
            selectinload(Property.images),

            selectinload(Property.property_amenities)
            .selectinload(PropertyAmenity.amenity),

            selectinload(Property.property_rules)
            .selectinload(PropertyRule.rule),
        )
        .filter(
            Property.owner_id == owner_id
        )
        .order_by(
            Property.created_at.desc()
        )
        .all()
    )

def get_owner_property_by_id(
    db: Session,
    property_id: int,
    owner_id: int
):
    property_obj = (
        db.query(Property)
        .options(
            selectinload(Property.seasonal_prices),
            selectinload(Property.images),

            selectinload(Property.property_amenities)
            .selectinload(PropertyAmenity.amenity),

            selectinload(Property.property_rules)
            .selectinload(PropertyRule.rule),
        )
        .filter(
            Property.id == property_id,
            Property.owner_id == owner_id
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
    property_data: PropertyUpdate
):
    property_obj = get_owner_property_by_id(
        db,
        property_id,
        owner_id
    )

    update_data = property_data.model_dump(
        exclude_unset=True
    )

    images = update_data.pop("images", None)
    amenity_ids = update_data.pop("amenity_ids", None)
    rules = update_data.pop("rules", None)
    seasonal_prices = update_data.pop(
        "seasonal_prices",
        None
    )

    # -----------------------------
    # Validate nested data
    # -----------------------------

    if property_data.images is not None:
        validate_property_images(
            property_data.images
        )

    if property_data.amenity_ids is not None:
        validate_amenities(
            db,
            property_data.amenity_ids
        )

    if property_data.rules is not None:
        validate_rules(
            db,
            property_data.rules
        )

    if property_data.seasonal_prices is not None:
        validate_seasonal_price_overlaps(
            property_data.seasonal_prices
        )

    # ImageKit files that may need cleanup
    removed_image_file_ids = []

    try:

        # -----------------------------
        # Update normal property fields
        # -----------------------------

        for field, value in update_data.items():
            setattr(property_obj, field, value)

        # -----------------------------
        # Replace images if provided
        # -----------------------------

        if images is not None:

            old_images = (
                db.query(PropertyImage)
                .filter(
                    PropertyImage.property_id
                    == property_obj.id
                )
                .all()
            )

            old_file_ids = {
                image.imagekit_file_id
                for image in old_images
                if image.imagekit_file_id
            }

            new_file_ids = {
                image.imagekit_file_id
                for image in (property_data.images or [])
                if image.imagekit_file_id
            }

            # Only files no longer used should be
            # removed from ImageKit
            removed_image_file_ids = list(
                old_file_ids - new_file_ids
            )

            db.query(PropertyImage).filter(
                PropertyImage.property_id
                == property_obj.id
            ).delete(
                synchronize_session=False
            )

            for image_data in (
                property_data.images or []
            ):
                db.add(
                    PropertyImage(
                        property_id=property_obj.id,
                        **image_data.model_dump()
                    )
                )

        # -----------------------------
        # Replace amenities if provided
        # -----------------------------

        if amenity_ids is not None:

            db.query(PropertyAmenity).filter(
                PropertyAmenity.property_id
                == property_obj.id
            ).delete(
                synchronize_session=False
            )

            for amenity_id in (
                property_data.amenity_ids or []
            ):
                db.add(
                    PropertyAmenity(
                        property_id=property_obj.id,
                        amenity_id=amenity_id
                    )
                )

        # -----------------------------
        # Replace rules if provided
        # -----------------------------

        if rules is not None:

            db.query(PropertyRule).filter(
                PropertyRule.property_id
                == property_obj.id
            ).delete(
                synchronize_session=False
            )

            for rule_data in (
                property_data.rules or []
            ):
                db.add(
                    PropertyRule(
                        property_id=property_obj.id,
                        rule_id=rule_data.rule_id,
                        allowed=rule_data.allowed,
                        value=rule_data.value
                    )
                )

        # -----------------------------
        # Replace seasonal prices
        # -----------------------------

        if seasonal_prices is not None:

            db.query(
                PropertySeasonalPrice
            ).filter(
                PropertySeasonalPrice.property_id
                == property_obj.id
            ).delete(
                synchronize_session=False
            )

            for seasonal_data in (
                property_data.seasonal_prices or []
            ):
                db.add(
                    PropertySeasonalPrice(
                        property_id=property_obj.id,
                        **seasonal_data.model_dump()
                    )
                )

        # Owner edited listing
        property_obj.status = "pending"
        property_obj.rejection_reason = None

        db.commit()

    except Exception:
        db.rollback()
        raise

    # -----------------------------
    # ImageKit cleanup
    # AFTER successful DB commit
    # -----------------------------

    for file_id in removed_image_file_ids:
        delete_property_image(file_id)

    # Clear cached SQLAlchemy relationships
    db.expire_all()

    return get_owner_property_by_id(
        db,
        property_obj.id,
        owner_id
    )


def delete_property(
    db: Session,
    property_id: int,
    owner_id: int
):
    property_obj = get_owner_property_by_id(
        db,
        property_id,
        owner_id
    )

    images = (
        db.query(PropertyImage)
        .filter(
            PropertyImage.property_id
            == property_obj.id
        )
        .all()
    )

    imagekit_file_ids = [
        image.imagekit_file_id
        for image in images
        if image.imagekit_file_id
    ]

    try:
        db.delete(property_obj)
        db.commit()

    except Exception:
        db.rollback()
        raise

    # Database deletion succeeded.
    # Now remove actual files from ImageKit.
    for file_id in imagekit_file_ids:
        delete_property_image(file_id)


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
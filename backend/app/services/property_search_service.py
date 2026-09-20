from datetime import date
from decimal import Decimal
from math import ceil

from sqlalchemy import asc, desc, func
from sqlalchemy.orm import Session

from app.models.property import Property
from app.models.property_amenity import PropertyAmenity
from app.models.property_blocked_date import PropertyBlockedDate
from app.services.pricing_service import calculate_stay_price


def search_properties(
    db: Session,
    location: str | None = None,
    check_in: date | None = None,
    check_out: date | None = None,
    guests: int | None = None,
    min_price: Decimal | None = None,
    max_price: Decimal | None = None,
    property_type: str | None = None,
    bedrooms: int | None = None,
    bathrooms: int | None = None,
    amenity_ids: list[int] | None = None,
    sort: str = "recommended",
    page: int = 1,
    page_size: int = 12,
):
    # ---------------------------------
    # Base query
    # Only approved properties are public
    # ---------------------------------

    query = db.query(Property).filter(
        Property.status == "approved"
    )

    # ---------------------------------
    # Destination
    # ---------------------------------

    if location:
        search_term = f"%{location.strip()}%"

        query = query.filter(
            Property.location.ilike(search_term)
        )

    # ---------------------------------
    # Guests
    # ---------------------------------

    if guests is not None:
        query = query.filter(
            Property.max_guests >= guests
        )

    # ---------------------------------
    # Property type
    # ---------------------------------

    if property_type is not None:
        query = query.filter(
            Property.property_type == property_type
        )

    # ---------------------------------
    # Bedrooms
    # ---------------------------------

    if bedrooms is not None:
        query = query.filter(
            Property.bedrooms >= bedrooms
        )

    # ---------------------------------
    # Bathrooms
    # ---------------------------------

    if bathrooms is not None:
        query = query.filter(
            Property.bathrooms >= bathrooms
        )

    # ---------------------------------
    # Amenities
    # Property must contain ALL selected
    # amenities.
    # ---------------------------------

    if amenity_ids:
        amenity_ids = list(set(amenity_ids))

        query = (
            query
            .join(
                PropertyAmenity,
                PropertyAmenity.property_id == Property.id,
            )
            .filter(
                PropertyAmenity.amenity_id.in_(amenity_ids)
            )
            .group_by(Property.id)
            .having(
                func.count(
                    func.distinct(
                        PropertyAmenity.amenity_id
                    )
                ) == len(amenity_ids)
            )
        )

    # ---------------------------------
    # Dates / blocked dates
    # ---------------------------------

    if check_in is not None and check_out is not None:

        if check_out <= check_in:
            raise ValueError(
                "Check-out date must be after check-in date"
            )

        blocked_property_ids = (
            db.query(PropertyBlockedDate.property_id)
            .filter(
                PropertyBlockedDate.start_date < check_out,
                PropertyBlockedDate.end_date > check_in,
            )
        )

        query = query.filter(
            ~Property.id.in_(blocked_property_ids)
        )

        # ---------------------------------
        # Minimum-night requirement
        # ---------------------------------

        requested_nights = (check_out - check_in).days

        query = query.filter(
            Property.min_nights <= requested_nights
        )

    # ---------------------------------
    # Base price filtering
    #
    # Only use base price when the user
    # did NOT select dates.
    #
    # When dates are selected, seasonal
    # pricing is handled after the query.
    # ---------------------------------

    if check_in is None or check_out is None:

        if min_price is not None:
            query = query.filter(
                Property.price_per_night >= min_price
            )

        if max_price is not None:
            query = query.filter(
                Property.price_per_night <= max_price
            )

    # ---------------------------------
    # Database sorting
    #
    # Without dates:
    # price sorting uses base price.
    #
    # With dates:
    # price sorting will be corrected
    # later using actual stay pricing.
    # ---------------------------------

    if sort == "price_low":

        if check_in is None or check_out is None:
            query = query.order_by(
                asc(Property.price_per_night)
            )

    elif sort == "price_high":

        if check_in is None or check_out is None:
            query = query.order_by(
                desc(Property.price_per_night)
            )

    elif sort == "newest":
        query = query.order_by(
            desc(Property.created_at)
        )

    else:
        # Temporary behavior for
        # "recommended".
        query = query.order_by(
            desc(Property.created_at)
        )

    # ---------------------------------
    # Execute database query
    # ---------------------------------

    properties = query.all()

    # ---------------------------------
    # Build search results
    #
    # If dates were selected, calculate
    # the actual price of the stay using
    # base + seasonal pricing.
    # ---------------------------------

    search_results = []

    for property in properties:

        stay_pricing = None

        if check_in is not None and check_out is not None:

            stay_pricing = calculate_stay_price(
                db=db,
                property=property,
                check_in=check_in,
                check_out=check_out,
            )

            lowest_price = stay_pricing[
                "lowest_nightly_price"
            ]

            highest_price = stay_pricing[
                "highest_nightly_price"
            ]

            # ---------------------------------
            # Date-aware minimum price
            # ---------------------------------

            if (
                min_price is not None
                and lowest_price < min_price
            ):
                continue

            # ---------------------------------
            # Date-aware maximum price
            # ---------------------------------

            if (
                max_price is not None
                and highest_price > max_price
            ):
                continue

        search_results.append(
            {
                "property": property,
                "stay_pricing": stay_pricing,
            }
        )

    # ---------------------------------
    # Date-aware price sorting
    #
    # If dates were selected, sort using
    # the actual average nightly price
    # for those dates.
    # ---------------------------------

    if check_in is not None and check_out is not None:

        if sort == "price_low":
            search_results.sort(
                key=lambda result: result[
                    "stay_pricing"
                ]["average_price_per_night"]
            )

        elif sort == "price_high":
            search_results.sort(
                key=lambda result: result[
                    "stay_pricing"
                ]["average_price_per_night"],
                reverse=True,
            )

    # ---------------------------------
    # Pagination
    #
    # Must happen AFTER seasonal price
    # filtering and date-aware sorting.
    # ---------------------------------

    total = len(search_results)

    start = (page - 1) * page_size
    end = start + page_size

    paginated_results = search_results[start:end]

    total_pages = (
        ceil(total / page_size)
        if total > 0
        else 0
    )

    # ---------------------------------
    # Build API response items
    # ---------------------------------

    items = []

    for result in paginated_results:

        property = result["property"]

        property_data = {
            column.name: getattr(
                property,
                column.name
            )
            for column in Property.__table__.columns
        }

        # Add relationships expected by
        # PropertyResponse.
        property_data["images"] = property.images
        property_data["amenities"] = property.amenities
        property_data["property_rules"] = (
            property.property_rules
        )
        property_data["seasonal_prices"] = (
            property.seasonal_prices
        )

        # Add search-specific calculated
        # pricing.
        property_data["stay_pricing"] = result[
            "stay_pricing"
        ]

        items.append(property_data)

    # ---------------------------------
    # Final response
    # ---------------------------------

    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages,
    }
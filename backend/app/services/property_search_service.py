from datetime import date
from decimal import Decimal
from math import ceil

from sqlalchemy import asc, desc, func, or_
from sqlalchemy.orm import Session

from app.core.datetime_utils import utcnow_naive
from app.models.booking import Booking
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
    beds: int | None = None,
    amenity_ids: list[int] | None = None,
    sort: str = "recommended",
    page: int = 1,
    page_size: int = 12,
):
    from math import ceil

    from sqlalchemy import asc, desc, func, or_
    from sqlalchemy.orm import selectinload

    from app.core.datetime_utils import utcnow_naive
    from app.models.booking import Booking
    from app.models.property import Property
    from app.models.property_amenity import PropertyAmenity
    from app.models.property_blocked_date import PropertyBlockedDate
    from app.services.pricing_service import calculate_stay_price

    has_dates = check_in is not None and check_out is not None

    query = db.query(Property).filter(Property.status == "approved")

    if location:
        search_term = f"%{location.strip()}%"
        query = query.filter(Property.location.ilike(search_term))

    if guests is not None:
        query = query.filter(Property.max_guests >= guests)

    if property_type is not None:
        query = query.filter(Property.property_type == property_type)

    if bedrooms is not None:
        query = query.filter(Property.bedrooms >= bedrooms)

    if bathrooms is not None:
        query = query.filter(Property.bathrooms >= bathrooms)

    if beds is not None:
        query = query.filter(Property.beds >= beds)

    if amenity_ids:
        amenity_ids = list(set(amenity_ids))

        query = (
            query.join(
                PropertyAmenity,
                PropertyAmenity.property_id == Property.id,
            )
            .filter(PropertyAmenity.amenity_id.in_(amenity_ids))
            .group_by(Property.id)
            .having(
                func.count(
                    func.distinct(PropertyAmenity.amenity_id)
                ) == len(amenity_ids)
            )
        )

    if has_dates:
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

        # Naive UTC, matching the stored Booking.expires_at convention.
        now = utcnow_naive()

        booked_property_ids = (
            db.query(Booking.property_id)
            .filter(
                or_(
                    Booking.status == "confirmed",
                    (
                        (Booking.status == "pending")
                        & (
                            Booking.expires_at.is_(None)
                            | (Booking.expires_at > now)
                        )
                    ),
                ),
                Booking.check_in < check_out,
                Booking.check_out > check_in,
            )
        )

        query = query.filter(
            ~Property.id.in_(booked_property_ids)
        )

        requested_nights = (check_out - check_in).days
        query = query.filter(
            Property.min_nights <= requested_nights
        )

    if not has_dates:
        if min_price is not None:
            query = query.filter(
                Property.price_per_night >= min_price
            )

        if max_price is not None:
            query = query.filter(
                Property.price_per_night <= max_price
            )

    if sort == "price_low":
        if not has_dates:
            query = query.order_by(
                asc(Property.price_per_night)
            )
    elif sort == "price_high":
        if not has_dates:
            query = query.order_by(
                desc(Property.price_per_night)
            )
    elif sort == "newest":
        query = query.order_by(desc(Property.created_at))
    else:
        query = query.order_by(desc(Property.created_at))

    eager_options = (
        selectinload(Property.images),
        selectinload(Property.seasonal_prices),
        selectinload(Property.property_amenities).selectinload(
            Property.property_amenities.property.mapper.class_.amenity
        ),
        selectinload(Property.property_rules).selectinload(
            Property.property_rules.property.mapper.class_.rule
        ),
    )

    if not has_dates:
        # Count the filtered query, including grouped amenity matches,
        # without loading Property objects or their relationships.
        total = query.order_by(None).count()

        start = (page - 1) * page_size
        end = start + page_size

        # Match the original Python slice, including negative indices
        # and zero/negative page sizes, without adding validation rules.
        slice_start, slice_stop, _ = slice(start, end).indices(total)

        if slice_stop > slice_start:
            properties = (
                query.options(*eager_options)
                .offset(slice_start)
                .limit(slice_stop - slice_start)
                .all()
            )
        else:
            properties = []

        paginated_results = [
            {
                "property": property,
                "stay_pricing": None,
            }
            for property in properties
        ]
    else:
        # Keep pricing evaluation across all matching properties:
        # its filters, sort keys, and possible errors must retain
        # their original behavior before pagination.
        properties = query.options(*eager_options).all()

        search_results = []

        for property in properties:
            stay_pricing = calculate_stay_price(
                db=db,
                property=property,
                check_in=check_in,
                check_out=check_out,
            )

            lowest_price = stay_pricing["lowest_nightly_price"]
            highest_price = stay_pricing["highest_nightly_price"]

            if min_price is not None and lowest_price < min_price:
                continue

            if max_price is not None and highest_price > max_price:
                continue

            search_results.append(
                {
                    "property": property,
                    "stay_pricing": stay_pricing,
                }
            )

        if sort == "price_low":
            search_results.sort(
                key=lambda result: result["stay_pricing"][
                    "average_price_per_night"
                ]
            )
        elif sort == "price_high":
            search_results.sort(
                key=lambda result: result["stay_pricing"][
                    "average_price_per_night"
                ],
                reverse=True,
            )

        total = len(search_results)

        start = (page - 1) * page_size
        end = start + page_size
        paginated_results = search_results[start:end]

    total_pages = (
        ceil(total / page_size)
        if total > 0
        else 0
    )

    items = []

    for result in paginated_results:
        property = result["property"]

        property_data = {
            column.name: getattr(property, column.name)
            for column in Property.__table__.columns
        }

        property_data["images"] = property.images
        property_data["amenities"] = property.amenities
        property_data["property_rules"] = property.property_rules
        property_data["seasonal_prices"] = property.seasonal_prices
        property_data["stay_pricing"] = result["stay_pricing"]

        items.append(property_data)

    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages,
    }
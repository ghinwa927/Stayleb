from datetime import date, timedelta
from decimal import Decimal

from sqlalchemy.orm import Session

from app.models.property import Property
from app.models.property_seasonal_price import PropertySeasonalPrice


def calculate_stay_price(
    db: Session,
    property: Property,
    check_in: date,
    check_out: date,
):
    if check_out <= check_in:
        raise ValueError(
            "Check-out date must be after check-in date"
        )

    seasonal_prices = (
        db.query(PropertySeasonalPrice)
        .filter(
            PropertySeasonalPrice.property_id == property.id,
            PropertySeasonalPrice.start_date < check_out,
            PropertySeasonalPrice.end_date >= check_in,
        )
        .all()
    )

    nightly_prices: list[Decimal] = []

    current_date = check_in

    while current_date < check_out:

        nightly_price = property.price_per_night

        for season in seasonal_prices:
            if (
                season.start_date <= current_date
                <= season.end_date
            ):
                nightly_price = season.price_per_night
                break

        nightly_prices.append(
            Decimal(nightly_price)
        )

        current_date += timedelta(days=1)

    total_price = sum(
        nightly_prices,
        Decimal("0.00")
    )

    number_of_nights = len(nightly_prices)

    average_price_per_night = (
        total_price / number_of_nights
    )

    return {
        "number_of_nights": number_of_nights,
        "nightly_prices": nightly_prices,
        "total_price": total_price,
        "average_price_per_night": average_price_per_night,
        "lowest_nightly_price": min(nightly_prices),
        "highest_nightly_price": max(nightly_prices),
    }
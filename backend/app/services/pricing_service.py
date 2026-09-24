from datetime import date, timedelta
from decimal import Decimal, ROUND_HALF_UP

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
    nightly_breakdown: list[dict] = []

    current_date = check_in

    while current_date < check_out:

        nightly_price = property.price_per_night
        pricing_source = "base"
        season_name = None

        for season in seasonal_prices:
            if (
                season.start_date <= current_date
                <= season.end_date
            ):
                nightly_price = season.price_per_night
                pricing_source = "seasonal"
                season_name = season.season_name
                break

        price_dec = Decimal(nightly_price).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        nightly_prices.append(price_dec)
        nightly_breakdown.append(
            {
                "date": current_date,
                "price": price_dec,
                "pricing_source": pricing_source,
                "season_name": season_name,
            }
        )

        current_date += timedelta(days=1)

    total_price = sum(
        nightly_prices,
        Decimal("0.00")
    )

    number_of_nights = len(nightly_prices)

    average_price_per_night = (
        total_price / number_of_nights
    ) if number_of_nights else Decimal("0.00")

    return {
        "number_of_nights": number_of_nights,
        "nightly_prices": nightly_prices,
        "nightly_breakdown": nightly_breakdown,
        "total_price": total_price,
        "average_price_per_night": average_price_per_night,
        "lowest_nightly_price": min(nightly_prices) if nightly_prices else Decimal("0.00"),
        "highest_nightly_price": max(nightly_prices) if nightly_prices else Decimal("0.00"),
    }
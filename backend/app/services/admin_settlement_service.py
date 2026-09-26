from datetime import date, datetime, timezone
from decimal import Decimal
from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy import or_
from sqlalchemy.orm import Session, joinedload

from app.models.commission_settlement import CommissionSettlement
from app.models.booking import Booking
from app.models.property import Property
from app.models.user import User


# =========================================================
# GET ADMIN SETTLEMENTS
# =========================================================

def get_admin_settlements(
    db: Session,
    settlement_status: Optional[str] = None,
    search: Optional[str] = None,
    owner_id: int | None = None,
    from_date: date | None = None,
    to_date: date | None = None,
    page: int = 1,
    page_size: int = 20,
):
    query = (
        db.query(CommissionSettlement)
        .options(
            joinedload(CommissionSettlement.owner),
            joinedload(CommissionSettlement.booking)
            .joinedload(Booking.property),
        )
    )

    # -------------------------------------------------
    # Status filter
    # -------------------------------------------------

    if settlement_status:
        if settlement_status not in {"unpaid", "paid"}:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Settlement status must be 'unpaid' or 'paid'",
            )

        query = query.filter(
            CommissionSettlement.status == settlement_status
        )

    # -------------------------------------------------
    # Owner filter
    # -------------------------------------------------

    if owner_id is not None:
        query = query.filter(
            CommissionSettlement.owner_id == owner_id
        )

    # -------------------------------------------------
    # Date filters
    # -------------------------------------------------

    if from_date is not None:
        query = query.filter(
            CommissionSettlement.created_at
            >= datetime.combine(
                from_date,
                datetime.min.time(),
            )
        )

    if to_date is not None:
        query = query.filter(
            CommissionSettlement.created_at
            <= datetime.combine(
                to_date,
                datetime.max.time(),
            )
        )

    # -------------------------------------------------
    # Search
    # -------------------------------------------------

    if search:
        search_value = search.strip()

        if search_value:
            query = (
                query
                .join(
                    User,
                    User.id == CommissionSettlement.owner_id,
                )
                .join(
                    Booking,
                    Booking.id
                    == CommissionSettlement.booking_id,
                )
                .join(
                    Property,
                    Property.id == Booking.property_id,
                )
            )

            conditions = [
                User.full_name.ilike(
                    f"%{search_value}%"
                ),
                User.email.ilike(
                    f"%{search_value}%"
                ),
                Property.title.ilike(
                    f"%{search_value}%"
                ),
                Property.location.ilike(
                    f"%{search_value}%"
                ),
            ]

            # Allow search by settlement ID or booking ID
            if search_value.isdigit():
                numeric_value = int(search_value)

                conditions.extend([
                    CommissionSettlement.id
                    == numeric_value,

                    CommissionSettlement.booking_id
                    == numeric_value,
                ])

            query = query.filter(
                or_(*conditions)
            )

    # -------------------------------------------------
    # Pagination
    # -------------------------------------------------

    page = max(page, 1)
    page_size = max(
        1,
        min(page_size, 100),
    )

    total = query.count()

    total_pages = (
        (total + page_size - 1) // page_size
        if total > 0
        else 0
    )

    offset = (page - 1) * page_size

    settlements = (
        query
        .order_by(
            CommissionSettlement.created_at.desc()
        )
        .offset(offset)
        .limit(page_size)
        .all()
    )

    # -------------------------------------------------
    # Build response
    # -------------------------------------------------

    items = []

    for settlement in settlements:
        items.append({
            "id": settlement.id,
            "booking_id": settlement.booking_id,
            "owner_id": settlement.owner_id,
            "commission_amount":
                settlement.commission_amount,
            "status": settlement.status,
            "paid_at": settlement.paid_at,
            "created_at": settlement.created_at,
            "updated_at": settlement.updated_at,

            "owner": settlement.owner,

            "property":
                settlement.booking.property,
        })

    return {
        "items": items,
        "page": page,
        "page_size": page_size,
        "total": total,
        "total_pages": total_pages,
    }


# =========================================================
# GET SETTLEMENT STATS
# =========================================================

def get_admin_settlement_stats(
    db: Session,
    owner_id: int | None = None,
):
    zero = Decimal("0.00")

    # -------------------------------------------------
    # Base query
    # -------------------------------------------------

    query = db.query(
        CommissionSettlement
    )

    # -------------------------------------------------
    # Optional Owner filter
    # -------------------------------------------------

    if owner_id is not None:
        query = query.filter(
            CommissionSettlement.owner_id == owner_id
        )

    settlements = query.all()

    # -------------------------------------------------
    # Counters / totals
    # -------------------------------------------------

    total_settlements = len(settlements)

    unpaid_count = 0
    paid_count = 0

    outstanding_commission = zero
    settled_commission = zero

    # -------------------------------------------------
    # Calculate stats
    # -------------------------------------------------

    for settlement in settlements:
        amount = Decimal(
            settlement.commission_amount or zero
        )

        if settlement.status == "unpaid":
            unpaid_count += 1
            outstanding_commission += amount

        elif settlement.status == "paid":
            paid_count += 1
            settled_commission += amount

    # -------------------------------------------------
    # Response
    # -------------------------------------------------

    return {
        "total_settlements":
            total_settlements,

        "unpaid_count":
            unpaid_count,

        "paid_count":
            paid_count,

        "outstanding_commission":
            outstanding_commission,

        "settled_commission":
            settled_commission,
    }


# =========================================================
# MARK SETTLEMENT AS PAID
# =========================================================

def settle_commission(
    db: Session,
    settlement_id: int,
):
    settlement = (
        db.query(CommissionSettlement)
        .options(
            joinedload(
                CommissionSettlement.owner
            ),
            joinedload(
                CommissionSettlement.booking
            ).joinedload(
                Booking.property
            ),
        )
        .filter(
            CommissionSettlement.id
            == settlement_id
        )
        .first()
    )

    if not settlement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Commission settlement not found",
        )

    # -------------------------------------------------
    # Already settled
    # -------------------------------------------------

    if settlement.status == "paid":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Commission settlement is already paid",
        )

    # -------------------------------------------------
    # Mark as paid
    # -------------------------------------------------

    settlement.status = "paid"

    settlement.paid_at = (
        datetime.now(timezone.utc)
        .replace(tzinfo=None)
    )

    db.commit()
    db.refresh(settlement)

    return {
        "id": settlement.id,
        "booking_id": settlement.booking_id,
        "owner_id": settlement.owner_id,
        "commission_amount":
            settlement.commission_amount,
        "status": settlement.status,
        "paid_at": settlement.paid_at,
        "created_at": settlement.created_at,
        "updated_at": settlement.updated_at,

        "owner": settlement.owner,

        "property":
            settlement.booking.property,
    }
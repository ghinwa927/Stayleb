from typing import Optional
from datetime import date
from fastapi import APIRouter, Depends, Query,HTTPException
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.dependencies import require_admin
from app.models.user import User

from app.schemas.admin_settlement import (
    AdminSettlementListResponse,
    AdminSettlementResponse,
    AdminSettlementStatsResponse,
)

from app.services.admin_settlement_service import (
    get_admin_settlements,
    get_admin_settlement_stats,
    settle_commission,
)


router = APIRouter(
    prefix="/admin/settlements",
    tags=["Admin Settlements"],
)


# =========================================================
# SETTLEMENT STATS
# =========================================================

@router.get(
    "/stats",
    response_model=AdminSettlementStatsResponse,
)
def admin_settlement_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    return get_admin_settlement_stats(
        db=db,
    )


# =========================================================
# SETTLEMENT LIST
# =========================================================

@router.get(
    "",
    response_model=AdminSettlementListResponse,
)
def list_admin_settlements(
    settlement_status: Optional[str] = Query(
        default=None,
        alias="status",
        pattern="^(unpaid|paid)$",
    ),
    search: Optional[str] = Query(
        default=None,
    ),
    owner_id: Optional[int] = Query(
        default=None,
        ge=1,
    ),
    from_date: Optional[date] = Query(
        default=None,
    ),
    to_date: Optional[date] = Query(
        default=None,
    ),
    page: int = Query(
        default=1,
        ge=1,
    ),
    page_size: int = Query(
        default=20,
        ge=1,
        le=100,
    ),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    # -------------------------------------------------
    # Validate date range
    # -------------------------------------------------

    if (
        from_date is not None
        and to_date is not None
        and from_date > to_date
    ):
        raise HTTPException(
            status_code=400,
            detail="from_date cannot be after to_date",
        )

    # -------------------------------------------------
    # Get settlements
    # -------------------------------------------------

    return get_admin_settlements(
        db=db,
        settlement_status=settlement_status,
        search=search,
        owner_id=owner_id,
        from_date=from_date,
        to_date=to_date,
        page=page,
        page_size=page_size,
    )


# =========================================================
# MARK SETTLEMENT PAID
# =========================================================

@router.patch(
    "/{settlement_id}/settle",
    response_model=AdminSettlementResponse,
)
def mark_settlement_paid(
    settlement_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    return settle_commission(
        db=db,
        settlement_id=settlement_id,
    )
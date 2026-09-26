from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.dependencies import require_owner
from app.models.user import User
from app.schemas.owner_settlement import (
    OwnerSettlementListResponse,
    OwnerSettlementStatsResponse,
)
from app.services.owner_settlement_service import (
    get_owner_settlements,
    get_owner_settlement_stats,
)


router = APIRouter(
    prefix="/owner/settlements",
    tags=["Owner Settlements"],
)


# =========================================================
# GET OWNER SETTLEMENT STATS
# =========================================================

@router.get(
    "/stats",
    response_model=OwnerSettlementStatsResponse,
)
def owner_settlement_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_owner),
):
    return get_owner_settlement_stats(
        db=db,
        owner_id=current_user.id,
    )


# =========================================================
# GET OWNER SETTLEMENTS
# =========================================================

@router.get(
    "",
    response_model=OwnerSettlementListResponse,
)
def list_owner_settlements(
    settlement_status: Optional[str] = Query(
        default=None,
        alias="status",
    ),
    search: Optional[str] = Query(
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
    current_user: User = Depends(require_owner),
):
    return get_owner_settlements(
        db=db,
        owner_id=current_user.id,
        settlement_status=settlement_status,
        search=search,
        page=page,
        page_size=page_size,
    )
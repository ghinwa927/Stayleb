from typing import Optional

from sqlalchemy.orm import Session

from app.services.admin_settlement_service import (
    get_admin_settlements,
    get_admin_settlement_stats,
)


# =========================================================
# GET OWNER SETTLEMENTS
# =========================================================

def get_owner_settlements(
    db: Session,
    owner_id: int,
    settlement_status: Optional[str] = None,
    search: Optional[str] = None,
    page: int = 1,
    page_size: int = 20,
):
    """
    Return commission settlements belonging only to
    the authenticated Owner.
    """

    return get_admin_settlements(
        db=db,
        settlement_status=settlement_status,
        search=search,
        owner_id=owner_id,
        page=page,
        page_size=page_size,
    )


# =========================================================
# GET OWNER SETTLEMENT STATS
# =========================================================

def get_owner_settlement_stats(
    db: Session,
    owner_id: int,
):
    """
    Return settlement statistics belonging only to
    the authenticated Owner.
    """

    return get_admin_settlement_stats(
        db=db,
        owner_id=owner_id,
    )
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.dependencies import require_owner
from app.models.user import User
from app.schemas.owner_dashboard import OwnerDashboardStatsResponse
from app.services.owner_dashboard_service import get_owner_dashboard_stats

router = APIRouter(
    prefix="/owner",
    tags=["Owner Dashboard"],
)


@router.get(
    "/dashboard/stats",
    response_model=OwnerDashboardStatsResponse,
)
def owner_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_owner),
):
    return get_owner_dashboard_stats(db=db, current_user=current_user)

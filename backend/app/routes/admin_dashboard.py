from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.dependencies import require_admin
from app.models.user import User

from app.schemas.admin_dashboard import AdminDashboardStatsResponse
from app.services.admin_dashboard_service import get_admin_dashboard_stats


router = APIRouter(
    prefix="/admin/dashboard",
    tags=["Admin Dashboard"],
)


@router.get(
    "/stats",
    response_model=AdminDashboardStatsResponse,
)
def admin_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    return get_admin_dashboard_stats(db=db)
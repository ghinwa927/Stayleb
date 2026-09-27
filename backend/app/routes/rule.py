from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.user import User
from app.schemas.rule import RuleResponse
from app.services.rule_service import get_active_rules
from app.dependencies import require_owner


router = APIRouter(
    prefix="/rules",
    tags=["Rules"]
)


@router.get(
    "/public",
    response_model=list[RuleResponse]
)
def get_public_rules_route(
    db: Session = Depends(get_db),
):
    return get_active_rules(db)


@router.get(
    "",
    response_model=list[RuleResponse]
)
def get_rules_route(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_owner)
):
    return get_active_rules(db)
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.user import User
from app.schemas.rule import (
    RuleCreate,
    RuleUpdate,
    RuleResponse,
)
from app.services.admin_rule_service import (
    get_all_rules,
    create_rule,
    update_rule,
    deactivate_rule,
)
from app.dependencies import require_admin


router = APIRouter(
    prefix="/admin/rules",
    tags=["Admin - Rules"],
)


@router.get("", response_model=list[RuleResponse])
def admin_get_rules(
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin),
):
    return get_all_rules(db)


@router.post(
    "",
    response_model=RuleResponse,
    status_code=status.HTTP_201_CREATED,
)
def admin_create_rule(
    data: RuleCreate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin),
):
    try:
        return create_rule(
    db=db,
    name=data.name,
    description=data.description,
    category=data.category,
)

    except ValueError as e:
        raise HTTPException(
            status_code=409,
            detail=str(e),
        )


@router.patch(
    "/{rule_id}",
    response_model=RuleResponse,
)
def admin_update_rule(
    rule_id: int,
    data: RuleUpdate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin),
):
    try:
        update_data = data.model_dump(exclude_unset=True)

        return update_rule(
            db=db,
            rule_id=rule_id,
            **update_data,
        )

    except ValueError as e:
        message = str(e)

        if message == "Rule not found":
            raise HTTPException(
                status_code=404,
                detail=message,
            )

        raise HTTPException(
            status_code=409,
            detail=message,
        )


@router.delete(
    "/{rule_id}",
    response_model=RuleResponse,
)
def admin_deactivate_rule(
    rule_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin),
):
    try:
        return deactivate_rule(
            db=db,
            rule_id=rule_id,
        )

    except ValueError as e:
        raise HTTPException(
            status_code=404,
            detail=str(e),
        )
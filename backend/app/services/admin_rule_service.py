from sqlalchemy.orm import Session

from app.models.rule import Rule, RuleCategory


def get_all_rules(db: Session):
    return (
        db.query(Rule)
        .order_by(Rule.name.asc())
        .all()
    )


def get_rule_by_id(
    db: Session,
    rule_id: int,
):
    rule = (
        db.query(Rule)
        .filter(Rule.id == rule_id)
        .first()
    )

    if not rule:
        raise ValueError("Rule not found")

    return rule


def create_rule(
    db: Session,
    name: str,
    description: str | None,
    category: RuleCategory,
):
    name = name.strip()

    existing_rule = (
        db.query(Rule)
        .filter(Rule.name == name)
        .first()
    )

    if existing_rule:
        raise ValueError("Rule name already exists")

    rule = Rule(
        name=name,
        description=description,
        category=category,
        is_active=True,
    )

    db.add(rule)
    db.commit()
    db.refresh(rule)

    return rule


def update_rule(
    db: Session,
    rule_id: int,
    name: str | None = None,
    description: str | None = None,
    category: RuleCategory | None = None,
    is_active: bool | None = None,
):
    rule = get_rule_by_id(
        db=db,
        rule_id=rule_id,
    )

    # Update name
    if name is not None:
        name = name.strip()

        existing_rule = (
            db.query(Rule)
            .filter(
                Rule.name == name,
                Rule.id != rule_id,
            )
            .first()
        )

        if existing_rule:
            raise ValueError("Rule name already exists")

        rule.name = name

    # Update description
    if description is not None:
        rule.description = description

    # Update category
    if category is not None:
        rule.category = category

    # Activate / deactivate
    if is_active is not None:
        rule.is_active = is_active

    db.commit()
    db.refresh(rule)

    return rule


def deactivate_rule(
    db: Session,
    rule_id: int,
):
    rule = get_rule_by_id(
        db=db,
        rule_id=rule_id,
    )

    rule.is_active = False

    db.commit()
    db.refresh(rule)

    return rule
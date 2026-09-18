from sqlalchemy.orm import Session

from app.models.user import User


def get_all_users(
    db: Session,
    role: str | None = None,
    is_active: bool | None = None,
):
    query = db.query(User)

    if role is not None:
        query = query.filter(User.role == role)

    if is_active is not None:
        query = query.filter(User.is_active == is_active)

    return query.order_by(User.created_at.desc()).all()


def get_user_by_id(
    db: Session,
    user_id: int,
):
    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if not user:
        raise ValueError("User not found")

    return user


def block_user(
    db: Session,
    user_id: int,
    current_admin_id: int,
):
    user = get_user_by_id(db, user_id)

    if user.id == current_admin_id:
        raise ValueError("You cannot block your own account")

    user.is_active = False

    db.commit()
    db.refresh(user)

    return user


def unblock_user(
    db: Session,
    user_id: int,
):
    user = get_user_by_id(db, user_id)

    user.is_active = True

    db.commit()
    db.refresh(user)

    return user
from datetime import date, datetime, time, timedelta

from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.models.user import User


# =========================================================
# GET ADMIN USERS
# =========================================================

def get_admin_users(
    db: Session,
    role: str | None = None,
    is_active: bool | None = None,
    search: str | None = None,
    sort: str = "newest",
    created_from: date | None = None,
    created_to: date | None = None,
    page: int = 1,
    page_size: int = 20,
):
    query = db.query(User)

    # =====================================================
    # ROLE FILTER
    # =====================================================

    if role is not None:
        query = query.filter(
            User.role == role
        )

    # =====================================================
    # ACTIVE / INACTIVE FILTER
    # =====================================================

    if is_active is not None:
        query = query.filter(
            User.is_active == is_active
        )

    # =====================================================
    # SEARCH
    # =====================================================

    if search:
        search_value = search.strip()

        if search_value:
            pattern = f"%{search_value}%"

            query = query.filter(
                or_(
                    User.full_name.ilike(pattern),
                    User.email.ilike(pattern),
                    User.phone.ilike(pattern),
                )
            )

    # =====================================================
    # CREATED DATE FILTER
    # =====================================================

    if created_from is not None:
        from_datetime = datetime.combine(
            created_from,
            time.min,
        )

        query = query.filter(
            User.created_at >= from_datetime
        )

    if created_to is not None:
        # Exclusive next-day boundary.
        # Example:
        # created_to = 2026-09-24
        # means created_at < 2026-09-25 00:00:00
        to_datetime = datetime.combine(
            created_to + timedelta(days=1),
            time.min,
        )

        query = query.filter(
            User.created_at < to_datetime
        )

    # =====================================================
    # TOTAL BEFORE PAGINATION
    # =====================================================

    total = query.count()

    # =====================================================
    # SORTING
    # =====================================================

    if sort == "oldest":
        query = query.order_by(
            User.created_at.asc()
        )

    elif sort == "name_asc":
        query = query.order_by(
            User.full_name.asc()
        )

    elif sort == "name_desc":
        query = query.order_by(
            User.full_name.desc()
        )

    else:
        # Default: newest
        query = query.order_by(
            User.created_at.desc()
        )

    # =====================================================
    # PAGINATION
    # =====================================================

    page = max(page, 1)

    page_size = max(
        1,
        min(page_size, 100),
    )

    total_pages = (
        (total + page_size - 1) // page_size
        if total > 0
        else 0
    )

    users = (
        query
        .offset(
            (page - 1) * page_size
        )
        .limit(page_size)
        .all()
    )

    return {
        "items": users,
        "page": page,
        "page_size": page_size,
        "total": total,
        "total_pages": total_pages,
    }


# =========================================================
# GET USER BY ID
# =========================================================

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


# =========================================================
# BLOCK USER
# =========================================================

def block_user(
    db: Session,
    user_id: int,
    current_admin_id: int,
):
    user = get_user_by_id(
        db,
        user_id,
    )

    if user.id == current_admin_id:
        raise ValueError(
            "You cannot block your own account"
        )

    user.is_active = False

    db.commit()
    db.refresh(user)

    return user


# =========================================================
# UNBLOCK USER
# =========================================================

def unblock_user(
    db: Session,
    user_id: int,
):
    user = get_user_by_id(
        db,
        user_id,
    )

    user.is_active = True

    db.commit()
    db.refresh(user)

    return user
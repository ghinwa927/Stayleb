import os
import sys

from app.database.database import SessionLocal
from app.models.user import User, UserRole
from app.core.security import hash_password
from app.core.password_validation import validate_password


def create_admin():
    # Credentials come ONLY from the environment — never hardcode them.
    # Example (PowerShell):
    #   $env:ADMIN_EMAIL="admin@example.com"; $env:ADMIN_PASSWORD="<strong unique password>"
    #   python create_admin.py
    email = os.getenv("ADMIN_EMAIL", "admin@stayleb.com")
    password = os.getenv("ADMIN_PASSWORD")

    if not password:
        print(
            "ERROR: set ADMIN_PASSWORD in the environment before running "
            "this script. Refusing to create an admin with a default password.",
            file=sys.stderr,
        )
        raise SystemExit(1)

    validate_password(password)

    db = SessionLocal()

    try:
        existing_admin = (
            db.query(User)
            .filter(User.email == email)
            .first()
        )

        if existing_admin:
            print("Admin already exists")
            return

        admin = User(
            full_name="StayLeb Admin",
            email=email,
            password_hash=hash_password(password),
            phone=None,
            role=UserRole.ADMIN,
            is_active=True,
        )

        db.add(admin)
        db.commit()
        db.refresh(admin)

        print("Admin created successfully")
        print("Admin ID:", admin.id)
        print("Email:", admin.email)

    finally:
        db.close()


if __name__ == "__main__":
    create_admin()
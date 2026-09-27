from app.database.database import SessionLocal
from app.models.user import User, UserRole
from app.core.security import hash_password


def create_admin():
    db = SessionLocal()

    try:
        email = "admin@stayleb.com"

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
            password_hash=hash_password("Admin123!"),
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
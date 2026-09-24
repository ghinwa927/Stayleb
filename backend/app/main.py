from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.database.database import engine
from app.routes.auth import router as auth_router
from app.routes.property import router as property_router
from app.routes.users import router as users_router
from app.database.database import Base, engine
import app.models

from app.routes.amenity import router as amenity_router
from app.routes.rule import router as rule_router

from app.routes.property_blocked_date import (
    router as property_blocked_date_router
)

from app.routes.image import router as image_router
from app.routes.admin_property import router as admin_property_router
from app.routes.admin_user import router as admin_user_router
from app.routes.admin_amenity import router as admin_amenity_router
from app.routes.admin_rule import router as admin_rule_router
from app.routes.admin_setting import router as admin_setting_router
from app.routes.bookings import router as booking_router
from app.routes.payments import router as payment_router
from app.routes.admin_bookings import router as admin_bookings
from app.routes.admin_settlements import router as admin_settlements
from app.routes.reviews import router as reviews_router
from app.routes.admin_reviews import router as admin_reviews
from app.routes.admin_dashboard import router as admin_dashboard_router

Base.metadata.create_all(bind=engine)

# Attempt to migrate ENUM columns to VARCHAR for booking/payment flexibility.
# This is safe to run on both MySQL and SQLite: ignore failures on fresh DB.
try:
    from sqlalchemy import text as _text
    with engine.begin() as conn:
        # MySQL: modify columns if they still use ENUM type
        try:
            conn.execute(_text("ALTER TABLE bookings MODIFY status VARCHAR(20) NOT NULL DEFAULT 'pending'"))
        except Exception:
            pass
        try:
            conn.execute(_text("ALTER TABLE payments MODIFY payment_method VARCHAR(20) NOT NULL"))
        except Exception:
            pass
        try:
            conn.execute(_text("ALTER TABLE payments MODIFY payment_status VARCHAR(20) NOT NULL DEFAULT 'pending'"))
        except Exception:
            pass
except Exception:
    pass

app = FastAPI(
    title="StayLeb API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(users_router)
app.include_router(property_router)
app.include_router(amenity_router)
app.include_router(rule_router)
app.include_router(property_blocked_date_router)
app.include_router(image_router)
app.include_router(admin_property_router)
app.include_router(admin_user_router)
app.include_router(admin_amenity_router)
app.include_router(admin_rule_router)
app.include_router(admin_setting_router)
app.include_router(booking_router)
app.include_router(payment_router)
app.include_router(admin_bookings)
app.include_router(admin_settlements)
app.include_router(reviews_router)
app.include_router(admin_reviews)
app.include_router(admin_dashboard_router)

@app.get("/")
def root():
    return {
        "message": "StayLeb API is running"
    }


@app.get("/health")
def health_check():
    return {
        "status": "ok"
    }


@app.get("/db-test")
def database_test():
    with engine.connect() as connection:
        result = connection.execute(text("SELECT 1"))
        value = result.scalar()

    return {
        "database": "connected",
        "result": value
    }
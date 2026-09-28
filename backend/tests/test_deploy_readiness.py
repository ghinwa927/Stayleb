"""Deployment-readiness regression tests (isolated, no production data).

Run from backend/:  python -m unittest discover -s tests -v

- Never touches production: all database work uses an in-memory SQLite
  database created per test; no network, no Stripe calls, no real email.
- Covers fixes from the Vercel/Render deployment audit:
  1. payments route annotations resolve (missing ``User`` import).
  2. cash mark-paid is idempotent when a settlement already exists.
  3. Alembic chain head + rate-limit table wiring.
  4. Production config fail-fast (bad ENVIRONMENT / placeholder SECRET_KEY).
  5. Rate limiter fails open when its table is missing.
"""

import os
import re
import typing
import unittest
from datetime import date
from decimal import Decimal
from types import SimpleNamespace

# Dummy env BEFORE app imports (database.py requires DATABASE_URL at import;
# config requires SECRET_KEY + provider keys). Real backend/.env, if present,
# is never written to by these tests.
os.environ.setdefault("DATABASE_URL", "sqlite://")
os.environ.setdefault("SECRET_KEY", "test-only-secret-0123456789abcdef")
os.environ.setdefault("GEMINI_API_KEY", "test-dummy")
os.environ.setdefault("IMAGEKIT_PRIVATE_KEY", "test-dummy")
os.environ.setdefault("IMAGEKIT_URL_ENDPOINT", "https://example.com")
os.environ.setdefault("ENVIRONMENT", "development")

from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from sqlalchemy.pool import StaticPool

import app.models  # noqa: F401  (register all mappers on Base.metadata)
from app.database.database import Base


def make_memory_session() -> Session:
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(engine)
    return Session(engine)


class PaymentsRouteAnnotationsTest(unittest.TestCase):
    """Regression: backend/app/routes/payments.py must import User.

    Previously ``mark_cash_booking_payment_paid`` annotated
    ``current_user: User`` without importing it, so
    ``typing.get_type_hints`` (used by FastAPI/docs tooling) raised
    ``NameError: name 'User' is not defined``.
    """

    def test_mark_paid_hints_resolve(self):
        from app.routes import payments

        hints = typing.get_type_hints(payments.mark_cash_booking_payment_paid)
        self.assertIn("current_user", hints)
        self.assertEqual(hints["current_user"].__name__, "User")


class SettlementIdempotencyTest(unittest.TestCase):
    """Regression: mark-paid with a pre-existing settlement must succeed.

    Previously ``db.add(settlement)`` ran even when the settlement was
    already present (undefined local), raising NameError -> HTTP 500 on
    a money path. Now exactly one settlement row must exist afterwards.
    """

    def _fixture(self, db: Session):
        from app.models.user import User, UserRole
        from app.models.property import Property
        from app.models.booking import Booking
        from app.models.payment import Payment
        from app.models.commission_settlement import CommissionSettlement

        owner = User(
            full_name="Owner",
            email="owner@example.com",
            password_hash="x",
            role=UserRole.OWNER,
            is_active=True,
        )
        client = User(
            full_name="Client",
            email="client@example.com",
            password_hash="x",
            role=UserRole.CLIENT,
            is_active=True,
        )
        db.add_all([owner, client])
        db.flush()

        prop = Property(
            owner_id=owner.id,
            title="Chalet",
            description="desc",
            property_type="chalet",
            location="Faraya",
            price_per_night=Decimal("100.00"),
            bedrooms=2,
            beds=2,
            bathrooms=1,
            max_guests=4,
            min_nights=1,
            status="approved",
        )
        db.add(prop)
        db.flush()

        booking = Booking(
            client_id=client.id,
            property_id=prop.id,
            check_in=date(2030, 6, 1),
            check_out=date(2030, 6, 3),
            guests=2,
            price_per_night=Decimal("100.00"),
            number_of_nights=2,
            total_price=Decimal("200.00"),
            status="confirmed",
            commission_percentage=Decimal("10.00"),
            commission_amount=Decimal("20.00"),
            owner_earnings=Decimal("180.00"),
        )
        db.add(booking)
        db.flush()

        payment = Payment(
            booking_id=booking.id,
            amount=Decimal("200.00"),
            payment_method="cash",
            payment_status="pending",
        )
        db.add(payment)
        # Pre-existing settlement (e.g. created by a retried/concurrent flow).
        db.add(
            CommissionSettlement(
                booking_id=booking.id,
                owner_id=owner.id,
                commission_amount=Decimal("20.00"),
                status="unpaid",
            )
        )
        db.commit()
        return owner, booking

    def test_mark_paid_with_existing_settlement(self):
        from app.models.commission_settlement import CommissionSettlement
        from app.models.payment import Payment
        from app.services.payment_service import mark_cash_payment_paid

        db = make_memory_session()
        try:
            owner, booking = self._fixture(db)
            result = mark_cash_payment_paid(
                db, booking.id, SimpleNamespace(id=owner.id)
            )
            self.assertEqual(result.payment_status, "paid")
            count = (
                db.query(CommissionSettlement)
                .filter(CommissionSettlement.booking_id == booking.id)
                .count()
            )
            self.assertEqual(count, 1)
            db.refresh(result)
            payment = (
                db.query(Payment)
                .filter(Payment.booking_id == booking.id)
                .one()
            )
            self.assertEqual(payment.payment_status, "paid")
            self.assertIsNotNone(payment.paid_at)
        finally:
            db.close()


class MigrationChainTest(unittest.TestCase):
    """The deploy docs promise chain base -> 8372f2bcb026 -> 9f4c2a7e1b63."""

    def _revisions(self):
        versions = os.path.join(
            os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
            "alembic",
            "versions",
        )
        revs = {}
        for name in os.listdir(versions):
            if not name.endswith(".py"):
                continue
            text = open(os.path.join(versions, name), encoding="utf-8").read()
            rev = re.search(r"^revision:\s*str\s*=\s*['\"]([^'\"]+)['\"]",
                            text, re.M).group(1)
            down = re.search(r"^down_revision[^=]*=\s*(.+)$", text, re.M).group(1)
            revs[rev] = down.strip()
        return revs

    def test_chain_and_head(self):
        revs = self._revisions()
        self.assertIn("8372f2bcb026", revs)
        self.assertIn("9f4c2a7e1b63", revs)
        # Baseline has no parent; rate-limit revision builds on it.
        self.assertIn("None", revs["8372f2bcb026"])
        self.assertIn("8372f2bcb026", revs["9f4c2a7e1b63"])
        # Nothing builds on top of the head (single head).
        children = [r for r, d in revs.items()
                    if "9f4c2a7e1b63" in d]
        self.assertEqual(children, [])

    def test_rate_limit_model_matches_migration(self):
        from app.models.rate_limit import RateLimitCounter

        self.assertEqual(RateLimitCounter.__tablename__,
                         "rate_limit_counters")


class ProductionConfigTest(unittest.TestCase):
    """Invalid ENVIRONMENT / placeholder SECRET_KEY must fail fast."""

    def _settings_kwargs(self):
        return dict(
            SECRET_KEY="test-only-secret-0123456789abcdef",
            gemini_api_key="test-dummy",
            imagekit_private_key="test-dummy",
            imagekit_url_endpoint="https://example.com",
        )

    def test_bad_environment_rejected(self):
        from pydantic import ValidationError

        from app.config import Settings

        with self.assertRaises(ValidationError):
            Settings(environment="staging", **self._settings_kwargs())

    def test_placeholder_secret_rejected(self):
        from pydantic import ValidationError

        from app.config import Settings

        kwargs = self._settings_kwargs()
        kwargs["SECRET_KEY"] = "change-me"
        with self.assertRaises(ValidationError):
            Settings(**kwargs)

    def test_production_cookie_flags(self):
        from app.config import Settings

        settings = Settings(environment="production",
                            **self._settings_kwargs())
        self.assertTrue(settings.refresh_cookie_secure)
        self.assertEqual(settings.refresh_cookie_samesite, "none")
        self.assertFalse(settings.sql_echo)

    def test_cors_never_wildcard(self):
        from app.config import parse_cors_origins

        self.assertEqual(parse_cors_origins("*"), [])
        self.assertEqual(
            parse_cors_origins("https://stayleb.vercel.app/, https://a.example"),
            ["https://stayleb.vercel.app", "https://a.example"],
        )


class RateLimiterFailOpenTest(unittest.TestCase):
    """Without its table the limiter must allow traffic (and never 429)."""

    def test_missing_table_fails_open(self):
        from app.core.rate_limit import check_rate_limit

        engine = create_engine(
            "sqlite://",
            connect_args={"check_same_thread": False},
            poolclass=StaticPool,
        )
        # Intentionally NO create_all: rate_limit_counters is missing.
        with Session(engine) as db:
            # limit=0 would always 429 if the table existed.
            check_rate_limit(db, key="rl:test:ip:9.9.9.9", limit=0,
                             window_seconds=600)


if __name__ == "__main__":
    unittest.main()

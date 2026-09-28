"""Database-backed fixed-window rate limiting.

The counters live in the ``rate_limit_counters`` table, so limits are
shared across every backend instance behind the load balancer. An
in-memory limiter would NOT be safe on multi-instance production
(Render can run several instances), which is why this module exists.

Behavior:
- One atomic UPSERT per check (no check-then-act race).
- Stale rows are deleted opportunistically (older than 24h; all
  configured windows are far shorter).
- If the limiter itself hits a database error, the request is allowed
  through (fail-open) and the error is logged, so rate limiting can
  never become a denial-of-service vector of its own.
- Violations return HTTP 429 with a Retry-After header; the frontend
  surfaces the message with no changes required.
"""
import logging
from datetime import datetime, timedelta

from fastapi import Depends, HTTPException, Request, status
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.config import settings
from app.core.datetime_utils import utcnow_naive
from app.database.database import get_db

logger = logging.getLogger(__name__)

_EPOCH = datetime(1970, 1, 1)

# Atomic increment-or-reset. Works on PostgreSQL and SQLite, so the
# same code path is exercised in tests and production.
_UPSERT_SQL = """
INSERT INTO rate_limit_counters AS rlc (key, window_start, count)
VALUES (:key, :window_start, 1)
ON CONFLICT (key) DO UPDATE SET
  window_start = CASE
    WHEN rlc.window_start < :window_start THEN excluded.window_start
    ELSE rlc.window_start
  END,
  count = CASE
    WHEN rlc.window_start < :window_start THEN 1
    ELSE rlc.count + 1
  END
RETURNING count
"""

_CLEANUP_SQL = """
DELETE FROM rate_limit_counters
WHERE window_start < :cutoff
"""

_MAX_KEY_PART = 100


def _floor_window(now: datetime, window_seconds: int) -> datetime:
    elapsed = int((now - _EPOCH).total_seconds())
    return _EPOCH + timedelta(seconds=(elapsed // window_seconds) * window_seconds)


def client_ip(request: Request) -> str:
    """Best-effort client IP using only trusted proxy hops.

    With N trusted hops (Render: 1), the client address is the Nth entry
    from the right of X-Forwarded-For; attacker-spoofed entries to its
    left can never be selected. Falls back to the direct peer address.
    """
    hops = max(1, settings.trusted_proxy_hops)
    forwarded = request.headers.get("x-forwarded-for", "")
    parts = [p.strip() for p in forwarded.split(",") if p.strip()]
    if len(parts) >= hops:
        return parts[len(parts) - hops][: _MAX_KEY_PART]
    if request.client:
        return request.client.host[: _MAX_KEY_PART]
    return "unknown"


def check_rate_limit(
    db: Session,
    *,
    key: str,
    limit: int,
    window_seconds: int,
) -> None:
    """Raise 429 if ``key`` exceeded ``limit`` hits in the window."""
    now = utcnow_naive()
    window_start = _floor_window(now, window_seconds)
    try:
        count = db.execute(
            text(_UPSERT_SQL),
            {"key": key[:255], "window_start": window_start},
        ).scalar()
        # Opportunistic cleanup of long-expired rows (best effort).
        try:
            db.execute(
                text(_CLEANUP_SQL),
                {"cutoff": now - timedelta(hours=24)},
            )
        except SQLAlchemyError:
            pass
        db.commit()
    except SQLAlchemyError as exc:
        db.rollback()
        logger.warning("Rate limiter unavailable, failing open: %s", exc)
        return
    if count is not None and count > limit:
        retry_after = (
            int((window_start + timedelta(seconds=window_seconds) - now).total_seconds()) + 1
        )
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=(
                "Too many attempts. "
                f"Please try again in {max(retry_after, 1)} seconds."
            ),
            headers={"Retry-After": str(max(retry_after, 1))},
        )


def rate_limit(
    limit: int,
    window_seconds: int,
    scope: str,
    email_field: str | None = None,
    email_limit: int | None = None,
    email_window_seconds: int | None = None,
):
    """FastAPI dependency factory enforcing IP (+ optional email) buckets.

    Email buckets additionally throttle account-targeted abuse (credential
    stuffing, OTP spam) even when the attacker rotates source IPs.
    """

    async def _check(request: Request, db: Session = Depends(get_db)):
        check_rate_limit(
            db,
            key=f"rl:{scope}:ip:{client_ip(request)}",
            limit=limit,
            window_seconds=window_seconds,
        )
        if email_field:
            email = ""
            try:
                body = await request.json()
                if isinstance(body, dict):
                    email = str(body.get(email_field) or "").strip().lower()
            except Exception:
                email = ""
            if email:
                check_rate_limit(
                    db,
                    key=f"rl:{scope}:email:{email[:320]}",
                    limit=email_limit if email_limit is not None else limit,
                    window_seconds=(
                        email_window_seconds
                        if email_window_seconds is not None
                        else window_seconds
                    ),
                )

    return _check

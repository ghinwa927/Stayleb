from datetime import datetime, timezone


def utcnow_naive() -> datetime:
    """Current UTC time as a timezone-naive datetime.

    StayLeb persists expiration/security timestamps in plain
    ``DateTime`` (TIMESTAMP WITHOUT TIME ZONE) columns. Those columns
    carry no timezone information, so every write and every comparison
    must use the same convention: naive UTC. Using the server-local
    ``datetime.now()`` instead would make booking holds, availability
    checks, and payment-expiry enforcement depend on the machine's
    local timezone (Render hosts must be treated as an unknown zone).

    Fields stored in timezone-aware columns (password-reset OTP
    ``expires_at``) intentionally keep using timezone-aware UTC and
    must NOT use this helper. JWT ``exp`` claims likewise stay aware,
    as required by the JWT libraries.
    """
    return datetime.now(timezone.utc).replace(tzinfo=None)

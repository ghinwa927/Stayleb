"""Application logging: JSON formatted, redacted, Render-friendly.

What this provides (no new dependencies):
- Single JSON log line per record on stdout, which Render collects into
  the service log stream. Set LOG_LEVEL (default INFO).
- Best-effort redaction of credentials, tokens, cookies, payment data
  and one-time codes from both messages and tracebacks, so routine
  error logs are safe to keep and share.
- Uvicorn access/error logs are routed through the same formatter
  (their default handlers are removed to avoid duplicate lines).

What this is NOT (by design):
- Not a hosted error-tracking service. For alerting/dedup/dashboards,
  optionally install ``sentry-sdk`` and initialize it with SENTRY_DSN
  (see backend/RENDER_DEPLOY.md). Nothing here depends on Sentry, and
  nothing here claims monitoring is "operational" until log delivery
  is verified in the Render dashboard.

Kept out of logs by the redactor (best effort, not a guarantee — never
log raw request bodies, cookies, or Stripe objects):
passwords, secrets, API keys, JWTs, bearer tokens, cookies, OTP codes,
card numbers.
"""
import json
import logging
import os
import re
from datetime import datetime, timezone

_REDACT_RULES: tuple[tuple[re.Pattern, str], ...] = (
    # key=value / key: value pairs (JSON, query strings, log kv)
    (
        re.compile(
            r"(?i)\b(password|passwd|pwd|secret|api[_-]?key|"
            r"access[_-]?token|refresh[_-]?token|id[_-]?token|"
            r"authorization|cookie|set-cookie|otp|client[_-]?secret"
            r"|webhook[_-]?secret)\b\s*[:=]\s*(\"[^\"]*\"|'[^']*'|[^\s,};&]+)"
        ),
        r"\1=[REDACTED]",
    ),
    # Authorization: Bearer <token> / raw JWTs
    (re.compile(r"Bearer\s+[A-Za-z0-9\-_.=~+/]+"), "Bearer [REDACTED]"),
    (
        re.compile(r"\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+"),
        "[REDACTED-JWT]",
    ),
    # Card-number-like digit runs (13-19 digits, optional spaces/dashes)
    (
        re.compile(r"\b(?:\d[ -]?){13,19}\b"),
        "[REDACTED-CARD]",
    ),
)


def redact(text: str) -> str:
    """Apply all redaction rules to a log string (best effort)."""
    if not isinstance(text, str):
        text = str(text)
    for pattern, replacement in _REDACT_RULES:
        text = pattern.sub(replacement, text)
    return text


class RedactingJSONFormatter(logging.Formatter):
    """Single-line JSON records with sensitive values redacted."""

    def format(self, record: logging.LogRecord) -> str:
        payload = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": redact(record.getMessage()),
        }
        if record.exc_info:
            payload["error"] = redact(self.formatException(record.exc_info))
        return json.dumps(payload, default=str)


def configure_logging(level: str | None = None) -> None:
    """Install the JSON handler on the root logger (idempotent).

    Uvicorn access/error loggers are routed through the same formatter
    to avoid duplicate plain-text lines. Respects LOG_LEVEL.
    """
    level_name = (level or os.getenv("LOG_LEVEL", "INFO")).upper()
    root = logging.getLogger()
    for handler in list(root.handlers):
        if isinstance(handler, logging.StreamHandler) and isinstance(
            handler.formatter, RedactingJSONFormatter
        ):
            root.setLevel(getattr(logging, level_name, logging.INFO))
            return
    handler = logging.StreamHandler()
    handler.setFormatter(RedactingJSONFormatter())
    root.addHandler(handler)
    root.setLevel(getattr(logging, level_name, logging.INFO))
    for name in ("uvicorn", "uvicorn.error", "uvicorn.access", "sqlalchemy.engine"):
        child = logging.getLogger(name)
        child.handlers.clear()
        child.propagate = True

import os
from typing import Literal
from urllib.parse import urlsplit

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


# Local development frontend origins. These are always allowed so that
# local development keeps working without code changes, including on
# production deployments (a browser only sends one of these origins
# when the page is genuinely served from localhost).
LOCAL_CORS_ORIGINS = (
    "http://localhost:3000,http://127.0.0.1:3000"
)


def normalize_origin(value: str) -> str | None:
    """Normalize a single origin to ``scheme://host[:port]``.

    Returns None for anything that is not a bare http(s) origin
    (empty values, wildcards, URLs with paths/queries, other schemes).
    Browsers send Origin without trailing slash or path, so values
    like ``https://app.vercel.app/`` are normalized instead of
    silently never matching.
    """
    value = value.strip().rstrip("/")
    if not value or value == "*":
        return None
    parts = urlsplit(value)
    if parts.scheme not in ("http", "https") or not parts.hostname:
        return None
    if parts.path not in ("", "/") or parts.query or parts.fragment:
        return None
    port = f":{parts.port}" if parts.port else ""
    return f"{parts.scheme}://{parts.hostname}{port}"


def parse_cors_origins(raw: str | None) -> list[str]:
    """Parse a comma-separated origins string into a deduplicated list."""
    if not raw:
        return []
    origins: list[str] = []
    for item in raw.split(","):
        normalized = normalize_origin(item)
        if normalized and normalized not in origins:
            origins.append(normalized)
    return origins


class Settings(BaseSettings):
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    gemini_api_key: str

    imagekit_private_key: str
    imagekit_url_endpoint: str

    ACCESS_TOKEN_EXPIRE_MINUTES: int = 120
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Comma-separated list of allowed frontend origins, e.g.
    # CORS_ALLOWED_ORIGINS="https://stayleb.vercel.app". Local
    # development origins are always included (see LOCAL_CORS_ORIGINS).
    cors_allowed_origins: str = LOCAL_CORS_ORIGINS

    # Deployment environment. Controls refresh-cookie security flags
    # and SQL logging. Must be exactly "development" or "production";
    # any other value fails startup instead of silently downgrading
    # security. Local development keeps the default.
    environment: Literal["development", "production"] = "development"

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore"
    )

    @field_validator("SECRET_KEY")
    @classmethod
    def _reject_placeholder_secret(cls, value: str) -> str:
        """Fail fast if SECRET_KEY is an obvious placeholder.

        Production must never boot with a well-known dummy secret.
        """
        blocked = {
            "changeme", "change-me", "change_me", "secret", "test",
            "password", "123456", "dev", "development", "placeholder",
            "your-secret-key", "secret-key", "default", "secretkey",
        }
        if not value.strip() or value.strip().lower() in blocked:
            raise ValueError(
                "SECRET_KEY uses a placeholder value; "
                "set a strong random secret"
            )
        return value

    @property
    def cors_origins(self) -> list[str]:
        """Final allow_origins list for CORSMiddleware.

        Combines the local-development defaults, CORS_ALLOWED_ORIGINS,
        and the legacy FRONTEND_URL single-origin variable (kept for
        backward compatibility; CORS_ALLOWED_ORIGINS is preferred).
        Never contains "*" (incompatible with credentialed requests).
        """
        origins = parse_cors_origins(LOCAL_CORS_ORIGINS)
        for extra in parse_cors_origins(self.cors_allowed_origins):
            if extra not in origins:
                origins.append(extra)
        legacy = normalize_origin(os.getenv("FRONTEND_URL") or "")
        if legacy and legacy not in origins:
            origins.append(legacy)
        return origins

    @property
    def refresh_cookie_secure(self) -> bool:
        """Secure flag for the refresh-token cookie.

        True in production (required for cross-site Vercel -> Render
        requests and for SameSite=None); False for local HTTP dev.
        """
        return self.environment == "production"

    @property
    def refresh_cookie_samesite(self) -> str:
        """SameSite mode for the refresh-token cookie.

        "none" in production so cross-site fetch requests carry the
        cookie; "lax" for local development.
        """
        return "none" if self.environment == "production" else "lax"

    @property
    def refresh_cookie_max_age(self) -> int:
        """Refresh-cookie lifetime in seconds (matches token expiry)."""
        return self.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60

    @property
    def sql_echo(self) -> bool:
        """SQL statement logging. On for local development only;
        always off in production (avoids PII/params in logs)."""
        return self.environment == "development"


settings = Settings()
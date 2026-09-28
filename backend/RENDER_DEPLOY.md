# StayLeb Backend — Render Production Deployment

Backend URL: `https://stayleb.onrender.com`
Frontend origin: `https://stayleb.vercel.app` (no trailing slash).
If the stable production frontend domain differs, use that exact origin
everywhere this file mentions the Vercel URL.

No secrets are stored in this file. Set all values in
Render Dashboard → Service → Environment (changing variables triggers
a redeploy, which is required for them to take effect).

## 1. Service settings (Render Dashboard)

- **Root Directory:** `backend`
- **Build Command:** `pip install -r requirements.txt`
- **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- Do NOT add `--reload` in production.
- Do NOT add `alembic upgrade head` (or any migration command) to the
  start command.

## 2. Required environment variables (Render)

| Variable | Value / source |
|---|---|
| `ENVIRONMENT` | `production` (enables Secure + SameSite=None refresh cookies, disables SQL logging; any other value fails startup) |
| `DATABASE_URL` | `<secret>` (existing production PostgreSQL 17.6 connection string) |
| `SECRET_KEY` | `<secret>` (strong random string; placeholders/empty values abort startup) |
| `CORS_ALLOWED_ORIGINS` | `https://stayleb.vercel.app` (exact origin; localhost dev origins are always allowed in addition) |
| `STRIPE_SECRET_KEY` | `<secret>` (live key, `sk_live_...`) |
| `STRIPE_WEBHOOK_SECRET` | `<secret>` (live webhook signing secret, `whsec_...`) |
| `IMAGEKIT_PRIVATE_KEY` | `<secret>` (required for property image uploads) |
| `IMAGEKIT_URL_ENDPOINT` | public endpoint URL (required for property image uploads) |
| `GEMINI_API_KEY` | `<secret>` (optional; AI endpoints return 503 without it) |
| `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS` | `<secret>` values as set today (optional; password-reset emails are skipped with a warning if unset) |

Optional / defaulted: `ALGORITHM=HS256`, `ACCESS_TOKEN_EXPIRE_MINUTES=120`,
`REFRESH_TOKEN_EXPIRE_DAYS=7`, legacy `FRONTEND_URL` (only as a fallback;
prefer `CORS_ALLOWED_ORIGINS`).

## 3. Database migrations (Alembic)

- Baseline revision: `8372f2bcb026` (full schema snapshot, single head).
- Production already contains this schema, so it must be **stamped, not upgraded**.
- **One-time operation** (run once, after deploying the code that ships
  `backend/alembic/`). From a machine with `DATABASE_URL` pointed at
  production (e.g. Render Shell), in `backend/`:
  ```
  alembic stamp 8372f2bcb026
  ```
- Verify afterward with:
  ```
  alembic current
  ```
  Expected: `8372f2bcb026`. Then confirm application tables are unchanged
  (row counts / `\dt` identical before and after — stamping only writes
  the single `alembic_version` row).
- **Never run `alembic upgrade head` on the existing production database**
  before that initial stamp.
- Fresh databases: `alembic upgrade head`.
- Future model changes: `alembic revision --autogenerate -m "..."`,
  review the diff, then upgrade dev first.

## 4. Stripe Dashboard

- Webhook URL: `https://stayleb.onrender.com/payments/webhook`
- Events to select: `payment_intent.succeeded`, `payment_intent.payment_failed`
- Use the live secret key and the webhook signing secret from Stripe.

## 5. Post-deployment verification (read-only)

- `GET https://stayleb.onrender.com/health` → `{"status":"ok"}`
- `GET https://stayleb.onrender.com/amenities/public` → `200` with data
- Preflight from `https://stayleb.vercel.app` → `200` with that exact
  origin echoed + `Access-Control-Allow-Credentials: true`
- Preflight from an unrelated origin → `400`, no allow-origin header
- Login `Set-Cookie` shows `Secure; SameSite=None; HttpOnly`

## 6. Local development (unchanged)

Frontend `http://localhost:3000` + backend `http://127.0.0.1:8000`
keep working with no code changes (localhost origins are built in).

## 7. Auth rate limiting (built in, no extra services)

Sensitive endpoints are throttled with database-backed fixed windows
(shared across all backend instances — no Redis needed):
login 10/10min per IP + per email; register 10/hour per IP, 5/hour per
email; forgot-password 5/10min per IP + email; verify-OTP 10/10min per
IP + email (the 5-attempt OTP cap still applies); reset-password
10/10min per IP. Violations return `429` with a `Retry-After` header.
Client IPs come from `X-Forwarded-For` using `TRUSTED_PROXY_HOPS=1`
(correct behind Render's proxy). No dashboard action required.

## 8. Email (Gmail)

Password-reset mail uses port `465` with implicit TLS, or STARTTLS on
any other port (e.g. `587`). For Gmail set `EMAIL_PORT=465` (or `587`).
If SMTP is unset, sends are skipped with a warning and the endpoint
still returns the generic "If that email exists..." message; SMTP
failures raise (logged without secrets) so missing codes are visible
in logs.

## 9. Logging and monitoring

Application logs are single-line JSON on stdout with passwords, tokens,
cookies, OTP codes, and card numbers redacted; Render collects the
stream automatically. Optional: set `LOG_LEVEL=DEBUG` temporarily for
diagnostics (default `INFO`). This is NOT hosted alerting — to add
Sentry: `pip install sentry-sdk`, pin it in `requirements.txt`, set
`SENTRY_DSN`, initialize `sentry_sdk` in `app/main.py`, then trigger a
test error and confirm it arrives in Sentry before relying on it.

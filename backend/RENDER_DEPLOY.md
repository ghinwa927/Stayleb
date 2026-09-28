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

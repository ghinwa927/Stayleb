# StayLeb Public Home and Client API audit

Audit date: 2026-09-25. Scope: the current working tree, including pre-existing modified and untracked files. **Audit only: no frontend or backend application files changed.**

The core APIs exist. The genuinely absent capabilities are **persistent favorites, Client AI property search, profile avatars, and notifications**. Much of the remaining work is connecting existing APIs, removing mock UI, and correcting existing booking/payment/search behavior.

This is source-level verification, not a successful live integration test. `CONNECTED` means an active frontend call and compatible core contract were traced; it does not certify deployment, database contents, email delivery, or Stripe processing. Existing-API defects are explicitly recorded below. All 100 backend Python files passed AST parsing. A standalone reproduction confirmed the cancellation date-estimate bug. No backend modules or database operations were executed. Starting the backend was deliberately avoided because `app/main.py` executes `create_all` and ALTER statements; even booking GET routes call a completion routine that writes to the database.

## 1. Already Connected

| Page / feature | Existing API | Verified contract and behavior |
|---|---|---|
| Login | `POST /auth/login`; `GET /users/me` | Sends email/password, saves returned bearer access token, receives refresh cookie, reads real identity/role. Active page uses `AuthForms.LoginForm`, not the legacy login component. |
| Registration | `POST /auth/register` | Sends `full_name,email,password,phone,role`; Client defaults to `client`; server restricts registration to client/owner. Returns user, then UI goes to login. Return-to-property is a separate frontend gap. |
| Forgot password → OTP → reset | `POST /auth/forgot-password`, `/auth/verify-reset-otp`, `/auth/reset-password` | `{email}` → `{email,otp}` → `{reset_token,new_password}`. Active forms call the real APIs. Email delivery/configuration not exercised. |
| Session refresh / shell logout | `POST /auth/refresh`, `/auth/logout` | Shared `apiFetch` includes cookies, adds bearer token, and retries a non-auth 401 once after refresh. Shell logout calls server. Profile's separate sign-out link is disconnected. |
| Basic normal search / pagination | `GET /properties`; `GET /amenities/public` | Shared public `/search` and Client `/account/properties` use the real search provider, paginated items, prices, amenities and sort mapping. Complete search surface is not yet correct; see sections 4–5. |
| Property information, images, amenities, rules, seasonal rates | `GET /properties/public/{property_id}` | Active detail component consumes `images`, `amenities`, `property_rules[].rule`, `seasonal_prices`, description, capacity and minimum nights. Only approved properties returned. |
| Property reviews and rating statistics | `GET /reviews/property/{property_id}` and `/stats` | Real seven-criteria ratings, comments, dates, counts and averages. Removed reviews excluded. Frontend incorrectly treats network failures as empty results. |
| Cash payment creation | `POST /payments/bookings/{booking_id}` | Sends only `{payment_method:"cash"}`; backend derives amount from booking and creates pending payment; booking stays pending. |
| Stripe initialization | `POST /payments/bookings/{booking_id}/stripe` | Returns `{payment,client_secret}`; amount comes from stored booking. Existing pending Stripe intent can be retrieved/reused by this same endpoint. |
| Stripe card form | Stripe Elements / `stripe.confirmPayment` | Real PaymentElement and confirmation call; secret stored in session storage. Returns to confirmation URL with `booking_id`. |
| Card confirmation | `GET /bookings/{booking_id}` after `POST /payments/webhook` | Signed success webhook marks payment paid and pending booking confirmed. UI polls booking for confirmation for approximately 30 seconds on successful polling requests. See webhook/recovery defects below. |
| Booking payment/refund display | `GET /payments/bookings/{booking_id}` plus `GET /bookings/{booking_id}` | Detail UI maps actual payment method/status, cancellation values, refund amount and refunded payment states. Errors must not all be presented as missing payment. |
| Submit review / see own review | `POST /reviews`; `GET /reviews/booking/{booking_id}` | Seven integer ratings 1–5; owns booking; completed stay; one review per booking. Client-specific read checks ownership. |

**Existing but incomplete, not missing:** `POST /bookings/preview`, `POST /bookings`, `GET /properties/{id}/availability`, `GET /bookings/my-bookings`, `GET /bookings/{id}`, and `PATCH /bookings/{id}/cancel` are all called by frontend code. Their incomplete behavior is detailed in sections 4 and 5.

## 2. Existing APIs Ready to Connect

Status in this table: **READY TO CONNECT**. This includes UI fragments still showing mock values while a neighboring fragment already uses the API.

| Page | Feature | Existing API | What Frontend Needs to Do |
|---|---|---|---|
| Home | Real-only featured cards / counts | `GET /properties?sort=newest&page=1&page_size=12` | Remove mock fallback on empty/error; use `total`, actual items and real/neutral image state. Existing fetch already runs. No dedicated featured API is required for the current generic collection. |
| Home | Popular amenity chips | `GET /amenities/public`; `GET /properties?amenity_ids=...` | Resolve names to real IDs and forward selected chips to search; currently only button state changes. |
| Home | Destination counts/filtering | `GET /properties?location=...&page_size=1` | Use returned totals for actual counts; map every selected destination. Current fetch location map handles only Faraya/Batroun/all, so other destination cards can fetch unfiltered results. Static region labels/images need no API. |
| All cards / booking sidebar | Actual ratings | `GET /reviews/property/{id}/stats` | Replace 4.9/4.92, 12 reviews and fake verified-host labels. Stats API exists; adding aggregates to search is an efficiency improvement, not a prerequisite. |
| Search / Explore | Bedroom, bed, bathroom, minimum price and property-type filters | `GET /properties` | Service accepts these fields. Provider stores bedroom/bed/bath fields but omits them from request. Provider lacks `min_price` and `property_type` state/URL wiring. Do not create another search API. |
| Search / Explore | Search capsule, heading, count, Update Search | `GET /properties` | Bind visible text to actual filter state and response total; current Batroun, dates, four guests, pet and 18-properties text is static. Update Search links to bare `/search`. |
| Client Dashboard | Name, trips, recommendations, review reminders | `GET /users/me`, `/bookings/my-bookings`, `/properties`, `/reviews/booking/{id}`; payment/property GETs | Replace Maya, fake trips, fake prices, fake counts and `stay-001` links with real records. Derive dashboard from existing endpoints; no new dashboard API is required. Favorites subsection waits for missing favorites capability. |
| Profile | Name, email, phone, role, joined date | `GET /users/me`; `PATCH /users/me` | Use `apiFetch` and existing user contract. Submit `full_name,email,phone`, not local form names `fullName,emailAddr,phoneNumber`. Remove unconditional success banner. |
| Profile | Change password | `POST /auth/change-password` | Use existing `changePasswordRequest(current_password,new_password)` helper; remove seeded password and LocalForm storage. **P1: LocalForm's name-based exclusion does not match `currentPass`, `newPass`, `confirmPass`, so successful form submission can store all three raw password values in localStorage.** Confirm-password stays frontend-only. |
| Profile | Sign out | `POST /auth/logout` | Reuse `logoutRequest`; current link merely navigates to login and leaves session active. |
| Client routes / booking guards | Client-only access | `GET /users/me`; existing auth/refresh helper | Add Client route guard. Account layout renders AppShell without an authentication/role gate. `isAuthenticated` currently accepts a token OR demo flag OR stored role. None proves a valid Client session. |
| Login/register journey | Return to selected property | Existing login/register endpoints | Preserve safe internal `next` across login → signup → login; keep selected dates/guests. Login honors `next`; signup links and successful registration discard it. No backend endpoint is missing. |
| Cash Pending | Load correct booking / show owner decision | `GET /bookings/{id}`, `GET /payments/bookings/{id}` | Read dynamic route ID, sync fetched context, refresh status and render approved/rejected/cancelled state. Current component uses query ID only, snapshots context once and always announces pending. |
| Booking Details | Live property amenities/rules and status refresh | Property, booking and payment GETs | Replace hardcoded Jacuzzi/Wi-Fi/house rules with loaded property fields; refresh after owner decision or on focus. Preserve booking data even if a public property fetch fails. |
| Card page | Recover a pending PaymentIntent after lost session storage | `POST /payments/bookings/{id}/stripe` | Call existing pending-intent reuse path; current card page only reads session storage. Failed payment recovery is a backend capability gap, below. |

Reuse `services/api.ts`, `properties.ts`, `bookings.ts`, `payments.ts`, `reviews.ts`, and existing property types. Profile can use the common `apiFetch`; do not create another token-refresh implementation or duplicate service stack.

## 3. Missing APIs

These are **four absent capability groups / eight suggested HTTP operations**. Endpoints below are proposals, not existing routes. All were checked against the full backend routes, services, schemas and models. P1 = required feature gap; P2 = secondary existing UI capability.

| Area / page | Feature / why needed | Suggested API | Request | Response | Auth/Role | Priority |
|---|---|---|---|---|---|---|
| Favorites, Dashboard, property cards/details | Persist and list account-owned favorites across devices; browser-local IDs are insufficient | `GET /favorites` | `page,page_size` | `{items:[{property_id,created_at,property:<safe card data>}],total,page,page_size,total_pages}`; define unavailable-property handling | Bearer; Client; current user's records only | P1 |
| Same | Idempotently save real property | `PUT /favorites/{property_id}` | Numeric path ID; no client/user ID in body | `{property_id,is_favorite:true,created_at}` | Bearer; Client; approved property | P1 |
| Same | Remove saved property | `DELETE /favorites/{property_id}` | Numeric path ID | `204` | Bearer; Client; own favorite only | P1 |
| Authenticated Client AI Search | Convert natural-language query to real property results | `POST /ai/search` | `{query,page?,page_size?}`; optional existing structured constraints | `{interpreted_filters,items:[<real property search item with numeric id>],total,page,page_size,total_pages,clarification?}`; explicit empty/error outcomes | Bearer; **Client only**, enforce `require_client` | P1 |
| Profile | Upload/persist avatar; owner-only listing image upload is unsuitable | `POST /users/me/avatar` | Multipart `file`; validate supported JPG/PNG and documented size | `{avatar_url}`; include persisted field in profile GET | Bearer; own account; Client required, optional reuse by other roles | P2 |
| Profile | Remove avatar | `DELETE /users/me/avatar` | None | `204`; subsequent profile has `avatar_url:null` | Bearer; own account | P2 |
| Client notification bell | Replace fabricated messages with persisted booking/review events | `GET /notifications` | `page,page_size,unread_only?` | `{items:[{id,type,title,body,booking_id?,created_at,read_at}],unread_count,total,page,page_size,total_pages}` | Bearer; Client; recipient-owned | P2 |
| Same | Persist read state | `PATCH /notifications/{id}` | `{read:true}` | Updated notification/read timestamp | Bearer; Client; recipient-owned | P2 |

Favorites page/card state can be derived from paginated favorite IDs; adding `is_favorite` to an authenticated discovery response or a batch-state API is optional optimization, not a ninth required operation.

Notifications also need backend event production for owner approval/rejection, payment confirmation and eligible review reminders. Read endpoints alone do not deliver SMS/WhatsApp. Those advertised channels need provider integration, preferences and delivery handling, or the UI must stop promising them. Preference persistence belongs in an extension of existing `/users/me`, not a duplicate profile API.

**Not classified as missing APIs:** normal search, property details, availability, price preview, cash creation, PaymentIntent creation, signed webhook, booking reads/list, cancellation/refund, reviews, basic profile/password, a dedicated Client dashboard, saved cards, static destinations, footer information, or receipt printing. No saved-payment-method management page was found; choosing Card/Cash is not saved-card management. The concierge modal explicitly saves a local message draft; real support-message sending would be a new product capability, not an existing send flow to falsely mark connected.

## 4. Existing APIs That Need Changes

These are **PARTIALLY READY**, not new APIs to create.

| Existing API | Current Behavior | Missing Capability / correction | Affected Page |
|---|---|---|---|
| `GET /properties` | Date search excludes owner blocks and enforces minimum nights, but never queries bookings | **P1:** Exclude overlapping pending/confirmed reservations, consistent with preview/create; otherwise apparently available results fail at booking | Home date search, Search, Explore, future AI Search |
| Search + preview/create block checks | Uses `blocked.end_date > check_in` | **P1:** Agree on inclusive blocked end-date semantics. Schema allows same-day blocks; UI treats both ends inclusive. Starting a stay on a block's end date can pass backend overlap check | Availability, stay selection |
| `POST /bookings` | Checks overlap then inserts without a property lock/atomic overlap constraint or request idempotency | **P1:** Serialize conflicting reservations and prevent retry duplication. No concurrency-safe guarantee is evident from service/model | All booking creation |
| Booking creation/payment/cancel lifecycle | Booking commits before payment creation; unpaid pending rows block inventory indefinitely; cancel rejects bookings without payment records | **P1:** Permit safe cancellation/expiry of unpaid, paymentless holds; define hold expiry/recovery. Cash UI promises max 12h owner review, but no expiry job/field was found | Failed initialization, abandoned checkout, Cash Pending |
| `POST /bookings/preview`; booking create/read/list/cancel responses | Return commission percentage/amount, owner earnings and cancellation revenue split to Client | **P1:** Return Client-safe response schemas excluding internal financial fields. Active PriceReview hides them, but network responses and cached preview expose them | Price & Review, Client booking data |
| `GET /bookings/my-bookings` | Bare unpaginated booking array, no payment/property summary or review flag | **P2:** Add pagination/filtering and safe property/image/payment summary; optionally review eligibility/submitted flag. Current UI filters locally, so basic filters do not require a new API | My Bookings, Dashboard |
| `GET /bookings/{id}` | Core booking/cancellation data exists; no nested property/payment or historical nightly breakdown | **P2:** Safe related snapshot useful for property removed/unpublished after booking; persisted nightly prices needed if historical daily receipt is required. Existing payment GET already supplies payment fields | Details, confirmation, receipt |
| Property detail/search responses | No owner display profile or rating aggregates; public schema also includes owner ID, rejection reason and image storage metadata | **P2:** Add only safe owner display data if actual host identity is desired; trim owner/admin/storage fields. Rating aggregates are optional optimization because review stats API exists | Cards, details, host badges |
| Public availability | Exposes booking IDs/status and owner block reasons; includes legacy booking status `paid`, unlike booking conflict checks | **P2:** Return only public unavailable intervals and align active statuses. Owner block notes need not be public | Property Details |
| `POST /payments/bookings/{id}/stripe` | Pending Stripe payment can be reused; local `failed` payment returns 409 | **P1:** Recover/retry failed payment safely through existing endpoint; inspect actual intent state. Card page also needs to recover secret instead of depending on one browser session | Card retry |
| `POST /payments/bookings/{id}` | Existing Stripe payment causes 409; repeated cash submission also causes 409 | **P1:** Safe idempotent cash retry and supported unpaid method switching, including cancelling/reconciling prior intent. Current failure page advertises Cash recovery that cannot work once Stripe record exists | Payment selection/failure |
| `PATCH /bookings/{id}/cancel` — unpaid cash | Sets cancelled booking and refund=0; line 617 merely evaluates `PaymentStatus.CANCELLED.value` | **P1:** Assign cancelled payment state. Fee tier recorded, no actual refund/collection for unpaid cash | Cancellation, payment state |
| Same — paid cash / no payment | Explicitly rejects paid cash; rejects missing payment record | **P1:** Implement supported policy/accounting for any paid-cash cancellation before check-in and cancellation of paymentless holds, or expose eligibility/reason and remove unsupported UI action | Cancellation |
| Same — paid Stripe | Calculates correct policy amounts and calls `stripe.Refund.create`; immediately marks refunded/partially_refunded | **P1:** Track refund status/failure; handle external refund success followed by database failure; add idempotency/reconciliation. Refund creation is not proof of final settlement | Refund state |
| `POST /payments/webhook` | Handles success and failure only; success short-circuits only when local status is `paid` | **P1:** Monotonic/idempotent state transitions. A replayed success after refund can overwrite `refunded`/`partially_refunded` with `paid`; late success can mark payment paid for cancelled booking. Add reconciliation/refund event handling | Confirmation, cancellation/refunds |
| `PATCH /payments/bookings/{id}/mark-paid` | Cash receipt exists and is owner-only; settlement local variable is assigned only if settlement absent, but `db.add(settlement)` is unconditional | **P2:** Handle existing settlement idempotently; receipt enables paid/completed Client stay and review eligibility | Cash completion, reviews |
| `GET/PATCH /users/me` | Persists name/email/phone only | **P2:** Extend existing profile schema/model for primary location, preferred language and notification preferences if retaining these UI controls; avatar field accompanies new upload capability | Client Profile |

Additional source defect: `routes/payments.py:316` annotates `current_user: User` but never imports `User`. The installed environment is Python 3.14.7; isolated route registration with stub dependencies succeeded, but evaluating the annotation raised `NameError`. Earlier eager-annotation runtimes may fail at import. Treat this as an unresolved type/dependency defect; a full backend startup was not performed.

### Cancellation policy verification

Server tiers in `booking_service.cancel_booking` match the requested policy: 10+ days → 0% fee/100% refund; 5–9 → 10% fee/90% refund; 1–4 → 30% fee/70% refund. Server prohibits cancellation on/after check-in.

- **Unpaid cash:** policy fee is recorded, actual refund is zero because no money was collected. Payment status bug remains.
- **Paid cash:** unsupported, even before check-in.
- **Paid Stripe:** full/partial refund call exists; asynchronous status and failure recovery are incomplete.
- **Pending/failed Stripe:** server attempts PaymentIntent cancellation and records zero refund.
- **No payment record:** cancellation fails, leaving a pending hold without Client cancellation recovery.
- **Frontend estimate is wrong:** `getDaysBeforeCheckIn` measures check-in noon against today midnight then uses `ceil`, adding one day. Reproduced: actual 4 days gives UI 5 days (90% instead of 70% refund); actual 9 gives UI 10 (100% instead of 90%). Same-day cancellation is offered but server rejects it. Fix date-only arithmetic and server eligibility representation; do not duplicate/change policy percentages.

## 5. API Contract Mismatches

| Contract / UI | Difference and impact | Fix belongs to |
|---|---|---|
| Search filters | Backend supports every requested filter: location, both dates, guests, type, min/max, bedrooms/beds/bathrooms, amenities, four sorts, pagination. Provider fails to send several fields | Frontend |
| Search dates / results | Backend search does not exclude bookings; preview does. Selected search dates/guests are also lost when card links navigate to `/properties/{id}` without query | Backend search + frontend routing |
| Price filtering with dates | Server requires every nightly rate within range (`lowest >= min`, `highest <= max`), while cards display average. A stay averaging under max can be omitted due to one expensive night | Clarify UI semantics; change backend only if desired contract is average-price filtering |
| Recommended / popular | `recommended` currently means newest; Home explicitly requests newest. No personalized/popularity ranking exists | Label honestly or enhance existing search; no new endpoint necessary |
| Money | Pydantic Decimal fields serialize as strings; consumers generally call `Number`/formatters correctly. Property types allow string/number. No general Decimal blocker found | Preserve mapping; do not perform authoritative arithmetic in browser |
| Naming | Core snake_case service contracts match. Profile LocalForm uses unrelated names and never calls profile endpoint | Frontend field mapping |
| Rule nested type | API nested rule has id/name/description; frontend reuses broader `Rule` type requiring category/is_active. Current detail reads only available fields | Narrow frontend nested rule type |
| IDs | APIs use integers; mock `cedar-peak`, `stay-001`, `stay-002` links cannot resolve against typed routes | Frontend |
| Ratings / beds | Home injects 4.92 and 12 reviews; search/booking cards inject 4.9. Search card labels `bedrooms` as beds despite separate `beds` field | Frontend; use existing stats API |
| Booking vs payment status | My Bookings calls every non-pending booking “Paid,” including approved-unpaid cash, cancelled and rejected bookings | Frontend; payment GET exists, richer list response recommended |
| Booking amount breakdown | Preview returns daily date/price/source/season name, nights, average and total. No separate fee/tax/subtotal fields exist; current backend total is sum of nights. Persisted booking lacks daily breakdown | Remove invented cleaning/tax line; extend existing responses only if real fees or historical daily receipt required |
| Owner financial data | Hidden in visible PriceReview, still present in Client API payload/types/session preview | Backend Client-safe schemas + frontend cache/types |
| Block ranges | UI inclusive block end vs backend strict overlap; same-day blocks accepted by schema | Backend contract consistency |
| Errors / nullable data | Review/property availability errors swallowed as empty/available; all payment errors treated as missing payment; property fetch may fail after unpublishing | Distinguish loading/empty/unavailable/error; safe booking snapshot improvement |
| Cancellation date | UI tier/eligibility shifted by one day | Frontend; reproduced above |
| Review text | Frontend max 1000 chars, backend max 2000 | Align documented limit; restrictive frontend is not missing API |
| Cash Pending route | `/account/bookings/{id}/pending` supplies path ID; CashRequest reads only `booking_id` query and initial context snapshot | Frontend; can remain loading or show stale/unrelated session booking |
| Booking identity cache | Provider restores global latest-booking ID; PaymentMethod reuses any context booking without matching property/dates/guests. PropertyDetails attempts clearing, but its context setters are no-ops outside provider | Frontend; bind booking/draft to route and authenticated user |
| PropertyDetails context | No BookingProvider in property page/market/root layouts. Query fallback preserves initial transition; promised shared draft/back-navigation is unreliable | Frontend provider placement/state lifecycle |
| Auth | Account pages not guarded; local role/demo flag accepted as authentication; login `next` is not role-scoped; Remember Me has no storage/session behavior | Frontend guard and session UX; backend Client routes mostly enforce roles correctly |

### Normal search capability checklist

| Requested field | Backend | Active frontend |
|---|---|---|
| location | Yes, case-insensitive location match | Home/URL sends it; result capsule is fake |
| check-in/check-out | Yes, paired dates, season calculation and blocked dates | Passed from Home; booked-stay exclusion broken in backend; dates dropped on card navigation |
| guests | Yes, capacity minimum | Wired |
| property type | `chalet` / `furnished_house` | Service supports; provider omits |
| min price | Yes | Service supports; provider omits |
| max price | Yes | Slider wires values below 600; 600 or higher treated as no maximum |
| bedrooms/beds/bathrooms | Yes, minimum counts | URL/state partially exists; fetch omits |
| amenities | Yes, ALL selected IDs | Search chips wired; Home chips omitted |
| sorting | recommended, price_low, price_high, newest | Hyphenated UI values mapped; URL snake_case value can mismatch select option. Recommended = newest |
| pagination | Yes, page/page_size/total/total_pages | Wired; filter reset/back-forward synchronization incomplete |

No rating sort or pet-count API is required by a working control found here. The “1 Pet” text is static. The generic refine dialog locally filters only the current result page; it is not full-database free-text search.

### Technical and fabricated UI to remove

- Home: mock listings on empty/error, fixed 118 total, fake destination availability counts, artificial ratings/reviews/host claims. `HomeSections` contains fixed statistics/testimonial and the visible “Sample listing data … prototype demonstration” note.
- Search: static destination, dates, guests/pet, 18-results count and fixed rating; hidden accessibility text says “Simulate No Results.”
- Dashboard: Maya identity, fake 2024 bookings, prices, reviews, saved/recommended properties and string IDs. No data-loading service is used by dashboard component.
- Favorites: four hardcoded cards/count and “Synced Across Devices” claim; local storage uses different keys and some cards share the same mock favorite ID. No user scoping or server persistence.
- Profile: fake identity/avatar, joined date/stay history, prefilled password, permanent success banner; notifications checkboxes do not persist to backend. LocalForm saves only device data and cannot update password.
- Profile password submission must bypass generic LocalForm entirely: its `/password|card|cvc/i` key filter misses the actual password input names (`currentPass`, `newPass`, `confirmPass`). Do not persist these fields in browser storage; remove any such legacy form cache when implementing the correction. This is a frontend security defect, not a missing password API.
- Booking sidebar/details: fixed 4.9, “Verified Superhost,” fixed power/Jacuzzi/Wi-Fi/rules and check-in handover promises. Existing amenities/rules can supply most facts; arrival instructions/host identity need existing response extensions if retained as property-specific data.
- Technical wording: “Backend is final authority” (StaySelection); “Server Verified,” “server-side,” “Server-calculated” (PriceReview/Summary/PropertyDetails); “server as source of truth” (My Bookings); “Stripe webhook,” “Total from server” (BookingOutcome); “backend is the source of truth” (cancellation dialog). Replace with plain pricing/status language.
- Dormant `FavoritesGrid` says “Favorites backend is not complete”; generic support modal says “frontend demo”; footer actions say “not available in this preview.” Support draft can remain honest local drafting; do not fabricate sent-message success.

## 6. AI Search Status

**Client property-search backend: MISSING API. Client AI search connection: absent. Client-only rule: currently violated by the frontend.**

- Existing `POST /ai/property/generate-description` uses `require_owner`, accepts listing attributes and returns `{description}`. It calls Gemini for writing; it does not query properties or return property IDs/filters/results. It cannot serve Client AI Search.
- No `/ai/search` route/service/schema or active Client AI search page was found. No `/ai-search` Next page exists.
- Active public Home has an AI Natural-Language Search tab, prompt examples, input and floating AI Concierge. Submitting the AI form merely navigates to `/search` and drops the prompt. No real AI request/loading/error/empty-result flow exists.
- `AppShell`'s market-navigation branch also defines public `/ai-search`; current market layouts do not mount that branch, but it must be removed before reuse. Active PublicHeader itself has no AI link.
- Client Favorites “Try AI Smart Search” invokes generic ActionButton's writing-assistant modal; it does not search. Account route guard is absent.

Required target: remove Home AI tab/input/prompts/floating concierge and guest AI links/wording; implement an authenticated Client page (for example `/account/ai-search`); enforce Client role server-side; call new search endpoint via shared API client; use real property cards and structured constraints; distinct loading, clarification, no-match and unavailable/error states. Never use fake matches on failure. **I cannot confirm public pages are AI-free: they currently are not.**

## 7. Home Page Readiness

| Home section | Status | Finding |
|---|---|---|
| Standard search core | CONNECTED | Pushes location/dates/guests to shared real search; discovery availability remains partial |
| Featured listings | READY TO CONNECT (cleanup of partial wiring) | Real fetch exists; mock fallback and fabricated card metadata prevent real-only behavior |
| Popular amenity filters | READY TO CONNECT | Existing catalog/search API; selected chips never forwarded |
| Destination labels / photos | FRONTEND ONLY | Can remain curated/static |
| Destination counts / selections | READY TO CONNECT | Use search totals; complete location map; current counts are fake |
| Availability-based discovery | PARTIALLY READY | Existing search fails to exclude bookings |
| Ratings | READY TO CONNECT | Stats endpoint available; hardcoded on Home |
| AI tab / concierge | FRONTEND ONLY removal required | Forbidden public placement; do not build public AI backend |
| Assurances, promotional content, static testimonial | FRONTEND ONLY | Not API blockers; remove unverifiable numeric/verified-stay claims or supply approved real content |
| Header, footer, locale controls | FRONTEND ONLY | Login links work; several footer actions are preview placeholders; USD/English currently static |

**No new public Home endpoint is required** to replace its fake listings and run normal discovery. Existing search needs correctness fixes; real popularity/personalization is not implemented and must not be claimed.

## 8. Client Readiness

Counts below cover **40 explicitly enumerated Client/shared feature units**, not routes or HTTP operations. Public-only Home sections are counted separately above. Existing endpoint with a frontend-only disconnect is READY TO CONNECT; missing required server behavior is PARTIALLY READY. A core call marked CONNECTED may still have nonblocking UI/error-handling cleanup listed above. Counts are source-audit classifications, not runtime test pass counts.

- Fully connected features: **14**
- Ready-to-connect features: **9**
- Partially ready: **9**
- Missing APIs: **4 capability groups** (8 suggested HTTP operations)
- Frontend-only features: **4**

| ID | Feature unit | Status |
|---|---|---|
| C01 | Basic search requests/results/pagination | CONNECTED |
| C02 | Full filter and search-header wiring | READY TO CONNECT |
| C03 | Availability-based discovery | PARTIALLY READY |
| C04 | Property core/images/amenities/rules/seasons | CONNECTED |
| C05 | Availability calendar/block-boundary contract | PARTIALLY READY |
| C06 | Server price preview, including Client-safe payload | PARTIALLY READY |
| C07 | Durable booking creation/hold lifecycle | PARTIALLY READY |
| C08 | Choose Card/Cash control | FRONTEND ONLY |
| C09 | Initial cash payment persistence | CONNECTED |
| C10 | Cash Pending route and owner-decision UI | READY TO CONNECT |
| C11 | Stripe intent initialization/pending reuse | CONNECTED |
| C12 | Stripe Elements payment submission | CONNECTED |
| C13 | Initial card confirmation polling | CONNECTED |
| C14 | Failed-payment retry/method switching | PARTIALLY READY |
| C15 | Booking Details related content/status refresh | READY TO CONNECT |
| C16 | My Bookings complete payment/property list contract | PARTIALLY READY |
| C17 | Cash cancellation/paymentless cancellation | PARTIALLY READY |
| C18 | Stripe cancellation/refund lifecycle | PARTIALLY READY |
| C19 | Read/display payment and stored refund fields | CONNECTED |
| C20 | Property review list/statistics | CONNECTED |
| C21 | Submit eligible review | CONNECTED |
| C22 | Read own submitted review | CONNECTED |
| C23 | Dashboard core identity/trips/recommendations/reminders | READY TO CONNECT |
| C24 | Persisted Favorites | MISSING API |
| C25 | Client AI property search | MISSING API |
| C26 | Profile core read/update | READY TO CONNECT |
| C27 | Profile password change | READY TO CONNECT |
| C28 | Profile avatar management | MISSING API |
| C29 | Profile location/language/notification preferences | PARTIALLY READY |
| C30 | Notifications list/read state | MISSING API |
| C31 | Client route authentication/role gating | READY TO CONNECT |
| C32 | Login core | CONNECTED |
| C33 | Registration core | CONNECTED |
| C34 | Forgot-password/OTP/reset flow | CONNECTED |
| C35 | Shared session refresh | CONNECTED |
| C36 | Guest-to-registration return/draft continuity | READY TO CONNECT |
| C37 | Profile sign-out action | READY TO CONNECT |
| C38 | Browser receipt printing/share | FRONTEND ONLY |
| C39 | Navigation/static presentation | FRONTEND ONLY |
| C40 | Explicit local support-message draft | FRONTEND ONLY |

### Complete Guest → Client journey

| Step | Result / exact break |
|---|---|
| Home → browse/search | Real search exists; Home can show fabricated fallback cards that lead to invalid numeric IDs |
| Search → results | Real items, pagination; static header lies about criteria/count; dates do not exclude bookings |
| Results → details | Public API exists; numeric real IDs work. Dates/guests not carried through card link |
| Guest favorite/booking | Normal login prompt exists when no local flags; fake role/demo flag bypasses UI gate. Server still restricts booking |
| Login → property | Safe-relative `next` supported; intent/dates/favorite not restored automatically |
| Register → login → property | Registration works; `next` dropped, login falls back to Client Dashboard |
| Client favorite | **Missing persistence APIs**; local-only toggle and static Favorites page |
| Select stay → real price | Existing preview computes seasonal nightly prices and validates capacity/overlap; guest requests hit Client-only preview and silently fall back to local base-price estimate; use honest login-to-quote UX or existing date-aware public search pricing |
| Review price | Real daily breakdown exists. PropertyDetails lacks provider; query fallback carries draft to summary. Internal earnings still exposed in response |
| Choose payment → create booking | Existing POST recalculates price; does not accept client price. Stale cached booking can be reused; concurrent booking/hold lifecycle incomplete |
| Cash | Payment POST persists pending cash; owner approve/reject endpoints exist. Pending UI ID/hydration/status handling broken |
| Card | Intent → Elements → signed webhook chain exists. Pending retry supported; failed retry/switching/refund event handling incomplete |
| Booking persisted → Details | Authorized booking/payment GETs exist; property snapshot absent, current-public-property dependency can fail; fixed arrival/rules data mixed in |
| My Bookings | Loads own rows; N+1 properties and completed-review requests; no actual payment read, hence misleading “Paid” label |
| Cancellation/refund | Existing policy and refund call; cash state bug, no-payment/paid-cash gaps, browser tier bug, refund reconciliation missing |

### Authentication / role conclusions

- Public Home/search/detail/availability/catalog/review routes are unauthenticated as expected.
- Booking preview/create/my-bookings/cancel, payment creation and review submission/own-review read require Client; booking/payment detail checks ownership and allows the matching owner/admin as appropriate.
- Existing AI description endpoint requires Owner; do not expose it as Client search.
- Account layout does not prevent guests/non-Clients from rendering Client Dashboard/Profile/Favorites; no middleware/proxy Client guard found. Protected APIs still reject unauthorized operations, which is different from correct page access UX.
- Shared guards use browser flags, not validated identity. Generic ActionButton favorite handler also lacks a gate; active dedicated FavoriteButton has the weak guard. Favorites storage and cached booking/identity data are not scoped/cleared consistently across accounts.
- Logout clears token/role, but not all name/draft/booking/favorites cache. Reuse central logout and explicitly reset user-owned UI state.

## 9. Recommended Implementation Order

Only genuinely absent APIs are ordered here. Existing search/payment/cancellation corrections are critical but belong to section 4, not this new-API list.

1. **Favorites:** `GET /favorites`, `PUT /favorites/{property_id}`, `DELETE /favorites/{property_id}`. Unlock cards, details, Favorites and Dashboard saved state.
2. **Client AI Search:** `POST /ai/search`, after existing normal-search availability is corrected. Reuse real property search/filter/price behavior; Client role mandatory.
3. **Notifications:** `GET /notifications`, `PATCH /notifications/{id}`, with recipient-owned events and generators. Connect owner decisions/payment/review reminders; do not claim SMS/WhatsApp until delivery exists.
4. **Avatars:** `POST /users/me/avatar`, `DELETE /users/me/avatar`, with profile response field. Secondary to discovery/booking.

## Audit coverage and evidence

All frontend route files were inventoried, including unlinked `/book/{id}/*` and `/market/book/{id}/*` route trees, account pending/review pages and auth recovery pages. Both booking trees render the same shared components. `/book/{id}` and `/market/book/{id}` redirect to summary only when a matching draft is already available, otherwise to details; standalone `StaySelection` is currently not imported by a page. No Client saved-cards page or real AI page was found.

Dormant `PublicHomeDiscoverSection0/1`, legacy auth sections, `FavoritesGrid`, `.bak` components and `.tsx.new` files were distinguished from active routes; they are not evidence of a live integration. Unused mock-data modules still exist. Reusing these prototypes could reintroduce fake behavior. Owner/admin code was checked only where needed for Client lifecycle/endpoint coverage; no owner/admin redesign is included.

Key source anchors (paths relative to repository root; line numbers refer to audited working tree):

| Source | Evidence |
|---|---|
| `frontend/src/components/features/homepage/HomeExperience.tsx:60` | Real Home fetch, fallback at 84, fabricated ratings at 95, public AI at 210/497 |
| `frontend/src/components/features/market/ListingSearch.tsx:90` | Fetch parameters; local favorites at 136; fake rating in card; dormant FavoritesGrid at 426 |
| `frontend/src/components/features/market/SearchResultsSection0.tsx:27` | Static search criteria/header |
| `frontend/src/components/features/market/PropertyDetailsSection0.tsx:119` | Preview call; booking handler at 208; local favorites; date-range handling |
| `frontend/src/components/features/booking/BookingContext.tsx:27` | Default/no-op context, hydration, weak gate, global latest booking restore |
| `frontend/src/components/features/booking/PaymentMethod.tsx:113` | Cached booking reuse then booking/payment calls |
| `frontend/src/components/features/booking/BookingOutcome.tsx:88` | CashRequest ID and context initialization |
| `frontend/src/components/features/account/BookingDetailsSection0.tsx:53` | Date-tier bug; payment reads at 90; cancel at 184; hardcoded amenities/rules at 604 |
| `frontend/src/components/features/account/MyBookingsSection0.tsx:20` | Own bookings, property/review fan-out; payment inferred from booking status |
| `frontend/src/components/features/account/ClientProfileAccountSection0.tsx:116` | LocalForm profile; notification preferences and password form further below |
| `frontend/src/components/features/account/ClientDashboardSection0.tsx:8` | Static Client Dashboard |
| `frontend/src/components/features/auth/AuthForms.tsx:79` | Active login; register at 174; forgot/reset below |
| `frontend/src/lib/authGuard.ts:4` and `frontend/src/app/(account)/layout.tsx:1` | Weak identity predicate and missing account guard |
| `backend/app/routes/property.py:58` | Full public filter contract; public detail at 157; availability at 177 |
| `backend/app/services/property_search_service.py:127` | Owner-block exclusion, absent booking exclusion; recommended/newest at 210 |
| `backend/app/services/booking_service.py:17` | Server validation/pricing; preview at 254; cash approval 381/rejection 434; cancellation 487; completion 828 |
| `backend/app/services/payment_service.py:102` | Stripe creation/pending reuse; cash receipt at 251 |
| `backend/app/routes/payments.py:66` | Signed webhook, success/failure state updates; payment GET at 232 |
| `backend/app/schemas/booking.py:14` | Internal financial fields in Client booking/preview responses |
| `backend/app/routes/ai.py:18` | Only owner property-description generation API |
| `backend/app/routes/users.py:16` and `backend/app/schemas/user.py:59` | Existing profile endpoints and supported update fields |
| `backend/app/routes/reviews.py:40` and `backend/app/services/review_service.py:17` | Real review routes, ownership/completion validation |

No live writes, payments, cancellations, migrations or application imports were run. Stripe keys/webhook registration, external email delivery, deployed backend availability and real browser behavior remain unverified. Existing pre-audit working-tree changes were left intact.

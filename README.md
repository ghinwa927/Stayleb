# 🏡 StayLeb

**StayLeb** is a full-stack property rental platform designed for booking **chalets and furnished houses in Lebanon**.

The platform connects property owners with clients looking for short-term stays while providing an administrative system for managing users, properties, amenities, rules, commissions, payments, and platform operations.

StayLeb includes role-based dashboards, property approval workflows, seasonal pricing, availability management, booking and payment flows, Stripe integration, favorites, reviews, and AI-powered features.

---

## ✨ Features

### 👤 Client

Clients can:

- Register and log in securely
- Browse approved chalets and furnished houses
- Search and filter available properties
- View detailed property information
- View property images, amenities, rules, and seasonal pricing
- Check property availability
- Save and remove favorite properties
- Use **AI-powered natural-language property search**
- Select booking dates and number of guests
- Preview nightly pricing before booking
- View seasonal price breakdowns
- Create temporary booking reservations
- Pay online using Stripe
- Request cash payment
- Track booking and payment status
- View booking details and booking history
- Cancel eligible bookings
- View refund information
- Submit reviews for completed stays
- Manage personal profile information
- Reset forgotten passwords using email OTP verification

---

### 🏠 Property Owner

Property owners can:

- Register as an Owner
- Manage their profile
- Add chalets and furnished houses
- Upload and manage property images
- Configure amenities and property rules
- Add seasonal pricing periods
- Manage property availability and blocked dates
- Edit existing properties
- Preview property information
- Track property approval status
- Manage bookings for their properties
- Review cash booking requests
- Approve or reject applicable cash requests
- Track payments and earnings
- View booking and operational information
- Use **AI-assisted property description generation**

Edited properties can be returned to the approval workflow to ensure property information remains moderated.

---

### 🛡️ Admin

Administrators can manage the platform through a dedicated dashboard.

Admin functionality includes:

- User management
- Owner management
- Property approval
- Pending property review
- Approved and rejected property management
- Rejection reasons
- Amenities management
- Property rules management
- Platform commission settings
- Cash commission reconciliation
- Booking and payment oversight
- Reports and platform statistics

---

## 🤖 AI Features

StayLeb integrates AI functionality to improve both property discovery and property management.

### AI Property Search

Authenticated clients can describe the type of stay they want using natural language.

Example:

> "I want a chalet in Tyre for 4 guests with a pool."

The AI interprets the request into structured search criteria such as:

- Location
- Number of guests
- Price range
- Property type
- Bedrooms
- Bathrooms
- Beds
- Amenities

The extracted requirements are then matched against **real approved StayLeb properties stored in the database**.

The AI does not generate fake property listings.

### AI Property Description Generation

Property owners can use AI assistance while creating property listings.

StayLeb uses information such as:

- Property type
- Location
- Bedrooms
- Beds
- Bathrooms
- Guest capacity
- Amenities
- Property rules

to generate a polished property description that the owner can use for the listing.

---

## 📅 Booking System

StayLeb includes a server-validated booking system.

Before a booking is created, the backend validates:

- Property approval status
- Check-in and check-out dates
- Minimum-night requirements
- Maximum guest capacity
- Owner-blocked dates
- Existing active bookings
- Seasonal pricing

Pricing is calculated by the backend to prevent client-side price manipulation.

### Nightly Pricing

A booking can contain different nightly prices when selected dates overlap a seasonal pricing period.

For example:

```text
June 29    $150
June 30    $150
July 1     $180
July 2     $180
```

The backend calculates:

- Number of nights
- Nightly price breakdown
- Total booking price
- Average nightly price
- Platform commission
- Owner earnings

Commission information is handled internally and is not exposed unnecessarily in the Client checkout UI.

---

## ⏳ Temporary Booking Holds

When a Client begins checkout, StayLeb creates a temporary pending booking with an expiration time.

The temporary reservation prevents another Client from taking the selected dates while checkout is in progress.

### Stripe

For online payment:

```text
Booking Created
      ↓
Temporary Hold
      ↓
Stripe PaymentIntent
      ↓
Client Completes Payment
      ↓
Stripe Webhook
      ↓
Payment = Paid
Booking = Confirmed
```

If the temporary checkout period expires before payment is completed, the reservation no longer blocks the dates.

### Cash

For cash payment:

```text
Booking Created
      ↓
Client Selects Cash
      ↓
Temporary Expiration Removed
      ↓
Cash Request Pending
      ↓
Owner Reviews Request
```

The reservation remains pending while waiting for the appropriate cash-payment workflow.

---

## 💳 Stripe Integration

StayLeb uses **Stripe PaymentIntents and Stripe Elements** for online card payments.

Stripe integration includes:

- PaymentIntent creation
- Secure Stripe Elements card entry
- Payment confirmation
- Webhook signature verification
- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- Payment retry handling
- Idempotent webhook processing
- Booking confirmation after successful payment

Sensitive Stripe secret keys are stored only on the backend and must never be committed to the repository.

---

## ❌ Cancellation & Refund Policy

StayLeb supports cancellation calculations based on the time remaining before check-in.

Current policy:

| Time Before Check-in | Deduction | Refund |
|---|---:|---:|
| 10+ days | 0% | 100% |
| 5–9 days | 10% | 90% |
| Less than 5 days | 30% | 70% |

For applicable online cancellations, the platform calculates the refund amount and retained amount according to the cancellation policy.

---

## ❤️ Favorites

Authenticated clients can save properties to their StayLeb account.

Favorites are stored in the backend rather than browser-only storage, allowing the saved-property list to remain associated with the Client account.

Clients can:

- Add a property to Favorites
- Remove a property from Favorites
- View saved properties
- Access Favorites from property cards
- Save properties from Property Details
- Use Favorites with AI Search results

---

## 🔐 Authentication & Authorization

StayLeb uses JWT-based authentication and role-based authorization.

Roles:

```text
Admin
Owner
Client
```

The platform uses:

- Access tokens
- Refresh tokens
- Hashed refresh-token storage
- Protected routes
- Role-based dependencies
- Password hashing
- Email OTP password reset

### Password Reset

```text
Forgot Password
      ↓
Email OTP
      ↓
Verify OTP
      ↓
Reset Token
      ↓
Set New Password
```

OTP codes are time-limited and protected by attempt limits.

---

## 🧑‍💻 Tech Stack

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- Stripe Elements

### Backend

- FastAPI
- Python
- SQLAlchemy
- Pydantic
- Uvicorn

### Database

- MySQL / MariaDB
- PyMySQL

### Authentication

- JWT
- Role-Based Access Control
- Refresh Tokens
- Email OTP Password Reset

### External Services

- Stripe — online payments
- ImageKit — property image management
- Google Gemini API — AI-powered features

### Development Tools

- Git
- GitHub
- Swagger / OpenAPI
- XAMPP
- phpMyAdmin

---

## 🏗️ Architecture

StayLeb follows a separated frontend/backend architecture.

```text
┌───────────────────────────────┐
│        Next.js Frontend       │
│                               │
│ Guest | Client | Owner | Admin│
└───────────────┬───────────────┘
                │
                │ REST API
                ▼
┌───────────────────────────────┐
│         FastAPI Backend       │
│                               │
│ Routes                        │
│ Schemas                       │
│ Services                      │
│ Authentication / RBAC         │
│ Business Logic                │
└───────────────┬───────────────┘
                │
                ▼
┌───────────────────────────────┐
│        MySQL / MariaDB        │
└───────────────────────────────┘

External integrations:

FastAPI ──► Stripe
FastAPI ──► Google Gemini
FastAPI ──► ImageKit
```

---

## 📁 Project Structure

A simplified project structure:

```text
StayLeb/
│
├── backend/
│   ├── app/
│   │   ├── database/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── schemas/
│   │   ├── services/
│   │   ├── dependencies.py
│   │   └── main.py
│   │
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── services/
│   │   └── lib/
│   │
│   ├── public/
│   └── package.json
│
└── README.md
```

The exact structure may vary as development continues.

---

## 🚀 Getting Started

### Prerequisites

Make sure you have installed:

- Python
- Node.js
- npm
- MySQL or MariaDB
- Git

---

## 1. Clone the Repository

```bash
git clone <your-repository-url>
cd StayLeb
```

---

## 2. Backend Setup

Navigate to the backend:

```bash
cd backend
```

Create a virtual environment:

```bash
python -m venv .venv
```

Activate it.

### Windows

```bash
.venv\Scripts\activate
```

### macOS / Linux

```bash
source .venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create your environment configuration based on the variables required by the backend.

Example:

```env
DATABASE_URL=mysql+pymysql://USERNAME:PASSWORD@localhost/stayleb

SECRET_KEY=your_jwt_secret

STRIPE_SECRET_KEY=your_stripe_test_secret
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

GEMINI_API_KEY=your_gemini_api_key

# Add ImageKit and email/SMTP configuration required by your environment.
```

Never commit real secret values.

Start the backend:

```bash
uvicorn app.main:app --reload
```

By default, the development API is typically available at:

```text
http://127.0.0.1:8000
```

Swagger documentation:

```text
http://127.0.0.1:8000/docs
```

---

## 3. Frontend Setup

Open another terminal and navigate to the frontend:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Configure the frontend environment variables required by the project.

Then start the development server:

```bash
npm run dev
```

Open the local URL displayed by Next.js in your terminal.

---

## 🔔 Stripe Webhooks

Online payment confirmation relies on Stripe webhooks.

For local development, forward Stripe events to the backend webhook endpoint using the Stripe CLI.

Example:

```bash
stripe listen --forward-to localhost:8000/payments/webhook
```

Copy the generated webhook signing secret into your backend environment configuration.

Never commit the webhook secret.

---

## 🔒 Environment & Security

Do not commit sensitive files or credentials.

Your `.gitignore` should exclude files such as:

```gitignore
.env
.env.local
.venv/
node_modules/
__pycache__/
.next/
```

Never commit:

- Database passwords
- JWT secrets
- Stripe secret keys
- Stripe webhook secrets
- Gemini API keys
- SMTP credentials
- ImageKit private credentials

---

## 🎨 Design System

StayLeb uses a warm coastal visual identity.

Primary colors:

```text
Deep Teal        #157375
Turquoise        #46B1B1
Terracotta       #D1A695
Canvas           #E4ECEE
Surface          #FFFFFF
Primary Text     #1E293B
Muted Text       #64748B
```

The interface uses responsive cards, clean spacing, rounded surfaces, and consistent dashboard layouts across Client, Owner, and Admin experiences.

---

## 🧪 Testing

Backend endpoints can be tested using Swagger/OpenAPI.

Important flows to verify include:

- Registration and login
- Refresh token
- Password reset
- Property creation/editing
- Property approval
- Property search
- Availability
- Seasonal pricing
- Booking preview
- Booking creation
- Checkout expiration
- Cash payment
- Stripe PaymentIntent creation
- Stripe webhook confirmation
- Favorites
- AI Search
- Profile editing
- Cancellation/refunds
- Reviews

Frontend verification:

```bash
npx tsc --noEmit
npm run build
```

---

## 📌 Project Status

StayLeb is an actively developed full-stack project.

Major implemented areas include:

- Authentication & authorization
- Property management
- Admin property approval
- Amenities & rules
- Property images
- Seasonal pricing
- Availability management
- Property search
- Booking system
- Temporary checkout holds
- Cash payment workflow
- Stripe integration
- Favorites
- Client profile management
- AI property search
- AI property-description generation
- Cancellation/refund support
- Role-based dashboards

Further testing, UI refinement, and integration improvements may continue as the project evolves.

---

## 🎯 Project Goals

StayLeb was developed to demonstrate practical full-stack engineering concepts including:

- REST API design
- Relational database modeling
- Authentication and authorization
- Role-based access control
- Transactional booking workflows
- Payment processing
- Third-party service integration
- AI-assisted application features
- Server-side validation
- Responsive frontend development
- Real-world business logic

---

## 👩‍💻 Author

**Ghinwa Abou Sahyoun**

Full-Stack Web Developer

GitHub: `ghinwa927`

---

## 📄 License

This project was developed as a full-stack web development project.

If you plan to make the repository publicly reusable, add an appropriate open-source license before allowing redistribution or commercial reuse.

# Sessions Marketplace

A premium full-stack web application allowing users to book sessions with creators worldwide. Built for the Ahoum SpiritualTech Full-Stack Developer Assignment.

## 🚀 Tech Stack

*   **Frontend:** React, Vite, TypeScript, Zustand, Sonner (Toasts), react-datepicker, react-timezone-select
*   **Backend:** Django, Django REST Framework, PostgreSQL
*   **Infrastructure:** Docker, Docker Compose, Nginx Reverse Proxy
*   **Payments:** Stripe (Test Mode)
*   **Storage:** MinIO (S3-compatible Object Storage for Images)
*   **Security:** DRF Rate Limiting (Anon: 100/day, User: 1000/day), JWT Authentication

## 📋 Features
- **Roles:** User (can book) & Creator (can manage sessions). Role-based UI updates automatically.
- **Authentication:** Google OAuth2 login via JWT. Captures both first and last name from Google.
- **Profile Management:** Dedicated profile page (`/profile`) to update name and avatar (stored in MinIO).
- **Sessions & Booking Flow:** Full CRUD for Creators. Secure booking with Stripe payment integration.
- **Duplicate Booking Prevention:** Users cannot book the same session twice. Shows "Already Booked" status.
- **Payment Confirmation:** Booking status updates from PENDING → PAID after successful Stripe payment.
- **Currency:** Prices displayed in ₹ (INR). Stripe processes payments in INR.
- **Image Serving:** Images served through Nginx proxy to avoid CORS issues with MinIO.
- **Rate Limiting:** DRF throttling configured for anonymous (100/day) and authenticated (1000/day) users.
- **Premium UI:** Glassmorphism, animations, gradient accents, themed toast notifications.

## 🛢️ Database Information
If using DBeaver or other SQL clients:
- **Core User Table:** `users_customuser` (This is where you change `role`).
- **Sessions Table:** `catalog_session`.
- **Bookings Table:** `bookings_booking`.

## ⚙️ How to Run Locally

### Prerequisites
- Docker & Docker Compose installed on your machine (for Docker setup).
- Python 3.x and Node.js (for manual local setup).

### Option 1: Start using Docker (Recommended)

1. **Clone the repository** and navigate to the project root.

2. **Create your `.env` file:**
   ```bash
   cp .env.example .env
   ```
   *Edit the `.env` file to add your `GOOGLE_OAUTH2_CLIENT_ID` and Stripe keys.*

3. **Start the Multi-container Application:**
   ```bash
   docker-compose up --build
   ```

4. **Accessing the App:**
   - **Frontend:** http://localhost (Nginx proxies to frontend)
   - **Backend API:** http://localhost/api/
   - **Django Admin:** http://localhost/admin/
   - **MinIO Console:** http://localhost:9001 (Credentials: `minioadmin` / `minioadmin`)

### Option 2: Run Locally Without Docker (Manual Setup)

1. **Backend Setup:**
   ```bash
   cd backend
   # Activate your virtual environment (e.g., venv\Scripts\activate on Windows)
   pip install -r requirements.txt
   python manage.py migrate
   python manage.py runserver
   ```

2. **Frontend Setup:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

### OAuth Client Setup
1. Go to Google Cloud Console -> APIs & Services -> Credentials.
2. Create OAuth 2.0 Web Application credentials.
3. Set **Authorized JavaScript origins** to `http://localhost` and `http://localhost:5173`.
4. Copy the Client ID and paste it into `.env` as `VITE_GOOGLE_CLIENT_ID`.

## 💳 Stripe Test Mode

Payments are configured in **Stripe Test Mode** — no real money is charged. Use the following test card details:

| Field       | Value                    |
|-------------|--------------------------|
| Card Number | `4242 4242 4242 4242`    |
| Expiry      | `12/28`                  |
| CVC         | `123`                    |
| ZIP         | `90210`                  |

> ⚠️ **Important:** Set the session price to **₹38 or above** (approximately $0.50 USD). Stripe requires a minimum payment amount of $0.50 USD equivalent. Payments below this threshold will be rejected by Stripe.

### Stripe Environment Variables
Add these to your `.env` file (get them from https://dashboard.stripe.com/test/apikeys):
```
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
```

## 🎮 Demo Flow
1. Load `http://localhost`. Click **Start Session** to login via Google.
2. Go to **Profile** (click avatar in navbar). Update your name and upload an avatar.
3. Access Django Admin at `http://localhost/admin/` (create superuser: `docker-compose exec backend python manage.py createsuperuser`) and change your role to `CREATOR`.
4. Refresh. Navbar now shows **Create Session** instead of Dashboard.
5. Go to **Creator Studio**. Create a new session with a title, description, price (≥ ₹38), and image.
6. Login with a different Google account (User role). Browse sessions on the homepage.
7. Click a session → **Book Spot Now** → Enter test card details above → Pay.
8. After payment, the booking status updates to **PAID**.
9. If you try to book the same session again, it shows **"You have already booked this session"**.

## 🔒 Rate Limiting
DRF throttling is enabled globally:
- **Anonymous users:** 100 requests/day
- **Authenticated users:** 1000 requests/day

This is configured in `backend/core/settings.py` under `REST_FRAMEWORK['DEFAULT_THROTTLE_CLASSES']`.

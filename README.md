# ⚡ SaukiMart — Data & Devices

**Production-Grade Full-Stack Platform for Nigerian Data & Device Sales**

> Built for deployment on Vercel with Neon Database, Vercel Blob, Flutterwave, and Amigo API integration.

---

## 🌐 Live URLs
| Route | Purpose |
|-------|---------|
| `www.saukimart.online` | Corporate landing page |
| `www.saukimart.online/app` | Native-style mobile application (WebView-ready) |
| `www.saukimart.online/admin` | Super admin dashboard |
| `www.saukimart.online/privacy` | Privacy policy |

---

## 🚀 Quick Start

### 1. Clone & Install
```bash
git clone https://github.com/YOUR_ORG/saukimart.git
cd saukimart
npm install
```

### 2. Environment Variables
Copy `.env.example` to `.env.local` and fill in all values:
```bash
cp .env.example .env.local
```

**Required Variables:**
```env
# Database (Neon - get from Vercel dashboard)
DATABASE_URL=postgresql://...

# Auth
NEXTAUTH_URL=https://www.saukimart.online
NEXTAUTH_SECRET=<generate with: openssl rand -base64 32>

# Flutterwave (live keys for production)
FLW_SECRET_KEY=FLWSECK-...
FLW_PUBLIC_KEY=FLWPUBK-...
FLW_WEBHOOK_HASH=<your webhook secret hash>
MY_BVN=<BVN for virtual account creation>

# Amigo API (routed via AWS static IP proxy)
AMIGO_PROXY_URL=https://your-aws-server.com/api/data/
AMIGO_API_KEY=<your amigo api token>

# Vercel Blob
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...

# Admin credentials
ADMIN_EMAIL=admin@saukimart.online
ADMIN_PASSWORD=<strong-password>
```

### 3. Initialize Database
After deploying to Vercel (or running locally with DATABASE_URL set):
```bash
# Login to admin panel first, then call:
POST /api/admin/init-db
Authorization: Bearer <admin-token>
```
This creates all tables and seeds default data plans.

### 4. Run Locally
```bash
npm run dev
# Open http://localhost:3000
```

---

## 📁 Project Structure

```
saukimart/
├── app/
│   ├── page.tsx              # Landing page (www.saukimart.online)
│   ├── privacy/page.tsx      # Privacy policy page
│   ├── app/page.tsx          # Mobile app (WebView-ready)
│   ├── admin/page.tsx        # Admin dashboard
│   ├── layout.tsx            # Root layout + metadata
│   └── api/
│       ├── register/         # User registration + FLW virtual account
│       ├── login/            # PIN-based login
│       ├── user/             # User profile + preferences
│       ├── data-plans/       # List active data plans
│       ├── buy-data/         # Purchase data via Amigo (idempotent)
│       ├── products/         # Store products
│       ├── purchase-product/ # Buy store product
│       ├── transactions/     # User transactions
│       ├── deposits/         # Wallet deposits
│       ├── broadcasts/       # Marquee announcements
│       ├── chat/             # User support chat
│       ├── sim-activation/   # Airtel SIM activation
│       ├── upload/           # Vercel Blob image upload
│       ├── webhooks/
│       │   └── flutterwave/  # FLW webhook handler (auto-credits wallet)
│       └── admin/
│           ├── login/        # Admin auth
│           ├── init-db/      # DB init + seed
│           ├── users/        # User CRUD + ban/unban
│           ├── wallet/       # Credit/debit wallets
│           ├── plans/        # Data plan CRUD
│           ├── products/     # Product CRUD
│           ├── broadcasts/   # Broadcast CRUD
│           ├── sim-activations/ # SIM request management
│           ├── chat/         # Admin chat replies
│           ├── transactions/ # All transactions
│           ├── analytics/    # Sales calculator + profit
│           ├── webhooks/     # View FLW webhooks
│           ├── console/      # API console (Amigo/FLW)
│           └── settings/     # Site settings
├── lib/
│   ├── db.ts                 # Neon PostgreSQL client + schema
│   ├── auth.ts               # JWT helpers
│   ├── flutterwave.ts        # FLW API helpers
│   ├── amigo.ts              # Amigo proxy helpers
│   └── utils.ts              # Shared utilities
├── .env.example
├── next.config.js
├── package.json
└── tsconfig.json
```

---

## 🔧 Vercel Deployment

### 1. Connect GitHub
- Push code to GitHub
- Create new Vercel project from repository

### 2. Add Environment Variables
In Vercel dashboard → Settings → Environment Variables, add all variables from `.env.example`

### 3. Add Neon Database
- In Vercel dashboard → Storage → Create → Neon Postgres
- DATABASE_URL will be automatically added

### 4. Add Vercel Blob
- In Vercel dashboard → Storage → Create → Blob Store
- BLOB_READ_WRITE_TOKEN will be automatically added

### 5. Configure Flutterwave Webhook
In Flutterwave dashboard:
- Webhook URL: `https://www.saukimart.online/api/webhooks/flutterwave`
- Events: `charge.completed`
- Secret hash: same value as FLW_WEBHOOK_HASH env var

### 6. Configure Custom Domain
- Add `www.saukimart.online` in Vercel → Domains
- Update DNS records at your domain registrar

### 7. Initialize Database
After first deploy, visit `/admin`, login, then navigate to the admin console or use:
```
POST https://www.saukimart.online/api/admin/init-db
```

---

## 📱 WebView Setup (Android/iOS)

The `/app` route is optimized for WebView embedding:
- No external navigation
- Touch-optimized (no hover states)
- Safe area insets support
- Viewport locked (no zoom)
- iOS-style components

**Android WebView settings:**
```java
webView.getSettings().setJavaScriptEnabled(true);
webView.getSettings().setDomStorageEnabled(true);
webView.getSettings().setMediaPlaybackRequiresUserGesture(false);
webView.loadUrl("https://www.saukimart.online/app");
```

---

## 🔐 Security

- PINs: bcryptjs with 10 salt rounds (never stored plain text)
- Auth: JWT tokens (30-day expiry for users, 8-hour for admin)  
- Payments: Flutterwave PCI-DSS Level 1
- Webhook verification: HMAC signature check
- Idempotency: All Amigo calls include Idempotency-Key
- HTTPS: Enforced via Vercel
- Database: Neon serverless PostgreSQL with SSL

---

## 💰 Business Features

### Profit Calculator
Every data plan and product has a hidden `cost_price` field:
- Visible only in admin panel
- Profit = Selling Price − Cost Price
- Filter by: today, week, month, all-time

### Cashback System
- Wallet field: `cashback_balance`
- Admin can credit cashback manually
- Displayed separately in wallet card

### Sales Reports
Admin analytics endpoint returns:
- Total revenue, cost, profit
- Per-transaction profit breakdown
- Daily/weekly/monthly views

---

## 📞 Support Contacts
- Email: support@saukimart.online
- WhatsApp: +234 704 464 7081
- Phone: +234 806 193 4056

---

© 2026 SaukiMart: Data & Devices

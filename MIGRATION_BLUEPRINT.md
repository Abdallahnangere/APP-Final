# Sauki Mart Migration Blueprint
## Complete Environment Variables & Database Schema Extraction

**Purpose**: Use this document to rebuild Sauki Mart or any derivative without losing existing user data, transactions, or payment infrastructure.

**Last Updated**: March 2, 2026  
**Database Provider**: PostgreSQL  
**Current Deployment**: Next.js 14.1.0 on Vercel

---

## Part 1: Environment Variables (Complete Reference)

### All Required & Optional Environment Variables

These are **ALL** variables used across the codebase. Copy this structure to your new `.env.local` file.

```dotenv
# ═══════════════════════════════════════════════════════════════════════════════
# CRITICAL: DATABASE CONNECTION (REQUIRED - Nothing works without this)
# ═══════════════════════════════════════════════════════════════════════════════
DATABASE_URL=postgresql://username:password@host:port/database_name

# ─── PostgreSQL Connection String Breakdown ──────────────────────────────────
# Format: postgresql://[user]:[password]@[host]:[port]/[database]
# 
# Common Providers:
# - Supabase: postgresql://postgres:[password]@db.[region].supabase.co:5432/postgres
# - Railway: postgresql://[user]:[password]@[host]:5432/[dbname]
# - Render: postgresql://[user]:[password]@[host]:5432/[database]
# - Local: postgresql://postgres:password@localhost:5432/saukimart
# 
# ⚠️ CRITICAL: This is the ONLY connection to existing user data.
# Changing this breaks all agent accounts, transactions, balances.


# ═══════════════════════════════════════════════════════════════════════════════
# PAYMENT GATEWAY: FLUTTERWAVE (REQUIRED for payments)
# ═══════════════════════════════════════════════════════════════════════════════
# Get credentials: https://dashboard.flutterwave.com/settings/developer
#
# Risk Level: HIGH - Controls real money transfers and payment processing
# Loss Impact: If these change, new payments fail but old transactions remain

FLUTTERWAVE_PUBLIC_KEY=FLWPUBK_TEST_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
# Used by: Frontend for payment initiation (bank transfer start)
# Type: Public key, safe to expose in frontend code
# Context: Passed to Flutterwave checkout modal for customer payments

FLUTTERWAVE_SECRET_KEY=FLWSECK_TEST_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
# Used by: Backend payment verification and virtual account creation
# Type: PRIVATE - Never expose in client code
# Context: Used in `/api/webhook/flutterwave` for payment confirmation
# Context: Used in `/api/admin/console` for manual payment testing
# Context: Used in `/api/agent/register` for virtual account creation
# Files: lib/flutterwave.ts, app/api/**

FLUTTERWAVE_WEBHOOK_SECRET=your_webhook_secret_from_flutterwave_dashboard
# Used by: Server-side webhook signature verification
# Type: PRIVATE - Authenticate incoming Flutterwave callbacks
# Context: Validate webhook in `/api/webhook/flutterwave`
# Prevents: Fraudulent payment confirmations from fake sources
# Missing? Webhooks won't verify and payments won't be confirmed


# ═══════════════════════════════════════════════════════════════════════════════
# DATA PROVIDER: AMIGO (REQUIRED for data delivery)
# ═══════════════════════════════════════════════════════════════════════════════
# Get credentials: https://www.amigo.ng/admin
#
# Risk Level: HIGH - Direct integration with MTN/Airtel/Glo networks
# Loss Impact: If these change, data bundles cannot be delivered

AMIGO_BASE_URL=https://amigo.ng/api/data/
# API endpoint for Amigo data delivery service
# Used by: lib/amigo.ts → deliverData(), callAmigoAPI()
# Used by: All data delivery routes
# Default: https://amigo.ng/api/data/
# Note: Should NOT end with double slashes
# Alternative: Some regions use different URLs - check Amigo docs

AMIGO_API_KEY=your_amigo_api_key_from_dashboard
# Used by: Backend for Amigo API authentication
# Type: PRIVATE key
# Used in: lib/amigo.ts (amigoHeaders function)
# Used in: All data bundle delivery endpoints
# Impact: Without this, no MTN/Airtel/Glo data can be delivered
# Networks Supported: MTN (id:1), AIRTEL (id:2), GLO (id:3)

AWS_PROXY_URL=
# Optional: Corporate proxy for Amigo requests
# Leave empty if none needed
# Format: http://proxy.company.com:port or http://user:pass@proxy:port
# Used by: lib/amigo.ts only (when making requests)
# Default: Empty (no proxy)


# ═══════════════════════════════════════════════════════════════════════════════
# AUTHENTICATION & SECURITY (REQUIRED for admin access)
# ═══════════════════════════════════════════════════════════════════════════════

ADMIN_PASSWORD=your_strong_admin_password_here
# Used by: All `/api/admin/*` endpoints for authentication
# Type: Plain text, checked against submitted password
# Note: NOT hashed - all admin requests must match this exactly
# Impact: Anyone with this password can manage agents, transactions, products
# Used in: lib/auth.ts → verifyAdminPassword()
# Used in: Every admin endpoint for request validation
# Security: Use STRONG password with uppercase, numbers, special chars
# Better: Implement hash-based auth instead in new version

MY_BVN=12345678901
# Used by: Virtual account creation via Flutterwave
# Type: Your personal Bank Verification Number (11 digits)
# Impact: Agent virtual accounts created under this BVN
# Format: Exactly 11 numerical digits (no spaces or dashes)
# Used in: lib/flutterwave.ts → createVirtualAccount()
# Note: One BVN per system for all agents
# If Lost: Can still receive payments but cannot create new agent accounts
# Regulatory: Required by CBN for virtual account creation (AML compliance)


# ═══════════════════════════════════════════════════════════════════════════════
# FIREBASE: PUSH NOTIFICATIONS & MESSAGING (Optional)
# ═══════════════════════════════════════════════════════════════════════════════
# Get credentials: https://console.firebase.google.com → Project Settings
#
# Risk Level: MEDIUM - Affects notifications, not revenue
# Loss Impact: Push notifications won't work, but app still functional

FIREBASE_API_KEY=AIzaSyDzQrdnbhabk7_4cDHb1I-Ohbg3bKYCysI
# Used by: Client-side Firebase initialization
# Type: Public key, safe in frontend
# Used in: lib/firebaseClient.ts
# Impact: Missing = FCM won't initialize, push won't work
# Scope: Limited to your Firebase project

FIREBASE_PROJECT_ID=sauki-mart
# Firebase project identifier
# Used in: Multiple Firebase initializations
# Format: kebab-case (lowercase with dashes)
# Check: Must match your Firebase project ID exactly

FIREBASE_MESSAGING_SENDER_ID=228994084382
# Used by: FCM service worker registration
# Type: Public number from Firebase
# Format: 12 digits
# Used in: public/firebase-messaging-sw.js

FIREBASE_APP_ID=1:228994084382:web:b1079dd1898bb1da40880f
# Used by: Firebase SDK initialization
# Format: 1:number:web:hash
# Check: Must match your Firebase app ID exactly

FIREBASE_SERVICE_ACCOUNT_KEY=
# CRITICAL for backend: Firebase Admin SDK service account
# Type: PRIVATE - entire JSON file as string
# How to get:
#   1. Go to Firebase Console → Project Settings
#   2. Service Accounts tab → Generate new private key
#   3. Copy entire JSON and paste here (single line or multiline OK)
#   4. Ensure no extra quotes or escaping
#
# Example (minified):
# {"type":"service_account","project_id":"sauki-mart","private_key":"-----BEGIN PRIVATE KEY-----...","client_email":"...@iam.gserviceaccount.com",...}
#
# Used by: lib/firebase-admin.ts for server-side messaging
# Impact: Without this, admin push notifications fail
# Broadcast users: `/api/admin/push` relies on this
# Security: NEVER commit this to git - add to .gitignore


# ═══════════════════════════════════════════════════════════════════════════════
# APPLICATION CONFIGURATION (Public / Non-sensitive)
# ═══════════════════════════════════════════════════════════════════════════════

NEXT_PUBLIC_DOMAIN=www.saukimart.online
# Public domain/hostname where your app is hosted
# Used by: Frontend and backend for URL construction
# Used in: Meta tags, OG images, email templates, virtual account creation
# Files: lib/flutterwave.ts, app/layout.tsx (metadata)
# Format: domain.com (no https://, no trailing slash)
# Impact: If wrong, social sharing and email links break

NEXT_PUBLIC_API_URL=https://www.saukimart.online/api
# Used by: Frontend for all API calls
# Format: Full URL with https:// and /api path
# Used in: lib/api.ts for axios baseURL
# Default: https://[NEXT_PUBLIC_DOMAIN]/api
# Impact: If wrong, frontend cannot reach backend APIs

NODE_ENV=production
# Environment mode: development | production | test
# Used by: Next.js build and runtime
# Impact: logging verbosity, error handling, code optimization
# Development: Verbose logs, source maps, hot reload
# Production: Minified, optimized, minimal logging
# Should be: "production" for live deployments


# ═══════════════════════════════════════════════════════════════════════════════
# OPTIONAL: AI FEATURES
# ═══════════════════════════════════════════════════════════════════════════════

GEMINI_API_KEY=
# Optional: Google Gemini API key for AI features
# If empty: AI features are disabled (gracefully)
# Not currently used in codebase, but prepared for future AI features
# Get from: https://ai.google.dev/


# ═══════════════════════════════════════════════════════════════════════════════
# DEPRECATED / LEGACY (DO NOT USE)
# ═══════════════════════════════════════════════════════════════════════════════
# The following were used in old versions but are no longer needed:
# - NEXT_PUBLIC_FCM_VAPID_KEY (replaced by Firebase setup)
# - STRIPE_* (Flutterwave is now primary)
```

---

## Part 2: Environment Variable Usage Map

### By Feature/Component

| Feature | Required Vars | Files | API Routes | Impact |
|---------|---------------|-------|-----------|--------|
| **Agent Registration** | `DATABASE_URL`, `FLUTTERWAVE_SECRET_KEY`, `MY_BVN`, `NEXT_PUBLIC_DOMAIN` | lib/prisma.ts, lib/flutterwave.ts | `/api/agent/register` | Creates virtual accounts |
| **Data Delivery** | `DATABASE_URL`, `AMIGO_BASE_URL`, `AMIGO_API_KEY` | lib/amigo.ts, lib/prisma.ts | `/api/data/initiate-payment`, `/api/agent/purchase` | Delivers MTN/Airtel/Glo bundles |
| **Payment Processing** | `DATABASE_URL`, `FLUTTERWAVE_SECRET_KEY`, `FLUTTERWAVE_WEBHOOK_SECRET` | lib/flutterwave.ts, lib/prisma.ts | `/api/webhook/flutterwave` | Confirms customer payments |
| **Admin Dashboard** | `ADMIN_PASSWORD`, `FLUTTERWAVE_SECRET_KEY`, `AMIGO_API_KEY` | lib/auth.ts | All `/api/admin/*` | Manages all operations |
| **Push Notifications** | `FIREBASE_SERVICE_ACCOUNT_KEY`, `FIREBASE_PROJECT_ID` | lib/firebase-admin.ts | `/api/admin/push` | Sends push notifications |
| **Frontend** | `NEXT_PUBLIC_DOMAIN`, `NEXT_PUBLIC_API_URL`, `FIREBASE_API_KEY` | Client-side code | N/A | Enables web UI |
| **Logging/Monitoring** | `NODE_ENV` | lib/logger.ts | All endpoints | Changes log output format |

---

## Part 3: Complete Database Schema

### Overview
- **Database Type**: PostgreSQL
- **ORM**: Prisma 5.10.2
- **Models**: 9 tables
- **Relationships**: Parent-child through foreign keys

### All 9 Database Models (Complete Structure)

#### 1. **Product** (E-commerce Items)
```sql
CREATE TABLE "Product" (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            VARCHAR NOT NULL,
  description     VARCHAR,
  price           FLOAT NOT NULL,
  image           VARCHAR NOT NULL,
  inStock         BOOLEAN DEFAULT true,
  category        VARCHAR DEFAULT 'device',  -- device | sim | package
  createdAt       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes: None (small table, full scans fine)
-- Relations: Referenced by Transaction.productId
```

**Usage**: E-commerce product listings (devices, SIM cards, packages)  
**Data Preservation**: Products can be recreated from backup  
**Cascading**: If deleted, transactions remain with null productId

---

#### 2. **DataPlan** (Mobile Data Bundles)
```sql
CREATE TABLE "DataPlan" (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  network         VARCHAR NOT NULL,  -- MTN | AIRTEL | GLO
  data            VARCHAR NOT NULL,  -- "5GB", "2GB", etc
  validity        VARCHAR NOT NULL,  -- "30 Days", "7 Days", etc
  price           FLOAT NOT NULL,
  planId          INTEGER NOT NULL,  -- Amigo platform ID (critical!)
  createdAt       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes: None standard, but consider adding on network
-- Relations: Referenced by Transaction.planId
-- Critical Field: planId (must match Amigo's plan IDs)
```

**Usage**: Available data plans for purchase  
**Data Preservation**: CRITICAL - planId must match Amigo's system  
**Mapping**: 
- MTN plans → network_id 1 in Amigo API
- AIRTEL plans → network_id 2 in Amigo API
- GLO plans → network_id 3 in Amigo API

---

#### 3. **Agent** (Resellers/Distributors)
```sql
CREATE TABLE "Agent" (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  firstName           VARCHAR NOT NULL,
  lastName            VARCHAR NOT NULL,
  phone               VARCHAR UNIQUE NOT NULL,  -- Unique identifier
  pin                 VARCHAR NOT NULL,  -- bcryptjs hashed (10 rounds)
  balance             FLOAT DEFAULT 0.0,  -- Wallet for funded orders
  cashbackBalance     FLOAT DEFAULT 0.0,  -- Available cashback to withdraw
  totalCashbackEarned FLOAT DEFAULT 0.0,  -- Lifetime earned (audit trail)
  cashbackRedeemed    FLOAT DEFAULT 0.0,  -- Cumulative withdrawn
  isActive            BOOLEAN DEFAULT true,  -- Soft delete flag
  
  -- Flutterwave Virtual Account (auto-created on registration)
  flwAccountNumber    VARCHAR,  -- Virtual account number (10-15 digits)
  flwAccountName      VARCHAR,  -- Account display name
  flwBankName         VARCHAR,  -- Bank name (e.g., "Wema Bank")
  
  createdAt           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt           TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes: phone (UNIQUE), for lookups
-- Relations: HasMany Transaction, HasMany CashbackEntry
-- Password Storage: PIN is bcryptjs hashed with SALT_ROUNDS=10
```

**Usage**: Agent/reseller accounts with wallet and cashback tracking  
**Data Preservation**: CRITICAL - Contains customer balances and account data  
**Loss Impact**: If this table is lost, all agent accounts are gone

**PIN Hashing**: 
- Stored as: `bcryptjs.hash(pin, 10)`
- Verified by: `bcryptjs.compare(enteredPin, hashedPin)`
- Upgrade Path: If rebuilding, use same bcryptjs approach

**Virtual Account**: 
- Created automatically during registration
- Maps phone → FLW account number
- If account already exists in Flutterwave, must link manually

---

#### 4. **Transaction** (All Financial Records)
```sql
CREATE TABLE "Transaction" (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tx_ref              VARCHAR UNIQUE NOT NULL,  -- Idempotent key (SAUKI-TYPE-TS-RAND)
  type                VARCHAR NOT NULL,  -- data | ecommerce | wallet_funding
  status              VARCHAR DEFAULT 'pending',  -- pending | paid | delivered | failed
  phone               VARCHAR NOT NULL,  -- Customer recipient phone
  amount              FLOAT NOT NULL,  -- Cost to customer
  
  agentCashbackAmount FLOAT DEFAULT 0,  -- Cashback earned on this transaction
  cashbackProcessed   BOOLEAN DEFAULT false,  -- Flag: was cashback already applied?
  
  -- Foreign Keys
  productId           UUID,  -- Link to Product (nullable)
  product             Product (if productId set),
  planId              UUID,  -- Link to DataPlan (nullable)
  dataPlan            DataPlan (if planId set),
  agentId             UUID,  -- Link to Agent (nullable)
  agent               Agent (if agentId set),
  
  -- Customer Info
  customerName        VARCHAR,  -- Name on receipt
  deliveryState       VARCHAR,  -- Delivery location
  
  -- Deduplication
  idempotencyKey      VARCHAR UNIQUE,  -- Prevent double-processing
  
  -- Raw API Responses
  paymentData         JSON,  -- Flutterwave response (full object)
  deliveryData        JSON,  -- Amigo response (full object)
  
  createdAt           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt           TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes: phone, tx_ref (both UNIQUE), status, agentId, createdAt
-- These are CRITICAL for performance (millions of rows expected)
-- Relations: BelongsTo Product, DataPlan, Agent
```

**Usage**: Complete audit trail of all transactions  
**Data Preservation**: CRITICAL - Complete financial history  
**Loss Impact**: Losing this = losing all payment records, customer receipts, agent earnings

**Status Flow**:
```
pending → paid (after payment gateway confirms) → delivered/failed (after data/ecommerce fulfillment)
```

**Fields Explained**:
- `tx_ref`: Unique identifier for idempotency (prevents duplicate charges)
- `type`: Determines what was bought (mobile data, e-commerce item, or agent wallet top-up)
- `agentId`: NULL = customer direct purchase, SET = agent purchase with cashback
- `paymentData`: Store entire Flutterwave JSON response for debugging
- `deliveryData`: Store entire Amigo JSON response for debugging

---

#### 5. **SupportTicket** (Customer Support)
```sql
CREATE TABLE "SupportTicket" (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone     VARCHAR NOT NULL,  -- Customer phone
  message   VARCHAR NOT NULL,  -- Support request
  status    VARCHAR DEFAULT 'open',  -- open | closed
  reply     VARCHAR,  -- Admin response
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes: phone
-- Relations: None (standalone)
-- No payment impact if lost
```

**Usage**: Customer support requests and admin responses  
**Data Preservation**: Useful but not critical  
**Recovery**: Manual re-entry possible if tickets are important

---

#### 6. **SystemMessage** (Admin Announcements)
```sql
CREATE TABLE "SystemMessage" (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content   VARCHAR NOT NULL,  -- Message text
  type      VARCHAR DEFAULT 'info',  -- info | warning | error | success
  isActive  BOOLEAN DEFAULT true,  -- Soft delete / disable
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes: None (small table)
-- Relations: None
-- Impact: Lost messages won't show to users
```

**Usage**: System-wide announcements and ticker messages  
**Data Preservation**: Can be regenerated  
**Recovery**: Screenshot or backup if important messaging present

---

#### 7. **WebhookLog** (Audit Trail)
```sql
CREATE TABLE "WebhookLog" (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source    VARCHAR NOT NULL,  -- flutterwave | amigo
  payload   JSON NOT NULL,  -- Full webhook JSON received
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes: source, createdAt
-- Relations: None
-- Purpose: Debugging and compliance audit
```

**Usage**: Complete record of all incoming webhooks  
**Data Preservation**: Important for debugging payment issues  
**Recovery**: Can be lost without functional impact (but loses debugging data)

**Examples**:
- Flutterwave webhook when payment received
- Amigo webhook when data delivered or failed

---

#### 8. **PushSubscription** (Firebase Messaging)
```sql
CREATE TABLE "PushSubscription" (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint  VARCHAR UNIQUE NOT NULL,  -- FCM subscription endpoint
  p256dh    VARCHAR NOT NULL,  -- Encryption public key
  auth      VARCHAR NOT NULL,  -- Authentication secret
  phone     VARCHAR,  -- Associated customer phone (optional)
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes: endpoint (UNIQUE), phone
-- Relations: Optional link to phone (no Agent FK)
-- Purpose: Send push notifications to subscribed devices
```

**Usage**: Store FCM subscription details for push notifications  
**Data Preservation**: Can be regenerated (users re-subscribe on new site)  
**Recovery**: If lost, users update subscription on next visit

---

#### 9. **CashbackEntry** (Cashback Ledger)
```sql
CREATE TABLE "CashbackEntry" (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agentId       UUID NOT NULL FOREIGN KEY,  -- Reference to Agent
  agent         Agent,  -- Relation
  type          VARCHAR NOT NULL,  -- earned | redeemed
  amount        FLOAT NOT NULL,
  transactionId VARCHAR,  -- Link to Transaction (if relevant)
  description   VARCHAR,
  createdAt     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes: agentId, createdAt
-- Relations: BelongsTo Agent
-- Purpose: Detailed ledger of all cashback movements
```

**Usage**: Detailed cashback history for auditing  
**Data Preservation**: IMPORTANT - Ensures accurate agent cashback accounting  
**Recovery**: Can be recalculated from Transaction records if needed

**Example Flow**:
1. Agent makes sale (Transaction created) → type = "earned"
2. Agent requests withdrawal → CashbackEntry type = "redeemed"
3. Admin approves → Updates Agent.cashbackRedeemed

---

## Part 4: Data Relationships Diagram

```
Agent (reseller)
  ├─→ has many Transaction (purchases made by this agent)
  │                      ├─→ linked to Product OR DataPlan
  │                      └─→ has paymentData (Flutterwave JSON)
  │                      └─→ has deliveryData (Amigo JSON)
  │
  └─→ has many CashbackEntry (earning/redeeming history)

Product
  └─→ has many Transaction (times sold)

DataPlan (MTN 5GB, Airtel 2GB, etc)
  ├─→ has many Transaction (times purchased)
  └─→ CRITICAL LINK: planId must match Amigo platform IDs
                      MTN:1, AIRTEL:2, GLO:3 (in Amigo API)

Transaction
  ├─→ belongs to Product (nullable, for ecommerce sales)
  ├─→ belongs to DataPlan (nullable, for data purchases)
  ├─→ belongs to Agent (nullable, for agent resales)
  ├─→ has paymentData (JSON from Flutterwave)
  └─→ has deliveryData (JSON from Amigo or system)

SupportTicket (standalone, no relations)
SystemMessage (standalone, no relations)
WebhookLog (audit only, no relations)

PushSubscription
  └─→ optional link to phone (not a FK)

CashbackEntry
  └─→ belongs to Agent (mandatory FK)
  └─→ references Transaction.transactionId (optional, for context)
```

---

## Part 5: Critical Data Preservation Checklist

### DO NOT LOSE (Mission-Critical)
- [ ] `Agent` table - Contains all reseller/agent accounts
- [ ] `Transaction` table - Complete payment/order history
- [ ] `DataPlan` table - Must include correct Amigo API planIds
- [ ] `CashbackEntry` table - Agent earnings records

### IMPORTANT TO PRESERVE (High Value)
- [ ] `Product` table - E-commerce inventory
- [ ] `WebhookLog` table - Debug painful payment issues
- [ ] `PushSubscription` table - User preferences

### CAN RECOVER (Lower Priority)
- [ ] `SupportTicket` table - Customer support tickets (can be recreated)
- [ ] `SystemMessage` table - Announcements (can be re-posted)

---

## Part 6: Migration Workflow for New Website

### Step 1: Database Export (From Old System)
```bash
# Export existing database (keep backup)
pg_dump -U postgres saukimart > saukimart_backup_2026-03-02.sql

# Verify backup worked
file saukimart_backup_2026-03-02.sql
wc -l saukimart_backup_2026-03-02.sql  # Should be thousands of lines
```

### Step 2: Database Setup (New System)
```bash
# New PostgreSQL instance (Supabase, Railway, etc)
# Create database: saukimart

# Run Prisma schema initialization
npx prisma db push

# Import old data (if reusing same database)
# OR restore from backup if migrating databases
psql saukimart < saukimart_backup_2026-03-02.sql
```

### Step 3: Environment Variables (New System)
Copy all variables from Part 1 section into `.env.local`:
- `DATABASE_URL` - CRITICAL: Point to existing PostgreSQL
- `FLUTTERWAVE_*` - Same keys as old system
- `AMIGO_*` - Same keys as old system
- `FIREBASE_*` - Same keys as old system
- `ADMIN_PASSWORD` - Same password as old system
- `MY_BVN` - Same BVN as old system
- `NEXT_PUBLIC_DOMAIN` - Update to new domain if changed
- `NEXT_PUBLIC_API_URL` - Update if domain changed

### Step 4: Verification
```bash
# Test database connection
npx prisma db execute --stdin < /dev/null

# Count existing records
npx prisma client -c "Agent.count()"
npx prisma client -c "Transaction.count()"

# Verify Agent accounts still accessible
# Login with known agent phone + PIN

# Verify payments working
# Test a small transaction through new system
```

### Step 5: Go-Live
1. Update DNS to point to new system
2. Keep old system running for 48 hours (fallback)
3. Monitor for payment/delivery issues
4. Disable old system once stable

---

## Part 7: Environment Variable Secrets Management Best Practices

### NEVER Do This
❌ Commit `.env.local` to git  
❌ Share secrets in Slack/email  
❌ Log sensitive values in error messages  
❌ Use same password for multiple systems  
❌ Hardcode secrets in source code

### Always Do This
✅ Add `.env.local` to `.gitignore`  
✅ Use deployment platform's secret manager (Vercel, Railway, etc)  
✅ Rotate secrets periodically (quarterly minimum)  
✅ Use strong passwords (16+ chars, mixed case, numbers, symbols)  
✅ Audit who has access to secrets  
✅ Enable 2FA on all external service accounts (Flutterwave, Firebase, etc)

### Rotation Schedule
| Secret | Frequency | Impact | Method |
|--------|-----------|--------|--------|
| ADMIN_PASSWORD | Quarterly | Medium | Update in .env, restart |
| FLUTTERWAVE_SECRET | Annually | High | Generate new key on Flutterwave, test in staging |
| AMIGO_API_KEY | Annually | High | Request new key from Amigo, test before rollout |
| FIREBASE_SERVICE_ACCOUNT | Bi-annually | Medium | Generate new key in Firebase Console |
| DATABASE_PASSWORD | Annually | Critical | Plan for database restart |

---

## Part 8: Troubleshooting Connection Issues

### "Cannot find module 'amigo'"
- Check: `AMIGO_BASE_URL` and `AMIGO_API_KEY` are set
- Check: `/lib/amigo.ts` file exists
- Check: Proper import: `import { deliverData } from '../../../../lib/amigo'`

### "Flutterwave payment failing"
- Check: `FLUTTERWAVE_SECRET_KEY` is correct
- Check: `FLUTTERWAVE_PUBLIC_KEY` in frontend matches
- Check: `FLUTTERWAVE_WEBHOOK_SECRET` matches Flutterwave dashboard
- Test: Use Flutterwave console at `/api/admin/console/flutterwave`

### "Database connection refused"
- Check: `DATABASE_URL` format is correct
- Check: PostgreSQL server is running
- Check: Network access allowed (firewall rules)
- Test: `npx prisma db execute --stdin < /dev/null`

### "Admin login not working"
- Check: `ADMIN_PASSWORD` is exact match (case-sensitive)
- Check: No leading/trailing spaces in env file
- Test: Try logging in with known password

### "Push notifications not sending"
- Check: Firebase is optional - app works without it
- Check: `FIREBASE_SERVICE_ACCOUNT_KEY` is valid JSON
- Check: Firebase project exists and Cloud Messaging enabled
- Test: Check Firebase Console → Cloud Messaging tab

### "Data plans not delivering"
- Check: `AMIGO_API_KEY` is active (not expired)
- Check: DataPlan.planId matches Amigo's platform IDs
- Check: Customer has sufficient balance
- Check: Phone number format correct (format validation in routes)
- Test: Try test transaction in admin console

---

## Part 9: Checklists for New Website Build

### Pre-Build Checklist
- [ ] Export old database: `pg_dump saukimart > backup.sql`
- [ ] Get all credentials from old system's `.env.local`
- [ ] Screenshot current Agent list (verification)
- [ ] Screenshot current DataPlan list
- [ ] Prepare database credentials (new provider)

### Post-Build Checklist
- [ ] Set all environment variables in `.env.local`
- [ ] Run `npx prisma db push`
- [ ] Verify Agent count matches old system
- [ ] Verify DataPlan count matches
- [ ] Test admin login with old password
- [ ] Test agent login with known account
- [ ] Test data plan purchase (small amount)
- [ ] Verify transaction appears in database
- [ ] Check webhook logs for payment confirmation
- [ ] Verify Amigo data delivery (check status)

### Production Deployment Checklist
- [ ] Set all environment variables in deployment platform
- [ ] Run database migrations on production
- [ ] Update DNS to point to new system
- [ ] Verify SSL certificate
- [ ] Test payment webhook signature verification
- [ ] Monitor error logs for first hour
- [ ] Notify agents of new system (send announcement)
- [ ] Keep old system online for 48 hours
- [ ] After 48 hours, decommission old system

---

## Part 10: Reference Tables

### Amigo Network IDs (CRITICAL FOR DATA DELIVERY)
| Network | API ID | Used In |
|---------|--------|---------|
| MTN | 1 | DataPlan + callAmigoAPI calls |
| AIRTEL | 2 | DataPlan + callAmigoAPI calls |
| GLO | 3 | DataPlan + callAmigoAPI calls |

**⚠️ CRITICAL**: If you change these IDs, data delivery will fail for all plans!

### Transaction Status Values
| Status | Meaning | Next State | Recoverable? |
|--------|---------|-----------|--------------|
| pending | Payment received, awaiting delivery | paid, failed | Yes, in transaction log |
| paid | Payment confirmed | delivered, failed | Yes, Flutterwave has record |
| delivered | Data/product delivered successfully | (terminal) | Yes, Amigo has record |
| failed | Delivery failed or payment issues | pending (retry) | Maybe, check logs |

### Agent Account States
| Property | Value | Meaning |
|----------|-------|---------|
| isActive | true | Account enabled, can login |
| isActive | false | Account disabled (soft delete) |
| flwAccountNumber | null | Virtual account not yet created |
| flwAccountNumber | set | Ready to receive payments |

---

## Summary

This document provides:
1. **Complete environment variable reference** - Copy/paste ready
2. **Full database schema** - 9 tables with relationships
3. **Data preservation guide** - What mustn't be lost
4. **Migration workflow** - Step-by-step setup for new system
5. **Troubleshooting guide** - Common issues and fixes

**Before abandoning the old system:**
1. Export database: `pg_dump saukimart > backup.sql`
2. Export this document to a secure location
3. Ensure all environment variables are backed up
4. Run final verification that new system is working
5. Give 7-day notice to agents (backup system available)

**Key Point**: The database is your source of truth. With correct `DATABASE_URL` and all Flutterwave/Amigo keys, a new website will seamlessly connect to existing users and continue operating without any data loss.

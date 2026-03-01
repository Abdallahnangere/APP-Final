# 🚀 Sauki Mart - Complete Application Documentation

**Last Updated:** March 1, 2026  
**Version:** 1.0.0  
**App Name:** Sauki Mart  
**Domain:** https://www.saukimart.online  
**Status:** Production

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Key Features](#key-features)
3. [Technology Stack](#technology-stack)
4. [Application Architecture](#application-architecture)
5. [Database Schema & Models](#database-schema--models)
6. [Environment Variables](#environment-variables)
7. [Admin System](#admin-system)
8. [Agent System](#agent-system)
9. [Payment Processing](#payment-processing)
10. [API Routes & Endpoints](#api-routes--endpoints)
11. [Security & Authentication](#security--authentication)
12. [Frontend Components](#frontend-components)
13. [External Integrations](#external-integrations)
14. [Logging & Monitoring](#logging--monitoring)
15. [Deployment & Hosting](#deployment--hosting)
16. [Development Setup](#development-setup)

---

## Overview

**Sauki Mart** is Nigeria's leading digital commerce and telecommunications platform built with Next.js 14, React 18, and PostgreSQL. It provides:

- ✅ **Instant Mobile Data & Airtime** - Buy data from MTN, Airtel, and Glo
- ✅ **Premium E-commerce Store** - Gadgets and electronics
- ✅ **Agent Network System** - Multi-level commission structure with cashback rewards
- ✅ **Secure Payment Gateway** - Integrated with Flutterwave
- ✅ **Real-time Notifications** - Firebase Cloud Messaging (FCM)
- ✅ **Progressive Web App (PWA)** - Installable on mobile devices
- ✅ **Admin Dashboard** - Comprehensive management console
- ✅ **Advanced Security** - Rate limiting, PIN hashing, request validation

**Target Users:**
- Customers (general users)
- Agents (resellers earning commissions)
- Administrators (platform management)

---

## Key Features

### 🎯 For Customers

#### 1. **Data Bundle Purchase**
- Buy instant data bundles for MTN, Airtel, Glo
- Multiple duration options (7 days, 30 days, 90 days, etc.)
- Real-time delivery status
- Transaction history tracking
- Receipt download capability

#### 2. **E-commerce Store**
- Browse premium gadgets and accessories
- Secure checkout with Flutterwave
- Optional SIM card add-on purchase
- Order tracking and delivery confirmation
- Free delivery to specified state

#### 3. **Transaction Tracking**
- View complete transaction history
- Filter by status (pending, paid, delivered, failed)
- Search and organize transactions by date
- Download receipt as image (PNG/JPG)
- Share receipt via social media

#### 4. **Support System**
- Create support tickets
- Track support ticket status
- Real-time messaging
- Support ticket history

#### 5. **System Notifications**
- Promotional campaigns via system messages
- Ticker/marquee announcements
- Push notifications (FCM)
- In-app toast notifications

### 🤝 For Agents

#### 1. **Agent Registration**
- Register with phone number and 4-digit PIN
- Automatic Flutterwave virtual account creation
- Bank account details for easy wallet funding

#### 2. **Agent Wallet System**
- Check real-time wallet balance
- Fund wallet via bank transfer to Flutterwave account
- Make purchases directly from wallet

#### 3. **Reseller Capabilities**
- Sell data bundles to customers
- Sell e-commerce products from inventory
- Earn 2% cashback on each transaction
- Withdraw cashback balance

#### 4. **Transaction History**
- View agent-specific transactions
- Track earnings and cashback
- Download transaction reports

#### 5. **Cashback System**
- Automatic 2% cashback on agent purchases
- Cashback balance tracking
- Redeem cashback to main wallet
- Cashback transaction history

### 👨‍💼 For Administrators

#### 1. **Dashboard**
- Key metrics and statistics
- Real-time transaction monitoring
- Agent performance overview
- System health status

#### 2. **Product Management**
- Create/Edit/Delete products
- Manage inventory and pricing
- Bulk product input
- Product category management

#### 3. **Data Plan Management**
- Configure data plans for each network
- Set pricing and validity periods
- Manage plan availability

#### 4. **Transaction Management**
- View all transactions
- Filter by date, status, type
- Update transaction delivery status
- Manual transaction verification

#### 5. **Agent Management**
- View all agents and their details
- Manual balance credit/debit
- Agent status toggling (activate/suspend)
- Agent performance analytics
- Transaction history per agent

#### 6. **Support Management**
- View all support tickets
- Respond to customer queries
- Track ticket resolution

#### 7. **System Communication**
- Broadcast system messages
- Create ticker announcements
- Send push notifications to all/agents/users
- System message scheduling

#### 8. **Webhook Management**
- Monitor payment webhooks
- View webhook logs
- Webhook retry mechanism

#### 9. **Advanced Console**
- Direct API testing to Amigo and Flutterwave
- Custom HTTP requests (GET/POST)
- Console output for debugging
- Payload inspection

---

## Technology Stack

### **Frontend**
- **Framework:** Next.js 14.1.0
- **UI Library:** React 18.2.0
- **Animation:** Framer Motion 11.0.8
- **Styling:** Tailwind CSS 3.4.1
- **Icons:** Lucide React 0.344.0
- **Utilities:** Clsx, Tailwind Merge
- **Image Handling:** html-to-image, jsPDF
- **Formatting:** Date-fns (implied usage)

### **Backend**
- **Runtime:** Node.js (Next.js API Routes)
- **Framework:** Next.js 14.1.0 (API Routes)
- **Validation:** Zod 3.22.4
- **HTTP Client:** Axios 1.6.7

### **Database**
- **DBMS:** PostgreSQL
- **ORM:** Prisma 5.10.2
- **Migrations:** Prisma Migrations

### **Security**
- **Password Hashing:** bcryptjs 3.0.3
- **API Authentication:** Environment-based secret keys
- **Rate Limiting:** Custom in-memory rate limiter
- **Request Validation:** Zod schemas

### **Payment Gateway**
- **Primary:** Flutterwave
- **Data Provider:** Amigo API
- **HTTP Agent:** https-proxy-agent (for proxy support)

### **Messaging & Notifications**
- **Push Notifications:** Firebase Cloud Messaging (FCM)
- **Web Push:** web-push 3.6.7
- **Client SDK:** firebase 10.11.0
- **Admin SDK:** firebase-admin 11.11.0

### **Deployment & Hosting**
- **Hosting:** Vercel (Next.js optimized)
- **Environment:** Production
- **PWA:** Service Workers for offline support

### **Development Tools**
- **Language:** TypeScript 5.3.3
- **Compiler:** ts-node 10.9.2
- **Linting:** ESLint
- **Code Formatting:** PostCSS, Autoprefixer

---

## Application Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      NEXT.JS FRONTEND (React 18)            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  Home Page   │  │  Data Screen │  │  E-commerce     │  │
│  │  (Marketing) │  │  (Data Cust) │  │  Store          │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  Agent Login │  │  Admin Panel │  │  Support        │  │
│  │              │  │  (Dashboard) │  │  (Tickets)      │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
└──────────────────────┬──────────────────────────────────────┘
                       │ API Calls (Fetch/Axios)
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                   NEXT.JS API ROUTES (Backend)              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │         /api/auth          (Admin & Agent Auth)        │ │
│  │  /api/agent/register, /api/agent/login, ...            │ │
│  │  /api/admin/auth, /api/admin/agents, ...               │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │    /api/data & /api/ecommerce (Payment Initiation)    │ │
│  │  POST /api/data/initiate-payment                       │ │
│  │  POST /api/ecommerce/initiate-payment                  │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │      /api/webhook/flutterwave (Payment Webhook)        │ │
│  │   Handles payment confirmation & wallet funding        │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │    /api/agent/purchase (Agent Wallet Purchase)         │ │
│  │   Verify agent, deduct balance, call Amigo API         │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │     /api/transactions, /api/products, /api/admin       │ │
│  │            (Data Management & Admin)                   │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────┬─────────────────────────────────────────┬────────┘
           │                                         │
           ▼                                         ▼
    ┌──────────────────┐              ┌────────────────────────┐
    │  PostgreSQL DB   │              │  Flutterwave API       │
    │  (via Prisma)    │              │  (Payment Processing)  │
    │                  │              └────────────────────────┘
    │ - Products       │
    │ - DataPlans      │              ┌────────────────────────┐
    │ - Agents         │              │  Amigo API             │
    │ - Transactions   │              │  (Data Delivery)       │
    │ - SupportTickets │              └────────────────────────┘
    │ - PushSubs       │
    │ - CashbackEntries│              ┌────────────────────────┐
    └──────────────────┘              │  Firebase FCM          │
                                      │  (Push Notifications)  │
                                      └────────────────────────┘
```

### **Data Flow - Customer Purchase (Data Bundle)**

```
1. Customer enters phone & selects data plan
   ↓
2. Frontend calls POST /api/data/initiate-payment
   ↓
3. Backend validates request, creates transaction (pending)
   ↓
4. Backend calls Flutterwave API (/v3/charges)
   ↓
5. Flutterwave returns bank account details
   ↓
6. Frontend displays bank details to customer
   ↓
7. Customer transfers money to bank account
   ↓
8. Flutterwave webhook POST /api/webhook/flutterwave (with payment proof)
   ↓
9. Backend verifies webhook signature & payment status
   ↓
10. Backend updates transaction to 'paid'
   ↓
11. Backend calls Amigo API to deliver data
   ↓
12. Amigo responds with delivery status
   ↓
13. Backend updates transaction to 'delivered'
   ↓
14. Firebase sends push notification to customer
```

### **Data Flow - Agent Wallet Purchase**

```
1. Agent logs in with phone + 4-digit PIN
   ↓
2. Agent selects data/ecommerce and confirms with PIN
   ↓
3. Frontend calls POST /api/agent/purchase
   ↓
4. Backend verifies PIN hash against stored PIN
   ↓
5. Backend verifies agent balance >= purchase amount
   ↓
6. Backend pre-verifies with Amigo API (for data)
   ↓
7. If verified, backend deducts balance from agent wallet
   ↓
8. Backend calculates 2% cashback
   ↓
9. Backend creates transaction record (delivered)
   ↓
10. Backend creates cashback entry
    ↓
11. Frontend receives success response with transaction details
    ↓
12. Agent can now share or download receipt
```

---

## Database Schema & Models

### **1. Product Model**
```typescript
Product {
  id:          String  @id @default(uuid())
  name:        String
  description: String?
  price:       Float
  image:       String
  inStock:     Boolean @default(true)
  category:    String  @default("device")  // device/sim/package
  createdAt:   DateTime @default(now())
  updatedAt:   DateTime @updatedAt
  transactions: Transaction[]  // Relation
}
```

**Purpose:** Stores e-commerce products (gadgets, accessories, SIM cards)

---

### **2. DataPlan Model**
```typescript
DataPlan {
  id:         String  @id @default(uuid())
  network:    String  // MTN, AIRTEL, GLO
  data:       String  // e.g., "5GB", "10GB"
  validity:   String  // e.g., "30 Days"
  price:      Float
  planId:     Int     // Amigo API plan ID
  createdAt:  DateTime @default(now())
  updatedAt:  DateTime @updatedAt
  transactions: Transaction[]  // Relation
}
```

**Purpose:** Stores mobile data plan configurations

---

### **3. Agent Model**
```typescript
Agent {
  id:                  String    @id @default(uuid())
  firstName:           String
  lastName:            String
  phone:               String    @unique  // Unique identifier for agent
  pin:                 String    // bcryptjs hashed 4-digit PIN
  balance:             Float     @default(0.0)  // Wallet balance
  cashbackBalance:     Float     @default(0.0)  // Redeemable cashback
  totalCashbackEarned: Float     @default(0.0)  // Lifetime earnings
  cashbackRedeemed:    Float     @default(0.0)  // Redeemed amount
  isActive:            Boolean   @default(true)  // Admin can suspend
  
  // Flutterwave Virtual Account Details
  flwAccountNumber:    String?
  flwAccountName:      String?
  flwBankName:         String?
  
  createdAt:           DateTime  @default(now())
  updatedAt:           DateTime  @updatedAt
  transactions:        Transaction[]
  cashbackHistory:     CashbackEntry[]
}
```

**Purpose:** Stores agent credentials, wallet balance, and virtual account info

---

### **4. Transaction Model**
```typescript
Transaction {
  id:                 String    @id @default(uuid())
  tx_ref:             String    @unique  // Unique tx reference
  type:               String    // data, ecommerce, wallet_funding
  status:             String    // pending, paid, delivered, failed
  phone:              String    // Customer phone
  amount:             Float
  agentCashbackAmount: Float?   @default(0)  // 2% of amount
  cashbackProcessed:  Boolean   @default(false)
  
  // Product/Plan Relations
  productId:          String?
  product:            Product?  @relation(fields: [productId])
  planId:             String?
  dataPlan:           DataPlan? @relation(fields: [planId])
  
  // Agent Relation
  agentId:            String?
  agent:              Agent?    @relation(fields: [agentId])
  
  // Delivery Details
  customerName:       String?
  deliveryState:      String?   // State for e-commerce delivery
  
  // API Request/Response Data
  idempotencyKey:     String?   @unique  // Prevent duplicate requests
  paymentData:        Json?     // Full Flutterwave response
  deliveryData:       Json?     // Amigo response or delivery status
  
  createdAt:          DateTime  @default(now())
  updatedAt:          DateTime  @updatedAt
}
```

**Purpose:** Tracks all customer and agent transactions

---

### **5. SupportTicket Model**
```typescript
SupportTicket {
  id:        String   @id @default(uuid())
  phone:     String   // Customer phone
  message:   String   // Ticket description
  status:    String   @default("open")  // open/closed
  createdAt: DateTime @default(now())
  updatedAt: DateTime @updatedAt
}
```

**Purpose:** Stores customer support requests

---

### **6. SystemMessage Model**
```typescript
SystemMessage {
  id:       String   @id @default(uuid())
  content:  String   // Message text
  type:     String   @default("info")  // info/warning/error/success
  isActive: Boolean  @default(true)
  createdAt: DateTime @default(now())
  updatedAt: DateTime @updatedAt
}
```

**Purpose:** System-wide announcements (ticker messages, notifications)

---

### **7. WebhookLog Model**
```typescript
WebhookLog {
  id:       String   @id @default(uuid())
  source:   String   // 'flutterwave', 'amigo', etc.
  payload:  Json     // Full webhook payload
  createdAt: DateTime @default(now())
}
```

**Purpose:** Audit log for all incoming webhooks

---

### **8. PushSubscription Model**
```typescript
PushSubscription {
  id:       String   @id @default(uuid())
  endpoint: String   @unique  // FCM endpoint
  p256dh:   String   // Encryption key
  auth:     String   // Auth token
  phone:    String?  // Associated phone (optional)
  createdAt: DateTime @default(now())
  updatedAt: DateTime @updatedAt
}
```

**Purpose:** Stores FCM subscriptions for push notifications

---

### **9. CashbackEntry Model**
```typescript
CashbackEntry {
  id:            String    @id @default(uuid())
  agentId:       String
  agent:         Agent     @relation(fields: [agentId])
  type:          String    // 'earned', 'redeemed'
  amount:        Float
  transactionId: String?   // Link to transaction if earned
  description:   String?   // e.g., "Earned on AGENT-DATA-123"
  createdAt:     DateTime  @default(now())
  updatedAt:     DateTime  @updatedAt
}
```

**Purpose:** Tracks cashback history for each agent

---

## Environment Variables

### **Database Configuration**
```env
DATABASE_URL=postgresql://username:password@localhost:5432/saukimart
```
- PostgreSQL connection string
- Format: `postgresql://user:password@host:port/database`
- Required for Prisma ORM

### **Payment Gateway (Flutterwave)**
```env
FLUTTERWAVE_PUBLIC_KEY=FLWPUBK_TEST_xxxxxxxxxxxxx
FLUTTERWAVE_SECRET_KEY=FLWSECK_TEST_xxxxxxxxxxxxx
FLUTTERWAVE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```
- Public key for frontend payment initialization
- Secret key for backend webhook verification & API calls
- Webhook secret for signature verification (SHA256 HMAC)

### **Data Provider (Amigo)**
```env
AMIGO_BASE_URL=https://amigo.ng/api/data/
AMIGO_API_KEY=your_amigo_api_key
AWS_PROXY_URL=http://proxy.internal.aws:3128  # Optional proxy
```
- Amigo provides instant data delivery for MTN, Airtel, Glo
- API key for authorization
- Proxy URL if using AWS or corporate proxy

### **Authentication & Security**
```env
ADMIN_PASSWORD=admin_password_hash_or_secret
MY_BVN=your_bvn_for_virtual_accounts
```
- `ADMIN_PASSWORD`: Secret password for admin panel access
- `MY_BVN`: Nigeria BVN for creating virtual accounts via Flutterwave

### **Firebase Configuration**
```env
# Client-side (embedded in code - not secret)
FIREBASE_API_KEY=AIzaSyDzQrdnbhabk7_4cDHb1I-Ohbg3bKYCysI
FIREBASE_PROJECT_ID=sauki-mart
FIREBASE_MESSAGING_SENDER_ID=228994084382

# Server-side (firebase-admin service account JSON)
FIREBASE_SERVICE_ACCOUNT_KEY=path/to/service-account.json  # Or as JSON string
```

### **Application Configuration**
```env
NEXT_PUBLIC_DOMAIN=www.saukimart.online
NEXT_PUBLIC_API_URL=https://www.saukimart.online/api
NODE_ENV=production
```
- `NEXT_PUBLIC_DOMAIN`: Public domain (accessible in browser)
- `NEXT_PUBLIC_API_URL`: API base URL (accessible in browser)
- `NODE_ENV`: Environment (production/development/test)

### **Gen AI (Optional)**
```env
GEMINI_API_KEY=your_gemini_api_key_here
```
- Google Gemini API key for AI features (if implemented)

### **Complete .env.local Template**
```dotenv
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/saukimart

# Flutterwave
FLUTTERWAVE_PUBLIC_KEY=FLWPUBK_TEST_xxxxxxxxxxxxx
FLUTTERWAVE_SECRET_KEY=FLWSECK_TEST_xxxxxxxxxxxxx
FLUTTERWAVE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx

# Amigo
AMIGO_BASE_URL=https://amigo.ng/api/data/
AMIGO_API_KEY=your_amigo_api_key
AWS_PROXY_URL=http://proxy.internal.aws:3128

# Security
ADMIN_PASSWORD=strong_admin_password
MY_BVN=your_bvn_12345678901

# Firebase
FIREBASE_API_KEY=AIzaSyDzQrdnbhabk7_4cDHb1I-Ohbg3bKYCysI
FIREBASE_PROJECT_ID=sauki-mart
FIREBASE_MESSAGING_SENDER_ID=228994084382
FIREBASE_SERVICE_ACCOUNT_KEY=/path/to/service-account.json

# Application
NEXT_PUBLIC_DOMAIN=www.saukimart.online
NEXT_PUBLIC_API_URL=https://www.saukimart.online/api
NODE_ENV=production
GEMINI_API_KEY=optional_gemini_key
```

---

## Admin System

### **Admin Access**
- **Entry Point:** `/admin` route
- **Authentication:** Password-based via `ADMIN_PASSWORD` environment variable
- **Method:** POST to `/api/admin/auth` with password
- **Session:** Stored in component state (not persistent across refresh)

### **Admin Features**

#### **1. Dashboard**
- Total transactions count
- Total products and data plans
- Agent statistics (active/inactive)
- Key performance indicators

#### **2. Product Management**
**Location:** `/api/products`
- **GET** `/api/products` - List all products
- **POST** `/api/admin/products` - Create product
- **PUT** `/api/admin/products/{id}` - Update product
- **DELETE** `/api/admin/products/{id}` - Delete product

**Product Fields:**
- Name, Description, Price
- Image URL
- Category (device/sim/package)
- In Stock Status

#### **3. Data Plan Management**
**Location:** `/api/data-plans`
- **GET** `/api/data-plans` - List all plans
- **POST** `/api/admin/data-plans` - Create plan
- **PUT** `/api/admin/data-plans/{id}` - Update plan
- **DELETE** `/api/admin/data-plans/{id}` - Delete plan

**Plan Fields:**
- Network (MTN/AIRTEL/GLO)
- Data (e.g., 1GB, 5GB)
- Validity (30 Days, 60 Days)
- Price (in NGN)
- Plan ID (Amigo network ID)

#### **4. Transaction Management**
**Location:** `/api/admin/transactions/`
- **GET** `/api/transactions/list?date=YYYY-MM-DD&status=paid` - Filter transactions
- **POST** `/api/admin/transactions/{id}/status` - Update transaction status
- **POST** `/api/admin/transactions/verify` - Manual verification

**Supported Filters:**
- Date range
- Status (pending/paid/delivered/failed)
- Type (data/ecommerce/wallet_funding)
- Agent ID
- Phone number

#### **5. Agent Management**
**Location:** `/api/admin/agents/`
- **GET** `/api/admin/agents` - List all agents
- **GET** `/api/admin/agents/{id}` - Agent details
- **GET** `/api/admin/agents/{id}/transactions` - Agent transaction history
- **POST** `/api/admin/agent-fund` - Manual balance credit/debit
- **POST** `/api/admin/agents/{id}/status` - Toggle agent active/suspended

**Agent Operations:**
- View agent balance, cashback, and virtual account
- Credit/debit agent wallet manually
- Suspend or activate agent account
- View agent transaction history
- Export agent reports

#### **6. Agent Funding**
**Endpoint:** POST `/api/admin/agent-fund`
```json
{
  "agentId": "uuid",
  "amount": 10000,
  "action": "credit",  // or "debit"
  "password": "admin_password",
  "reason": "Manual topup"
}
```

#### **7. Support Ticket Management**
**Location:** `/api/support/`
- **GET** `/api/support` - List all tickets
- **POST** `/api/support/{id}/close` - Close ticket
- **POST** `/api/support/{id}/reply` - Reply to ticket

#### **8. System Messages (Broadcast)**
**Endpoint:** POST `/api/admin/system/message`
```json
{
  "content": "Maintenance scheduled tonight 12-2 AM",
  "type": "warning",  // info/warning/error/success
  "isActive": true,
  "password": "admin_password"
}
```

#### **9. Push Notifications**
**Endpoint:** POST `/api/admin/push/`
```json
{
  "title": "Data Bundle Sale!",
  "body": "Get 20% off on all data plans",
  "targetType": "all",  // all/agents/users
  "password": "admin_password"
}
```

#### **10. Webhook Logs**
**Endpoint:** GET `/api/admin/webhooks/`
- View all incoming webhooks
- Webhook source (flutterwave, amigo)
- Full payload inspection
- Timestamp and processing status

#### **11. Advanced Console**
**Endpoint:** POST `/api/admin/console/`
```json
{
  "service": "flutterwave",  // or "amigo"
  "method": "GET",
  "endpoint": "/v3/transactions",
  "payload": {},
  "password": "admin_password"
}
```

---

## Agent System

### **Agent Registration**
**Endpoint:** POST `/api/agent/register`
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "08012345678",  // 10-11 digits
  "pin": "1234"  // 4 digits
}
```

**Process:**
1. Validate request (Zod schema)
2. Check rate limit (max 5 registrations per phone per 24 hours)
3. Check if agent already exists
4. Hash PIN with bcryptjs (10 salt rounds)
5. Call Flutterwave API to create virtual account
6. Store agent with hashed PIN and virtual account details
7. Return agent object

**Response:**
```json
{
  "success": true,
  "agent": {
    "id": "uuid",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "08012345678",
    "balance": 0,
    "flwAccountNumber": "3080209892",
    "flwBankName": "Access Bank",
    "flwAccountName": "John Doe Sauki Mart FLW"
  }
}
```

### **Agent Login**
**Endpoint:** POST `/api/agent/login`
```json
{
  "phone": "08012345678",
  "pin": "1234"
}
```

**Process:**
1. Validate request (Zod schema)
2. Check rate limit (max 5 attempts per 24 hours)
3. Find agent by phone
4. Compare PIN with bcryptjs hash
5. Reset rate limiter on success
6. Log authentication event

**Response:**
```json
{
  "success": true,
  "agent": {
    "id": "uuid",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "08012345678",
    "balance": 50000,
    "cashbackBalance": 2500,
    "totalCashbackEarned": 5000,
    "isActive": true
  }
}
```

### **Agent Balance Check**
**Endpoint:** GET `/api/agent/balance?agentId={agentId}`

**Response:**
```json
{
  "balance": 50000,
  "cashbackBalance": 2500
}
```

### **Agent Wallet Purchase**
**Endpoint:** POST `/api/agent/purchase`
```json
{
  "agentId": "uuid",
  "agentPin": "1234",
  "type": "data",  // or "ecommerce"
  "payload": {
    "planId": "data-plan-uuid",
    "phone": "08012345678",
    "network": "MTN"
  }
}
```

**Process for Data Purchase:**
1. Validate request and PIN
2. Check if agent is active
3. Fetch data plan details
4. Verify agent balance
5. Pre-verify with Amigo API (test if number is valid)
6. Deduct amount from agent balance
7. Calculate 2% cashback
8. Create transaction (delivered status)
9. Create cashback entry
10. Call Amigo API to deliver data
11. Update transaction with delivery status

**Cashback Calculation:**
- Amount: 5000 NGN
- Cashback: 5000 × 0.02 = 100 NGN
- Agent receives: 100 NGN in cashback balance

### **Agent Cashback Redemption**
**Endpoint:** POST `/api/agent/redeem-cashback`
```json
{
  "agentId": "uuid",
  "pin": "1234",
  "amount": 2500
}
```

**Process:**
1. Verify agent and PIN
2. Check cashback balance >= requested amount
3. Transfer from cashbackBalance to balance
4. Create cashback entry (type: 'redeemed')
5. Create transaction record

### **Update PIN**
**Endpoint:** POST `/api/agent/update-pin`
```json
{
  "agentId": "uuid",
  "oldPin": "1234",
  "newPin": "5678"
}
```

---

## Payment Processing

### **Flutterwave Integration**

#### **Setup & Configuration**
- **Account:** Flutterwave Business Account (Nigeria)
- **Keys:**
  - Public Key: For frontend payment initiation and encryption
  - Secret Key: For backend API calls and webhook verification
  - Webhook Secret: For validating webhook signatures

#### **Payment Methods Supported**
1. **Bank Transfer:** Customer transfers to provided bank account
2. **Card Payment:** Debit/Credit card (via Flutterwave)
3. **USSD:** Simple USSD payments
4. **Mobile Money:** Local mobile wallet integration

#### **Customer Data Purchase Flow**

**Step 1: Initiate Payment**
```
POST /api/data/initiate-payment
{
  "planId": "plan-uuid",
  "phone": "08012345678"
}
```

**Step 2: Backend Calls Flutterwave**
```
POST https://api.flutterwave.com/v3/charges?type=bank_transfer
{
  "tx_ref": "SAUKI-DATA-timestamp-random",
  "amount": "5000",
  "email": "saukidatalinks@gmail.com",
  "phone_number": "08012345678",
  "currency": "NGN",
  "narration": "Data: MTN 1GB",
  "is_permanent": false
}
```

**Step 3: Flutterwave Response**
```json
{
  "status": "success",
  "data": {
    "id": 12345,
    "tx_ref": "SAUKI-DATA-timestamp-random",
    "meta": {
      "authorization": {
        "transfer_bank": "Access Bank",
        "transfer_account": "1234567890",
        "transfer_note": "Payment Reference"
      }
    }
  }
}
```

**Step 4: Backend Returns to Frontend**
```json
{
  "tx_ref": "SAUKI-DATA-timestamp-random",
  "bank": "Access Bank",
  "account_number": "1234567890",
  "account_name": "SAUKI MART FLW",
  "amount": 5000,
  "note": "Payment Reference"
}
```

**Step 5: Customer Transfers Money**
- Customer initiates bank transfer to provided account
- Amount: 5000 NGN
- Reference: Payment Reference code
- Flutterwave processes and sends webhook

**Step 6: Flutterwave Webhook**
```
POST /api/webhook/flutterwave
Header: verif-hash = webhook_secret_hash
{
  "data": {
    "id": 12345,
    "status": "successful",
    "amount": 5000,
    "tx_ref": "SAUKI-DATA-timestamp-random",
    "customer": {
      "phone_number": "08012345678"
    }
  }
}
```

**Step 7: Backend Processes Webhook**
1. Verify webhook signature (SHA256 HMAC)
2. Check if transaction already processed (via tx_ref)
3. Extract transaction and customer data
4. Update transaction status to "paid"
5. Call Amigo API to deliver data
6. Update transaction to "delivered"
7. Send FCM notification to customer

#### **E-commerce Purchase Flow**

Similar to data purchase but with additional fields:
```json
{
  "productId": "product-uuid",
  "phone": "08012345678",
  "name": "Customer Name",
  "state": "Lagos",
  "simId": "optional-sim-uuid"  // If bundling with SIM
}
```

**Flutterwave also receives:**
```json
{
  "meta": {
    "consumer_id": "08012345678",
    "consumer_mac": "kgh94"
  }
}
```

#### **Agent Virtual Account Funding**

When agent registers, Flutterwave creates a permanent virtual account:
```
POST https://api.flutterwave.com/v3/virtual-account-numbers
{
  "email": "agent.08012345678@www.saukimart.online",
  "is_permanent": true,
  "bvn": "process.env.MY_BVN",
  "tx_ref": "AGENT-REG-uuid",
  "phonenumber": "08012345678",
  "firstname": "John",
  "lastname": "Doe Sauki Mart FLW",
  "narration": "Sauki Agent John"
}
```

**Response includes:**
- `account_number`: Unique account for agent
- `bank_name`: Bank providing the account
- `account_name`: Display name

**When agent receives funds:**
- Flutterwave webhook is triggered
- Backend verifies webhook
- Checks if phone matches agent
- Increments agent.balance
- Creates wallet_funding transaction

---

### **Amigo API Integration**

**Purpose:** Instant delivery of mobile data bundles

#### **Configuration**
```env
AMIGO_BASE_URL=https://amigo.ng/api/data/
AMIGO_API_KEY=your_api_key
```

#### **Supported Networks**
```typescript
AMIGO_NETWORKS = {
  'MTN': 1,
  'AIRTEL': 2,
  'GLO': 3
}
```

#### **Data Delivery Request**
```
POST https://amigo.ng/api/data/
Headers:
  Authorization: Bearer AMIGO_API_KEY
  X-API-Key: AMIGO_API_KEY
  Token: AMIGO_API_KEY
  Idempotency-Key: request-uuid

Body:
{
  "network": 1,  // MTN
  "mobile_number": "08012345678",
  "plan": 108,  // Amigo plan ID
  "Ported_number": true
}
```

#### **Amigo Response**
```json
{
  "success": true,
  "data": {
    "Status": 'successful',
    "Reference": "unique-ref",
    "Message": "Data delivered to 08012345678"
  }
}
```

#### **Retry Logic**
- Exponential backoff with max 3 retries
- Initial delay: 1000ms
- Max delay: 10000ms
- Retry on 5xx errors and network timeouts
- Idempotency key prevents duplicate charges

#### **Request Validation**
Before calling Amigo, backend verifies:
1. Number is valid 10-11 digits
2. Network is supported (MTN/AIRTEL/GLO)
3. Plan exists and is active
4. Agent/customer has sufficient balance

---

## API Routes & Endpoints

### **Authentication Endpoints**

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/admin/auth` | Admin login | None |
| POST | `/api/agent/register` | Agent registration | None |
| POST | `/api/agent/login` | Agent login | None |

### **Agent Endpoints**

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/agent/balance?agentId=` | Get agent balance | None |
| POST | `/api/agent/purchase` | Purchase data/ecommerce | None |
| POST | `/api/agent/transactions?agentId=` | Agent transaction history | None |
| POST | `/api/agent/update-pin` | Change PIN | None |
| POST | `/api/agent/redeem-cashback` | Redeem cashback | None |

### **Customer Payment Endpoints**

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/data/initiate-payment` | Start data purchase | None |
| POST | `/api/ecommerce/initiate-payment` | Start product purchase | None |
| POST | `/api/transactions/verify` | Verify payment status | None |

### **Product & Inventory**

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/products` | List all products | None |
| GET | `/api/data-plans` | List all data plans | None |

### **Transaction Tracking**

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/transactions/track?phone=` | Customer transaction history | None |
| GET | `/api/transactions/day?date=` | Transactions by date | Admin |
| GET | `/api/transactions/list` | All transactions with filters | Admin |

### **Webhook Endpoints**

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/webhook/flutterwave` | Payment webhook | Signature |

### **Support Endpoints**

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/support` | Create support ticket | None |
| GET | `/api/support` | List support tickets | Admin |

### **Admin Endpoints**

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/admin/agents` | List agents | Admin |
| POST | `/api/admin/products` | Manage products | Admin |
| POST | `/api/admin/data-plans` | Manage data plans | Admin |
| POST | `/api/admin/agent-fund` | Credit/debit agent | Admin |
| POST | `/api/admin/transactions/{id}/status` | Update transaction | Admin |
| POST | `/api/admin/webhooks` | View webhook logs | Admin |
| POST | `/api/admin/console` | Execute API commands | Admin |
| POST | `/api/admin/system/message` | Broadcast system message | Admin |
| POST | `/api/admin/push` | Send push notifications | Admin |

### **System Endpoints**

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/system/message` | Get active system message | None |
| POST | `/api/fcm/register` | Register FCM token | None |
| GET | `/api/giveaway` | Giveaway info | None |

---

## Security & Authentication

### **1. PIN Security**

**Hashing:**
- Algorithm: bcryptjs
- Salt rounds: 10
- Never stored in plain text

```typescript
// Hashing a PIN
const hashedPin = await hashPin('1234');
// Result: $2a$10$abcdefghijklmnopqrstuvwxyz...

// Verifying a PIN
const isValid = await verifyPin('1234', hashedPin);
// Comparison happens at bcryptjs level
```

**PIN Format Validation:**
- Must be exactly 4 digits (0-9)
- Validated with regex: `/^[0-9]{4}$/`

### **2. Rate Limiting**

**Register Limiter:**
- Max: 5 registrations per phone number
- Window: 24 hours
- Header on 429: `Retry-After: seconds`

**Login Limiter:**
- Max: 5 login attempts per phone number
- Window: 24 hours
- Resets on successful login

**Implementation:**
- In-memory store
- Tracks by phone number
- Configurable per endpoint

### **3. Request Validation**

**Zod Schemas:**
All API requests validated against schemas:

```typescript
AgentRegisterSchema = z.object({
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),
  phone: z.string().regex(/^[0-9]{10,11}$/),
  pin: z.string().regex(/^[0-9]{4}$/)
})
```

**Validation Process:**
1. Parse JSON body
2. Apply schema validation
3. Return error details if invalid
4. Proceed only if valid

### **4. Webhook Signature Verification**

**Flutterwave Webhook:**
```typescript
const signature = req.headers.get('verif-hash');
const secret = process.env.FLUTTERWAVE_WEBHOOK_SECRET;

// Verification
if (signature !== secret) {
  return 401 Unauthorized;
}
```

**HMAC-SHA256 verification:**
- Signature included in `verif-hash` header
- Computed using webhook secret
- Must match before processing

### **5. Idempotent Requests**

**Purpose:** Prevent duplicate charges

**Implementation:**
- `idempotencyKey` field in Transaction model
- Must be unique per request
- Stored as UUID
- Checked before processing payment

**Flow:**
```
Client sends: POST /api/data/initiate-payment
  with header: Idempotency-Key: unique-uuid

Backend:
  1. Check if Transaction with idempotencyKey exists
  2. If exists, return cached response
  3. If not, process and store with key
```

### **6. Admin Authentication**

**Single Password Authentication:**
```env
ADMIN_PASSWORD=secure_password_hash_or_string
```

**Process:**
1. POST `/api/admin/auth` with password
2. Compare with environment variable
3. Return success/failure
4. Admin stores session in frontend state
5. Include password in subsequent admin requests

**Limitations:**
- Password reset not automated
- Single password for all admins
- Password stored as plain text in env
- Session not persistent (stored in component state)

### **7. Data Validation**

**Phone Number:**
- Format: 10-11 Nigerian digits
- Regex: `/^[0-9]{10,11}$/`
- Examples: 08012345678, 09023456789

**Amount:**
- Must be positive number
- Can have decimal (e.g., 5000.50)
- Coerced to string for Flutterwave

**Transaction Reference:**
- Format: `SAUKI-{TYPE}-{TIMESTAMP}-{RANDOM}`
- Unique constraint in database
- Used for deduplication

---

## Frontend Components

### **Page Structure**

```
/app/
  ├── page.tsx              # Landing/Homepage (public)
  ├── layout.tsx            # Root layout with metadata
  ├── app/
  │   └── page.tsx          # Main app entry and tabs
  ├── admin/
  │   └── page.tsx          # Admin dashboard (protected by password)
  ├── agents/
  │   └── page.tsx          # Agent landing page (info only)
  ├── privacy/
  │   └── page.tsx          # Privacy policy
  ├── giveaway/
  │   └── page.tsx          # Giveaway campaign
  └── sgrm/
      └── page.tsx          # SGRM (customer rewards program)
```

### **Main Application Layout** (`/app/app`)
- **Navigation:** Bottom tabs (mobile-first design)
- **Tabs:**
  1. Home - Main dashboard
  2. Data - Buy data bundles
  3. Store - E-commerce products
  4. Track - Transaction history
  5. History - Search past transactions
  6. Support - Help & support tickets
  7. Agent - Agent login

### **Components Structure**

```typescript
components/
├── screens/
│   ├── Home.tsx           # Dashboard with ticker
│   ├── Data.tsx           # Data bundle purchase
│   ├── Store.tsx          # E-commerce store
│   ├── Track.tsx          # Single transaction tracking
│   ├── History.tsx        # Transaction history browser
│   ├── Support.tsx        # Support ticket creation
│   ├── Agent.tsx          # Agent login & manage
│   ├── AgentTransactionHistory.tsx
│   ├── AgentAnalytics.tsx
│   ├── Complaint.tsx
│   └── LegalDocs.tsx
├── ui/
│   ├── BottomSheet.tsx    # Modal bottom sheet
│   ├── Button.tsx         # Reusable button
│   ├── Input.tsx          # Text input field
│   ├── PINKeyboard.tsx    # 4-digit PIN entry
│   ├── Skeleton.tsx       # Loading skeleton
│   └── Toast.tsx          # Toast notifications
├── BottomTabs.tsx         # Tab navigation bar
├── SideMenu.tsx           # Hamburger menu
├── FirebaseMessaging.tsx  # FCM listener
├── ServiceWorkerRegister.tsx # PWA registration
├── BrandedReceipt.tsx     # Receipt template
├── SharedReceipt.tsx      # Share receipt modal
├── AdminStatement.tsx     # Admin financial statement
└── SmartEntry.tsx         # Smart input component
```

### **Key UI Features**

#### **Home Screen**
- Welcome message
- Ticker/marquee announcements
- Quick action buttons
- Recent transactions
- Promotional banner
- Download receipt option

#### **Data Purchase Flow**
1. Select network (MTN/Airtel/Glo)
2. Choose plan
3. Enter phone number
4. Review details
5. Accept terms
6. See bank details
7. Payment receipt after transfer

#### **E-commerce Store**
1. Browse products
2. View product details
3. Optional: Add SIM
4. Enter delivery details
5. Confirm purchase
6. See bank details
7. Delivery tracking

#### **Transaction Track**
1. Enter transaction reference
2. View real-time status
3. Download receipt
4. Share receipt
5. Support ticket if issue

#### **History Browser**
1. Filter by date range
2. Search by phone/amount
3. Sort by status
4. Grouped view options
5. Export transactions

#### **Agent Features**
1. Registration form
2. Login with PIN
3. Dashboard
4. Balance display
5. Purchase interface
6. Cashback tracker
7. Transaction history

### **Design System**

**Color Palette (Apple-inspired):**
- Primary Blue: #007AFF
- Green: #34C759
- Red: #FF3B30
- Orange: #FF9500
- Yellow: #FFCC00
- Pink: #FF2D55
- Purple: #AF52DE
- Gold Accent: #D4AF37

**Typography:**
- System fonts: -apple-system, Segoe UI, Roboto
- Playfair Display: Headings
- DM Sans: Body

**Spacing:**
- xs: 4px, sm: 8px, base: 12px, lg: 16px, xl: 20px

**Animations:**
- Fade in/up on page load
- Stagger animations on lists
- Smooth transitions (200-300ms)
- Framer Motion for complex animations

### **Mobile-First Approach**
- Bottom navigation (easier thumb reach)
- Large touch targets (min 44x44px)
- Full-width inputs
- Vertical scrolling
- Minimal modals

---

## External Integrations

### **1. Flutterwave Payment Gateway**

**Website:** https://flutterwave.com  
**Region:** Africa  
**Payment Methods:** Bank Transfers, Cards, USSD, Mobile Money

**Integration Points:**
- Payment initiation (virtual accounts)
- Webhook for payment confirmation
- Virtual account creation for agents

**Security:**
- Webhook signature verification
- API key authentication
- HTTPS encryption

**Error Handling:**
- Retry on 5xx errors
- Timeout: 60 seconds
- Error logging to console

---

### **2. Amigo API (Data Provider)**

**Website:** https://amigo.ng  
**Service:** Mobile data delivery

**Networks Supported:**
- MTN Nigeria
- Airtel
- Glo

**API Endpoints:**
- `/data/` - Deliver data bundle
- Authentication via Bearer token and API key

**Retry Logic:**
- Max 3 retries with exponential backoff
- Idempotency key for duplicate prevention

**Supported Plans:**
- Dynamic plan management per network
- Plan ID stored in database
- Admin-managed pricing

---

### **3. Firebase & Firebase Cloud Messaging (FCM)**

**Project:** sauki-mart (Firebase Console)

**Configuration:**
```json
{
  "apiKey": "AIzaSyDzQrdnbhabk7_4cDHb1I-Ohbg3bKYCysI",
  "authDomain": "sauki-mart.firebaseapp.com",
  "projectId": "sauki-mart",
  "storageBucket": "sauki-mart.firebasestorage.app",
  "messagingSenderId": "228994084382",
  "appId": "1:228994084382:web:b1079dd1898bb1da40880f"
}
```

**Services:**
- Cloud Messaging (push notifications)
- Real-time database (optional)

**Use Cases:**
- Payment confirmation notifications
- Order updates
- Promotional campaigns
- Support ticket responses

**Service Worker:**
- Located at `/public/firebase-messaging-sw.js`
- Handles background notifications
- Service worker registration in `ServiceWorkerRegister.tsx`

---

### **4. Google Gemini (AI - Optional)**

**Purpose:** AI-powered features (if implemented)  
**Configuration:** Via `GEMINI_API_KEY` env variable

---

## Logging & Monitoring

### **Logger System**

**Location:** `lib/logger.ts`

**Log Levels:**
- DEBUG: Detailed debug info
- INFO: General information
- WARN: Warning messages
- ERROR: Error messages
- CRITICAL: Critical failures

**Log Entry Format:**
```json
{
  "timestamp": "2024-03-01T12:34:56.789Z",
  "level": "INFO",
  "service": "AUTH",
  "action": "AGENT_LOGIN",
  "userId": "08012345678",
  "details": {
    "requestId": "abc123def456",
    "type": "REQUEST_END"
  },
  "statusCode": 200,
  "duration": 345
}
```

### **Log Events**

**Authentication:**
- REGISTER: Agent registration
- LOGIN: Agent login
- AUTH_FAILURE: Failed login attempt

**Transactions:**
- PAYMENT_INITIATED: Payment creation
- PAYMENT_CONFIRMED: Webhook received
- DELIVERY_STARTED: Amigo call initiated
- DELIVERY_COMPLETE: Data delivered

**Security:**
- INVALID_REQUEST: Validation failure
- RATE_LIMITED: Too many attempts
- PIN_HASHING: PIN processing
- AUTHENTICATION_FAILED: Wrong password/PIN

**External API:**
- AMIGO_CALL: Amigo API request
- FLW_CALL: Flutterwave API request
- AMIGO_FAILURE: Amigo error
- FLW_FAILURE: Flutterwave error

### **Webhook Logging**

**WebhookLog Model:**
- Source: flutterwave, amigo, etc.
- Payload: Full request body (JSON)
- Timestamp: When received

**Purpose:**
- Audit trail
- Debugging failed payments
- Replay capability
- Compliance documentation

---

## Deployment & Hosting

### **Hosting Platform: Vercel**

**Configuration File:** `vercel.json`
```json
{
  "framework": "nextjs",
  "regions": ["lhr1"],  // London region
  "env": {
    "NEXT_PUBLIC_DOMAIN": "www.saukimart.online"
  },
  "crons": []
}
```

**Deployment Process:**
1. Push to main branch
2. GitHub integration triggers build
3. Next.js build optimization
4. API routes compiled
5. Static assets optimized
6. Deployed to edge network

**Production URL:** https://www.saukimart.online

### **Database Hosting**

**PostgreSQL on Managed Service:**
- Database URL in .env.local
- Daily automated backups
- SSL encryption in transit
- Connection pooling recommended

### **Environment Setup on Vercel**

**Steps:**
1. Connect GitHub repository
2. Add environment variables:
   - DATABASE_URL
   - FLUTTERWAVE_PUBLIC_KEY
   - FLUTTERWAVE_SECRET_KEY
   - FLUTTERWAVE_WEBHOOK_SECRET
   - AMIGO_BASE_URL
   - AMIGO_API_KEY
   - ADMIN_PASSWORD
   - MY_BVN
   - FIREBASE_* variables
3. Deploy
4. Verify in browser

---

## Development Setup

### **Prerequisites**
- Node.js 18+ or 20+
- PostgreSQL 12+
- Git
- npm or yarn

### **Installation**

```bash
# 1. Clone repository
git clone <repo-url>
cd saukimart

# 2. Install dependencies
npm install

# 3. Setup environment
cp .env.example .env.local
# Edit .env.local with your values

# 4. Setup database prisma
npx prisma migrate dev
# or
npx prisma db push

# 5. Seed database (optional)
npx prisma db seed

# 6. Generate Prisma client
npx prisma generate
```

### **Running Locally**

```bash
# Development with hot reload
npm run dev

# Access at http://localhost:3000
```

### **Building for Production**

```bash
# Create optimized build
npm run build

# Start production server
npm start
```

### **Prisma Commands**

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name migration_name

# Seed database
npx prisma db seed

# Open Prisma Studio (GUI)
npx prisma studio

# Generate migration without running
npx prisma migrate dev --create-only
```

### **Database Seeding**

**File:** `prisma/seed.ts`

Manually create initial data:
```bash
npx prisma db seed
```

Or create directly via Prisma Studio:
```bash
npx prisma studio
```

### **Useful Scripts**

**package.json:**
```json
{
  "scripts": {
    "dev": "next dev",              // Development server
    "build": "next build",          // Production build
    "start": "next start",          // Start production
    "lint": "next lint",            // Lint code
    "postinstall": "prisma generate" // Auto-generate Prisma client
  }
}
```

### **Local Testing Checklist**

- [ ] Prisma connects to local/test database
- [ ] Agent registration works (PIN hashing)
- [ ] Agent login with PIN verification
- [ ] Data plan purchase flow
- [ ] E-commerce purchase flow
- [ ] Admin panel accessible with password
- [ ] Transaction tracking
- [ ] Receipt generation and download
- [ ] System message display
- [ ] Rate limiting working
- [ ] Request validation working
- [ ] FCM notifications (if Firebase credentials provided)

---

## Troubleshooting

### **Database Issues**

**Issue:** "relation 'public.Agent' does not exist"
```bash
# Solution: Run migrations
npx prisma db push
npx prisma migrate deploy
```

**Issue:** Connection timeout to database
```bash
# Check DATABASE_URL in .env.local
# Format: postgresql://user:password@host:port/database
# Ensure PostgreSQL is running
```

### **Payment Issues**

**Issue:** Flutterwave webhook not received
- Check webhook secret matches in Flutterwave dashboard
- Verify webhook URL is publicly accessible
- Check webhook logs at `/api/admin/webhooks`

**Issue:** Amigo API failing
- Verify AMIGO_API_KEY is correct
- Check AMIGO_BASE_URL ends with `/`
- Check network connectivity
- Review logs in browser console

### **Authentication Issues**

**Issue:** Admin password not working
- Verify ADMIN_PASSWORD matches exactly
- Check for extra spaces or newlines
- Password is case-sensitive

**Issue:** Agent PIN incorrect after registration
- PIN must be exactly 4 digits
- Verify bcryptjs hashing working
- Check PIN in database is stored as hash, not plain text

### **Firebase Issues**

**Issue:** FCM tokens not registering
- Check Firebase config in `firebaseClient.ts`
- Verify service worker is registered
- Check browser permissions for notifications

---

## Performance Optimizations

### **Frontend**
- Next.js Image optimization
- Dynamic imports for heavy components
- Memoization of expensive computations
- Lazy loading of screens

### **Backend**
- Database connection pooling
- Prisma query optimization
- Request validation before heavy operations
- Caching of static data (products, plans)

### **Database**
- Indexes on frequently queried fields (phone, tx_ref)
- Connection pooling
- Query optimization in Prisma

---

## Security Checklist

- [x] PIN hashed with bcryptjs (10 salt rounds)
- [x] Password authentication for admin
- [x] Webhook signature verification
- [x] Request validation with Zod
- [x] Rate limiting on auth endpoints
- [x] HTTPS only in production
- [x] Environment secrets not in code
- [x] Idempotent requests
- [x] SQL injection prevention (Prisma)
- [ ] 2FA for admin (future)
- [ ] API key rotation (future)
- [ ] Audit logging (partial)

---

## Future Enhancements

1. **Two-Factor Authentication (2FA)** for admin and agents
2. **API Key System** for partner integrations
3. **Subscription Plans** for recurring purchases
4. **Referral Program** with commission tracking
5. **Advanced Analytics Dashboard** with real-time charts
6. **Mobile App** (React Native) with offline capabilities
7. **SMS Notifications** alongside FCM
8. **Multi-currency Support** (USD, GBP, EUR)
9. **Automated Reports** and email summaries
10. **Customer Loyalty Program** with points system

---

## Support & Contact

**Email:** support@saukimart.online  
**Website:** https://www.saukimart.online  
**Dashboard:** https://www.saukimart.online/admin

---

**Document Version:** 1.0  
**Last Updated:** March 1, 2026  
**Status:** Production Ready

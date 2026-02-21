# Sauki Mart - Premium Mobile Commerce Platform

<div align="center">

**Nigeria's #1 App for Instant Mobile Data, Airtime & Premium Gadgets**

[Live Site](https://www.saukimart.online)

</div>

---

## 📋 Quick Start

### Prerequisites
- **Node.js** 18+ 
- **PostgreSQL** database (v12+)
- npm or yarn package manager

### Installation

1. **Clone and setup:**
   ```bash
   npm install
   ```

2. **Environment Setup:**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` with your credentials:
   - `DATABASE_URL` - PostgreSQL connection string (required)
   - `FLUTTERWAVE_SECRET_KEY` - Flutterwave API key (required)
   - `ADMIN_PASSWORD` - Admin authentication (required)
   - Additional keys in `.env.example`

3. **Database Setup:**
   ```bash
   npx prisma migrate deploy
   npx prisma generate
   ```

4. **Start Development:**
   ```bash
   npm run dev
   ```
   Open http://localhost:3000

---

## 🚀 Production Deployment

### Build
```bash
npm run build
```

### Run
```bash
npm start
```

### Environment Checklist
- ✅ All API keys configured
- ✅ Database connection with SSL
- ✅ Admin password set
- ✅ NEXT_PUBLIC_DOMAIN configured
- ✅ Firebase keys (if notifications enabled)
- ✅ VAPID keys (if push enabled)

### Deploy To
- **Vercel** (Recommended) - `vercel deploy`
- **Docker** - Build with `node:18-alpine`
- **Traditional Node** - Any Node.js hosting
- **Cloud Platforms** - AWS, GCP, Azure

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Next.js 14, TypeScript |
| **Styling** | Tailwind CSS, Framer Motion |
| **Backend** | Next.js API Routes |
| **Database** | PostgreSQL, Prisma ORM |
| **Payment** | Flutterwave Integration |
| **Auth** | JWT, bcrypt PIN hashing |
| **Notifications** | Firebase + Web Push |
| **PWA** | Service Workers |

---

## 📁 Project Structure

```
├── /app                    # Next.js App Router
│   ├── /api               # Backend API routes
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home/marketing page
│   └── /app/page.tsx      # Main web app
├── /components            # React components
│   ├── /screens           # App screen components
│   ├── /ui                # UI components
│   └── ServiceWorkerRegister.tsx
├── /lib                   # Utilities & helpers
│   ├── api.ts            # API client
│   ├── security.ts       # PIN hashing
│   ├── validation.ts     # Request validation
│   └── logger.ts         # Structured logging
├── /prisma
│   ├── schema.prisma     # Database schema
│   └── seed.ts          # Database seeding
├── /public              # Static assets
│   ├── /icons          # App icons
│   ├── /screenshots    # App screenshots
│   └── manifest.json   # PWA manifest
└── /scripts            # One-off scripts
    ├── generate-vapid-keys.ts
    └── migrate-pin-hashes.ts
```

---

## ✨ Features

### For Users
- 📱 Instant MTN, Airtel, GLO data purchase
- ⚡ Fast airtime top-up
- 🛍️ E-commerce gadget store
- 💳 Secure Flutterwave payments
- 📊 Transaction history
- 🛟 24/7 support

### For Agents
- 💰 Commission earnings
- 🎁 Cashback rewards
- 📈 Dashboard analytics
- 💼 Wallet management

### Platform
- ✅ Progressive Web App (PWA)
- ✅ Push notifications
- ✅ Offline support
- ✅ Mobile responsive
- ✅ SMEDAN certified
- ✅ Secure payment processing

---

## 🔐 Security

- ✅ PIN hashing with bcrypt (no plaintext storage)
- ✅ Rate limiting (prevent brute force)
- ✅ Request validation with Zod
- ✅ CORS protection
- ✅ Webhook signature verification
- ✅ Audit logging
- ✅ Admin password authentication
- ✅ Error boundaries

---

## 🗄️ Database Schema

**Core Models:**
- `User/Agent` - Agent accounts
- `Product` - E-commerce items
- `DataPlan` - Mobile data bundles
- `Transaction` - Payment records
- `SupportTicket` - Customer queries
- `PushSubscription` - Notification endpoints
- `WebhookLog` - Payment gateway logs

---

## 🔌 API Endpoints

### Public
- `GET /api/products` - List products
- `GET /api/data-plans` - List data plans
- `GET /api/transactions/list` - Transaction history

### Payment
- `POST /api/ecommerce/initiate-payment` - Start e-commerce payment
- `POST /api/data/initiate-payment` - Start data payment
- `POST /api/transactions/verify` - Verify payment status
- `POST /api/webhook/flutterwave` - Payment webhook

### Agent
- `POST /api/agent/register` - Create agent account
- `POST /api/agent/login` - Agent login
- `POST /api/agent/purchase` - Agent transaction
- `GET /api/agent/balance` - Check balance
- `POST /api/agent/redeem-cashback` - Redeem earnings

### Admin
- `POST /api/admin/auth` - Admin login
- `GET /api/admin/agents` - List agents
- `POST /api/admin/agent-fund` - Fund agent wallet
- `GET /api/admin/transactions` - View transactions
- `POST /api/admin/push` - Send notifications

---

## 📦 Scripts

```bash
npm run dev              # Development server
npm run build           # Production build
npm start              # Start production
npm run lint           # Run ESLint

npx prisma studio     # Database viewer
npx prisma migrate    # Run migrations
npx prisma generate   # Generate client
npx ts-node scripts/generate-vapid-keys.ts  # Generate push keys
npx ts-node scripts/migrate-pin-hashes.ts   # Migrate PINs to bcrypt
```

---

## 🐛 Troubleshooting

### Database Issues
```bash
# Check connection
psql $DATABASE_URL

# Reset database
npx prisma migrate reset

# View schema
npx prisma studio
```

### Payment Issues
- Verify Flutterwave keys in `.env.local`
- Test in sandbox mode first
- Check webhook is accessible

### Build Errors
```bash
# Clear cache
rm -rf .next node_modules
npm install
npm run build
```

---

## 💬 Support

- **Email:** saukidatalinks@gmail.com
- **Phone:** +234 806 193 4056  
- **Website:** https://www.saukimart.online

---

## 📄 License

Private - All rights reserved © 2026 Sauki Data Links

---

**Last Updated:** February 2026
**Status:** Production Ready ✅

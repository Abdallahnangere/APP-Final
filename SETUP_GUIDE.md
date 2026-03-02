# 🚀 Sauki Mart - New Version Setup & Configuration Guide

**Import Date:** March 2, 2026  
**Version:** 2.0.0 (New Integrated Version)  
**Status:** Ready for Configuration & Deployment

---

## 📋 What Was Imported

The new **Sauki Mart website version** from your Desktop has been fully integrated into this workspace. This includes:

### ✅ **Complete App Structure**
- All API routes and endpoints
- Admin dashboard with full management console
- Agent system with registration, login, and wallet
- Customer data and e-commerce flows
- Support ticket system
- Giveaway and privacy pages

### ✅ **Refactored Library Modules**
The `/lib` directory now contains:
- `amigo.ts` - Data delivery API integration
- `auth.ts` - Authentication helpers
- `firebase-admin.ts` - Firebase Cloud Messaging setup
- `flutterwave.ts` - Flutterwave payment integration
- `logger.ts` - Structured logging system
- `prisma.ts` - Database connection
- `rateLimiter.ts` - Rate limiting for auth endpoints

### ✅ **Updated Configuration**
- `next.config.js` - Next.js configuration (not `.mjs`)
- `tailwind.config.ts` - Tailwind CSS setup
- `tsconfig.json` - TypeScript configuration
- `postcss.config.js` - PostCSS configuration
- `package.json` - All dependencies updated

### ✅ **Database Schema**
- PostgreSQL Prisma schema with all models
- 9 core models: Product, DataPlan, Agent, Transaction, SupportTicket, SystemMessage, WebhookLog, PushSubscription, CashbackEntry

---

## 🔧 Required Configuration Steps

### **Step 1: Database Setup**

Create a PostgreSQL database and update `.env.local`:

```bash
# Option A: Local PostgreSQL
DATABASE_URL=postgresql://postgres:password@localhost:5432/saukimart

# Option B: Supabase (Recommended for production)
DATABASE_URL=postgresql://user:password@db.supabase.co:5432/postgres?schema=public

# Option C: Railway
DATABASE_URL=postgresql://user:password@railway.internal:5432/saukimart
```

Then initialize the database:

```bash
npx prisma db push
npx prisma db seed  # Optional: seed initial data
```

---

### **Step 2: Flutterwave Setup**

1. Create account at https://flutterwave.com
2. Get your keys from the Dashboard
3. Add to `.env.local`:

```env
FLUTTERWAVE_PUBLIC_KEY=FLWPUBK_TEST_xxxxxxxxxxxx
FLUTTERWAVE_SECRET_KEY=FLWSECK_TEST_xxxxxxxxxxxx
FLUTTERWAVE_WEBHOOK_SECRET=your_webhook_secret
```

4. Configure webhook URL in Flutterwave Dashboard:
```
https://www.saukimart.online/api/webhook/flutterwave
```

---

### **Step 3: Amigo Data Provider Setup**

1. Register at https://www.amigo.ng
2. Get your API credentials
3. Add to `.env.local`:

```env
AMIGO_BASE_URL=https://amigo.ng/api/data/
AMIGO_API_KEY=your_amigo_api_key
```

Optional - Behind corporate proxy:
```env
AWS_PROXY_URL=http://proxy.company.com:3128
```

---

### **Step 4: Firebase Cloud Messaging Setup**

1. Create project at https://console.firebase.google.com
2. Enable Cloud Messaging
3. Get service account key from: Settings → Service Accounts → Generate new private key
4. Add to `.env.local`:

```env
FIREBASE_API_KEY=AIzaSyDzQrdnbhabk7_4cDHb1I-Ohbg3bKYCysI
FIREBASE_PROJECT_ID=sauki-mart
FIREBASE_MESSAGING_SENDER_ID=228994084382
FIREBASE_APP_ID=1:228994084382:web:b1079dd1898bb1da40880f
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
```

---

### **Step 5: Security Configuration**

1. Set a strong admin password:
```env
ADMIN_PASSWORD=your_super_strong_password
```

2. Add your BVN (11 digits) for virtual account creation:
```env
MY_BVN=12345678901
```

---

### **Step 6: Application Settings**

```env
NEXT_PUBLIC_DOMAIN=www.saukimart.online
NEXT_PUBLIC_API_URL=https://www.saukimart.online/api
NODE_ENV=production
```

---

## 🚀 Development vs Production

### **Local Development**
```bash
npm install
npm run dev
# Access at http://localhost:3000
```

### **Production Build**
```bash
npm run build
npm start
```

---

## 📊 Database Models

All models are in `prisma/schema.prisma`:

| Model | Purpose |
|-------|---------|
| **Product** | E-commerce products (gadgets, SIM cards) |
| **DataPlan** | Mobile data bundles (MTN, Airtel, Glo) |
| **Agent** | Agent credentials and wallet balance |
| **Transaction** | All orders and payments |
| **SupportTicket** | Customer support requests |
| **SystemMessage** | Broadcast announcements |
| **WebhookLog** | Audit trail for webhooks |
| **PushSubscription** | FCM subscriptions |
| **CashbackEntry** | Agent cashback tracking |

---

## 🔗 API Routes - Quick Reference

### **Authentication**
- `POST /api/agent/register` - Agent registration
- `POST /api/agent/login` - Agent login
- `POST /api/admin/auth` - Admin login

### **Customer Payments**
- `POST /api/data/initiate-payment` - Start data purchase
- `POST /api/ecommerce/initiate-payment` - Start product purchase
- `POST /api/webhook/flutterwave` - Payment webhook

### **Agent Operations**
- `GET /api/agent/balance` - Check balance
- `POST /api/agent/purchase` - Buy from wallet
- `POST /api/agent/redeem-cashback` - Redeem earnings

### **Admin Management**
- `GET /api/admin/agents` - List agents
- `POST /api/admin/agent-fund` - Manual credit/debit
- `GET /api/products` - List products
- `GET /api/data-plans` - List data plans

---

## 📁 Directory Structure

```
c:\Users\harun\AppData\Local\Temp\APP-Final\
├── app/                          # Next.js application
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Landing page
│   ├── admin/                   # Admin dashboard
│   │   └── page.tsx
│   ├── agents/                  # Agent landing
│   ├── api/                     # API routes
│   │   ├── admin/               # Admin endpoints
│   │   ├── agent/               # Agent endpoints
│   │   ├── data/                # Data purchase
│   │   ├── ecommerce/           # E-commerce
│   │   ├── products/            # Product listing
│   │   ├── data-plans/          # Data plan listing
│   │   ├── transactions/        # Transaction tracking
│   │   ├── support/             # Support tickets
│   │   ├── system/              # System messages
│   │   ├── webhook/             # Payment webhooks
│   │   └── fcm/                 # Firebase messaging
│   ├── app/                     # Main app entry (client)
│   │   ├── layout.tsx
│   │   └── page.tsx             # Tabbed interface
│   ├── giveaway/
│   ├── privacy/
│   └── globals.css
│
├── lib/                         # Utility modules
│   ├── amigo.ts                # Amigo API (data delivery)
│   ├── auth.ts                 # Auth helpers
│   ├── firebase-admin.ts       # Firebase admin setup
│   ├── flutterwave.ts          # Flutterwave integration
│   ├── logger.ts               # Logging
│   ├── prisma.ts               # Database client
│   └── rateLimiter.ts          # Rate limiting
│
├── prisma/
│   ├── schema.prisma           # Database schema
│   └── seed.ts                 # Database seeding
│
├── public/                     # Static assets
│   ├── manifest.json           # PWA manifest
│   └── firebase-messaging-sw.js # Service worker
│
├── components/                 # React components (if any)
├── .env.local                  # Environment variables (local)
├── .env.example                # Environment variables (example)
├── tailwind.config.ts          # Tailwind configuration
├── tsconfig.json               # TypeScript config
├── next.config.js              # Next.js config
├── postcss.config.js           # PostCSS config
├── package.json                # Dependencies
└── APP_DOCUMENTATION.md        # Full documentation
```

---

## 🔐 Security Features

✅ **PIN Hashing** - bcryptjs (10 salt rounds)  
✅ **Rate Limiting** - 5 attempts per 24 hours  
✅ **Request Validation** - Zod schemas  
✅ **Webhook Verification** - SHA256 signature  
✅ **HTTPS Only** - Production only  
✅ **Environment Secrets** - Never hardcoded  

---

## 🧪 Testing Checklist

Before going live, test:

- [ ] Database connection working
- [ ] Agent registration flow
- [ ] Agent login with PIN
- [ ] Data purchase initiation
- [ ] E-commerce purchase flow
- [ ] Flutterwave webhook reception
- [ ] Admin dashboard accessible
- [ ] Rate limiting working
- [ ] FCM notifications sending
- [ ] Transaction tracking
- [ ] Receipt generation

---

## 🌐 Deployment to Vercel

1. Push to GitHub main branch
2. Connect Vercel to your GitHub repository
3. Add environment variables in Vercel dashboard
4. Deploy automatically on push

**Key environment variables for Vercel:**
- DATABASE_URL
- FLUTTERWAVE_SECRET_KEY
- FLUTTERWAVE_WEBHOOK_SECRET
- AMIGO_API_KEY
- FIREBASE_SERVICE_ACCOUNT_KEY
- ADMIN_PASSWORD
- MY_BVN

---

## 📞 Troubleshooting

### **Database Connection Error**
```bash
# Check DATABASE_URL format
# postgresql://user:password@host:port/database
npx prisma db push
```

### **Amigo API Failing**
- Verify AMIGO_API_KEY
- Check AMIGO_BASE_URL ends with `/`
- Test network connectivity

### **Flutterwave Webhook Not Received**
- Verify webhook URL in Flutterwave dashboard
- Check FLUTTERWAVE_WEBHOOK_SECRET matches
- Review logs: `/api/admin/webhooks`

### **Admin Login Not Working**
- Verify ADMIN_PASSWORD matches exactly (case-sensitive)
- Check for extra spaces in .env.local

---

## 🎯 Next Steps

1. **Setup Database** - Create PostgreSQL instance
2. **Configure APIs** - Add all API keys to .env.local
3. **Test Locally** - Run `npm run dev` and test flows
4. **Setup Firebase** - Create FCM project
5. **Deploy to Vercel** - Push to GitHub, connect Vercel
6. **Monitor** - Check logs and webhook delivery

---

## 📚 Documentation

Full detailed documentation available in:
- [APP_DOCUMENTATION.md](APP_DOCUMENTATION.md) - Complete technical docs
- [.env.example](.env.example) - Environment variables template
- [prisma/schema.prisma](prisma/schema.prisma) - Database schema

---

## 🎉 You're Ready!

The new Sauki Mart website is now integrated with:
- ✅ Full routing and API endpoints
- ✅ Modular lib structure
- ✅ Database schema
- ✅ Environment configuration template
- ✅ Complete documentation

**Next: Configure your environment variables and deployment settings!**

---

**Import Commit:** `28fdd94`  
**Last Updated:** March 2, 2026

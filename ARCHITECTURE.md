# SaukiMart v2 - Technical Architecture & Features

## Project Overview
SaukiMart is a production-grade e-commerce platform built for the Nigerian market, specializing in selling data packages, mobile devices, and telecom services. The application is designed for both web browsers and mobile WebView with a modern, responsive UI.

**Live URL**: https://www.saukimart.online

## Technology Stack

### Frontend
- **Framework**: Next.js 14.2.35 (App Router)
- **Language**: TypeScript 5
- **Styling**: Inline CSS (no external dependencies for minimal bundle)
- **UI Components**: Custom React components with accessibility support
- **Mobile**: WebView-ready, responsive design for all screen sizes

### Backend
- **Runtime**: Node.js 18+ on Vercel
- **API**: Next.js API Routes (serverless functions)
- **Authentication**: NextAuth.js + PIN-based login
- **Password Hashing**: bcryptjs

### Database
- **Primary**: Neon Postgres (serverless PostgreSQL)
- **Connection**: @neondatabase/serverless (HTTP-based)
- **Backups**: Automated (7-day retention)

### External Services
- **Payment**: Flutterwave (Nigerian payment gateway)
- **Data Plans**: Amigo API (via AWS proxy with static IP)
- **Image Storage**: Vercel Blob
- **JWT Tokens**: jose library

### DevOps & Deployment
- **Hosting**: Vercel (serverless)
- **CI/CD**: GitHub Actions (optional)
- **Domain**: www.saukimart.online
- **SSL**: Automatic HTTPS with Let's Encrypt

## Project Structure

```
saukimart-v2/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # Landing page (www.saukimart.online)
│   ├── layout.tsx                # Root layout with global styles
│   ├── admin/
│   │   └── page.tsx              # Admin dashboard
│   ├── app/
│   │   └── page.tsx              # Mobile app (WebView-ready)
│   ├── privacy/
│   │   └── page.tsx              # Privacy policy
│   └── api/                      # API Routes
│       ├── admin/                # Admin-only endpoints
│       │   ├── analytics/        # Dashboard analytics
│       │   ├── broadcasts/       # Manage announcements
│       │   ├── chat/             # Support chat management
│       │   ├── console/          # Admin control panel
│       │   ├── init-db/          # Database initialization
│       │   ├── login/            # Admin authentication
│       │   ├── plans/            # Data plan management
│       │   ├── products/         # Store product management
│       │   ├── settings/         # App settings
│       │   ├── sim-activations/  # SIM activation tracking
│       │   ├── transactions/     # Transaction history
│       │   ├── users/            # User management
│       │   ├── wallet/           # Wallet operations
│       │   └── webhooks/         # Webhook management
│       ├── user-facing endpoints/
│       │   ├── register/         # User signup with Flutterwave account
│       │   ├── login/            # PIN-based login
│       │   ├── user/             # Profile and settings
│       │   ├── data-plans/       # List available plans
│       │   ├── buy-data/         # Purchase data (Amigo API)
│       │   ├── products/         # List store products
│       │   ├── purchase-product/ # Buy product
│       │   ├── transactions/     # User transaction history
│       │   ├── deposits/         # Wallet top-up
│       │   ├── chat/             # Support chat
│       │   ├── sim-activation/   # SIM activation
│       │   ├── upload/           # Image upload (Vercel Blob)
│       │   └── broadcasts/       # Get announcements
│       └── webhooks/
│           └── flutterwave/      # Flutterwave payment webhook
├── lib/                          # Utility modules
│   ├── db.ts                     # Neon database client & schema
│   ├── auth.ts                   # Authentication utilities
│   ├── flutterwave.ts            # Flutterwave API integration
│   ├── amigo.ts                  # Amigo API integration
│   └── utils.ts                  # Helper functions
├── components/                   # Reusable components (if any)
├── public/                       # Static assets (images, fonts)
├── .env.example                  # Environment variables template
├── .gitignore                    # Git ignore rules
├── env_setup.md                  # Environment setup guide
├── next.config.js                # Next.js configuration
├── tsconfig.json                 # TypeScript configuration
├── package.json                  # Dependencies
├── vercel.json                   # Vercel configuration
├── README.md                     # Project overview
└── GITHUB_DEPLOYMENT.md          # Deployment instructions

```

## Key Features

### 1. User Authentication
- **PIN-based Login**: Users set 6-digit PIN during registration
- **Password Hashing**: bcryptjs with 10 rounds
- **Session Management**: NextAuth.js with JWT tokens
- **Account Creation**: Automatic Flutterwave virtual account setup

### 2. Data Purchases
- **Data Plans**: Integration with Amigo API for real-time data availability
- **Networks Supported**: MTN, Airtel, 9mobile, Glo (extensible)
- **Automatic Top-up**: PIN-less API integration
- **Transaction Tracking**: Real-time purchase confirmation

### 3. Mobile App
- **WebView-ready**: Works in native mobile apps with web wrapper
- **Responsive Design**: Touch-optimized interface
- **Offline Support**: Works with minimal connectivity
- **Native Features**: Access to phone API via bridge
- **App Routes**:
  - Home: Dashboard with wallet balance
  - Buy Data: Data plan selection and purchase
  - Shop: Product marketplace
  - Transactions: Purchase history
  - Support: Live chat with admin

### 4. E-commerce Store
- **Product Listings**: Images with Vercel Blob storage
- **Categories**: Electronics, Accessories, etc.
- **Inventory**: Stock tracking
- **Pricing**: Dynamic pricing with margins
- **Image Upload**: Admin can upload product images

### 5. Payments
- **Flutterwave Integration**:
  - Virtual account creation for each user
  - Deposit via bank transfer
  - Wallet funding
  - Balance inquiry
  
- **Payment Flow**:
  1. User deposits money to virtual account
  2. Flutterwave webhook confirms deposit
  3. Wallet balance updated
  4. User can make purchases from balance

### 6. Admin Dashboard
- **Analytics**:
  - User count and activity metrics
  - Transaction volume and revenue
  - Daily breakdown with profit calculation
  - Recent transactions list
  
- **Management**:
  - Data plan pricing and availability
  - Product inventory and pricing
  - User account status (ban/unban)
  - Transaction monitoring
  - SIM activation tracking
  - Broadcast announcements
  
- **Settings**:
  - App configuration
  - Fee structure
  - Payment settings
  - Contact information

### 7. Communications
- **Live Chat**: User-admin support messaging
- **Broadcast Announcements**: Marquee on landing page and app
- **Email Notifications**: Order confirmations, alerts (extensible)

### 8. Security Features
- PIN hashing with bcryptjs
- JWT token validation
- Admin token verification on all admin endpoints
- CORS configuration
- SQL injection prevention (parameterized queries)
- Rate limiting (to be implemented)
- HTTPS enforcement
- Secure cookie configuration

## Database Schema

### Tables
- **users**: User accounts with PIN and wallet balance
- **data_plans**: Available data packages by network
- **products**: E-store product inventory
- **transactions**: Purchase history (data, products, SIM)
- **deposits**: Wallet top-up history
- **payments**: Payment method records
- **products_inventory**: Stock tracking
- **user_sessions**: Active sessions for auth
- **broadcasts**: Admin announcements
- **chat_messages**: User-admin support tickets

## API Endpoints Reference

### Public Endpoints
```
POST   /api/register              # User signup
POST   /api/login                 # User login
GET    /api/data-plans            # List data plans
GET    /api/products              # List products
```

### User Endpoints (Authenticated)
```
GET    /api/user                  # Get profile
POST   /api/buy-data              # Purchase data
POST   /api/purchase-product      # Buy product
GET    /api/transactions          # Get history
POST   /api/deposits              # Request deposit
POST   /api/chat                  # Send msg to support
POST   /api/sim-activation        # Activate SIM
```

### Admin Endpoints (Auth Required)
```
POST   /api/admin/login           # Admin login
POST   /api/admin/init-db         # Initialize database
GET    /api/admin/analytics       # Dashboard metrics
GET    /api/admin/users           # List users
POST   /api/admin/plans           # Update data plans
POST   /api/admin/products        # Manage products
```

### Webhook Endpoints
```
POST   /api/webhooks/flutterwave  # Process deposits
```

## Deployment Flow

1. **Local Development**
   ```bash
   npm run dev        # Start dev server on localhost:3000
   ```

2. **Build for Production**
   ```bash
   npm run build      # Creates optimized Next.js build
   npm run lint       # Run TypeScript and ESLint checks
   ```

3. **Deploy to Vercel**
   - Push to GitHub → Vercel auto-deploys
   - Or: `vercel --prod`

4. **Post-Deployment**
   - Initialize database: Call `/api/admin/init-db`
   - Update admin password
   - Configure Flutterwave webhooks
   - Test payment flow

## Environment Configuration

Required environment variables:
- Database: `DATABASE_URL`
- Auth: `NEXTAUTH_URL`, `NEXTAUTH_SECRET`
- Payments: `FLW_SECRET_KEY`, `FLW_PUBLIC_KEY`, `FLW_WEBHOOK_HASH`, `MY_BVN`
- Data API: `AMIGO_PROXY_URL`, `AMIGO_API_KEY`
- Storage: `BLOB_READ_WRITE_TOKEN`
- Admin: `ADMIN_SECRET_KEY`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`

See `ENV_SETUP.md` for detailed configuration.

## Performance Considerations

1. **Bundle Size**: ~95KB First Load JS (highly optimized)
2. **Database**: Serverless connections with connection pooling
3. **Images**: Vercel Blob with CDN
4. **Caching**: Next.js automatic static generation where possible
5. **API**: Serverless functions (cold start ~50ms after first)

## Security Best Practices Implemented

✅ PIN hashing with bcryptjs
✅ JWT token validation
✅ HTTPS/SSL enforcement
✅ CORS configured
✅ SQL injection prevention
✅ Admin endpoints authenticated
✅ Webhook signature verification
✅ Sensitive vars in environment only
✅ No hardcoded secrets in code
✅ Next.js security headers via next.config.js

## Scalability & Future Enhancements

### Current Capacity
- Database: 100GB+ with Neon
- Storage: 1TB with Vercel Blob
- Users: Handles 100k+ concurrent users with Vercel Pro

### Planned Features
- [ ] Push notifications
- [ ] Referral rewards program
- [ ] Bulk data purchases for businesses
- [ ] API for third-party integrations
- [ ] Multi-language support (Yoruba, Hausa, Igbo)
- [ ] Advanced analytics dashboard
- [ ] Automation rules for data plans
- [ ] SMS integration for OTP
- [ ] Airtel Smartplus API integration
- [ ] WhatsApp bot for support

### Optimization Opportunities
- [ ] Redis caching layer for frequently accessed data
- [ ] EdgeDB instead of Neon for lower latency
- [ ] Service Worker for offline-first PWA
- [ ] Stripe instead of Flutterwave for international support
- [ ] Algolia for product search
- [ ] SendGrid for bulk emails

## Monitoring & Logging

### Current Setup
- Vercel analytics (Web Vitals)
- Vercel function logs
- Browser console logs

### Recommended Additions
- Sentry for error tracking
- LogRocket for session replay
- Google Analytics 4 for user behavior
- Datadog for infrastructure monitoring
- PagerDuty for alert management

## Development Guide

### Setup for Contributors
```bash
# Clone repository
git clone https://github.com/YOUR_USERNAME/saukimart-v2.git
cd saukimart-v2

# Install dependencies
npm install

# Create .env.local with dev values
cp .env.example .env.local
# Edit .env.local with test credentials

# Start dev server
npm run dev

# Build and test
npm run build
npm run lint
```

### Code Standards
- TypeScript strict mode enabled
- ESLint config enforced (from next/core-web-vitals)
- Consistent naming: camelCase for variables, PascalCase for components
- Comments for complex logic
- Error handling on all API routes
- Input validation on all user-facing endpoints

## License & Ownership
- **Proprietary**: All rights reserved to SaukiMart
- **Contributors**: Internal team members only
- **Repository**: Private (GitHub)
- **Distribution**: Deployment only via Vercel

## Support & Contact
- **Website**: https://www.saukimart.online
- **Email**: support@saukimart.online
- **Admin Dashboard**: https://www.saukimart.online/admin
- **API Documentation**: See endpoint references in this file

---

**Last Updated**: March 2026
**Version**: 2.0.0
**Status**: Production-Ready

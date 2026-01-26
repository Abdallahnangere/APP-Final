<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Sauki Mart - Premium Mobile Commerce Platform

This is the official Sauki Mart application repository. Sauki Mart is Nigeria's #1 app for instant mobile data, airtime, and premium gadgets.

**Live at:** https://www.saukimart.online

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables in `.env.local`:
   ```bash
   DATABASE_URL=your_postgresql_connection_string
   FLUTTERWAVE_PUBLIC_KEY=your_flutterwave_public_key
   NEXT_PUBLIC_DOMAIN=www.saukimart.online
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [https://www.saukimart.online](https://www.saukimart.online) in your browser.

## Build for Production

```bash
npm run build
npm start
```

## Tech Stack

- **Framework:** Next.js 14 with TypeScript
- **Database:** PostgreSQL with Prisma ORM
- **Styling:** Tailwind CSS with Framer Motion
- **Payment:** Flutterwave Integration
- **PWA:** Service Worker enabled for offline support
- **Deployment:** Cloud Hosted (www.saukimart.online)

## Features

- 📱 Instant Mobile Data Purchase (MTN, Airtel, GLO)
- 💰 Agent System with Balance Management
- 🛒 E-Commerce Store for Premium Gadgets
- 💳 Secure Payment Processing via Flutterwave
- 📊 Admin Dashboard for System Management
- 🛟 Customer Support System
- ⚡ Progressive Web App (PWA)
- 🔒 SMEDAN Certified Business

## License

Private - All rights reserved.

# Environment Setup Guide for SaukiMart v2

## Overview
This document provides instructions for setting up all required environment variables for the SaukiMart application.

## Setup Steps

### 1. Create .env.local file
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

## Required Environment Variables

### Database Configuration
**DATABASE_URL** (String, Required)
- PostgreSQL connection string for Neon database
- Format: `postgresql://user:password@host/database?sslmode=require`
- Get from: Vercel Dashboard → Storage → Postgres
- Example: `postgresql://neon_user:abc123@ep-cool-db.neon.tech/saukimart?sslmode=require`

### NextAuth Configuration
**NEXTAUTH_URL** (String, Required)
- Public URL of your application
- Local development: `http://localhost:3000`
- Production: `https://www.saukimart.online`

**NEXTAUTH_SECRET** (String, Required)
- Generate a secure random string (minimum 32 characters)
- Generate with: `openssl rand -base64 32` (Linux/Mac) or use Node.js:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
- Must be different for development and production
- Keep this secret and never commit to git

### Flutterwave Payment Configuration
**FLW_SECRET_KEY** (String, Required)
- Flutterwave API secret key
- Get from: Flutterwave Dashboard → Settings → API Keys
- Test key starts with `FLWSECK_TEST-`
- Live key starts with `FLWSECK-`

**FLW_PUBLIC_KEY** (String, Required)
- Flutterwave API public key
- Get from: Flutterwave Dashboard → Settings → API Keys
- Test key starts with `FLWPUBK_TEST-`
- Live key starts with `FLWPUBK-`

**FLW_WEBHOOK_HASH** (String, Required)
- Webhook signature hash from Flutterwave
- Get from: Flutterwave Dashboard → Settings → Webhooks
- Used to verify incoming webhook requests

**MY_BVN** (String, Required)
- Bank Verification Number for virtual account creation
- Nigerian 11-digit BVN
- Example: `22222222222` (use valid BVN in production)

### Amigo API Configuration
**AMIGO_PROXY_URL** (String, Required)
- URL of your AWS proxy server for Amigo API requests
- Must be a static IP address for Amigo API allowlisting
- Example: `https://your-aws-ec2-instance.com/api/data/`
- Ensure it ends with a trailing slash

**AMIGO_API_KEY** (String, Required)
- API key for Amigo Data API
- Get from: Amigo API provider credentials
- Used for data plan queries and purchases

### Vercel Blob Configuration
**BLOB_READ_WRITE_TOKEN** (String, Required)
- Vercel Blob storage authentication token
- Get from: Vercel Dashboard → Storage → Blob → Tokens
- Format: `vercel_blob_rw_xxxxxxxxxxxxx`
- Used for storing product images and receipts

### Admin Configuration
**ADMIN_SECRET_KEY** (String, Required)
- Super admin authentication key
- Generate: `openssl rand -base64 32`
- Used in Bearer tokens for admin API endpoints

**ADMIN_EMAIL** (String, Required)
- Email address for admin login
- Default: `admin@saukimart.online`
- Can be changed to any valid email

**ADMIN_PASSWORD** (String, Required)
- Admin account password (will be hashed on first login)
- Minimum 8 characters with uppercase, lowercase, and special characters
- Example: `ChangeMe@2026!`
- Change immediately after first login

### Public Configuration
**NEXT_PUBLIC_APP_URL** (String, Required)
- Public application URL (visible in browser)
- Local: `http://localhost:3000`
- Production: `https://www.saukimart.online`
- This value is prefixed with `NEXT_PUBLIC_` so it's included in client-side bundles

## Development (.env.local)
Example for local development:
```env
DATABASE_URL=postgresql://dev:password@localhost:5432/saukimart_dev?sslmode=disable
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=dev-secret-change-this-64-char-minimum-string-here
FLW_SECRET_KEY=FLWSECK_TEST-test-key-xxx
FLW_PUBLIC_KEY=FLWPUBK_TEST-test-key-xxx
FLW_WEBHOOK_HASH=test-webhook-hash
MY_BVN=22222222222
AMIGO_PROXY_URL=http://localhost:3001/api/data/
AMIGO_API_KEY=test-amigo-key
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_test
ADMIN_SECRET_KEY=dev-admin-key-change-this-64-char-min
ADMIN_EMAIL=admin@localhost
ADMIN_PASSWORD=Dev@2026123!
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Production (.env.production.local)
Example for production (on Vercel):
```env
DATABASE_URL=[Vercel-provided Neon URL]
NEXTAUTH_URL=https://www.saukimart.online
NEXTAUTH_SECRET=[Securely generated 32+ char string]
FLW_SECRET_KEY=FLWSECK-[Your live key]
FLW_PUBLIC_KEY=FLWPUBK-[Your live key]
FLW_WEBHOOK_HASH=[Your webhook hash]
MY_BVN=[Valid BVN number]
AMIGO_PROXY_URL=[Your AWS static IP proxy URL]
AMIGO_API_KEY=[Your Amigo API key]
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_[Your token]
ADMIN_SECRET_KEY=[Securely generated 32+ char string]
ADMIN_EMAIL=admin@saukimart.online
ADMIN_PASSWORD=[Strong password]
NEXT_PUBLIC_APP_URL=https://www.saukimart.online
```

## Vercel Deployment Setup

### 1. Set Environment Variables
In Vercel Dashboard → Settings → Environment Variables:
1. Add all production env vars above
2. Select environments: Production (and Staging if needed)
3. Save changes

### 2. Database Setup
1. Add Neon Postgres database from Storage tab
2. Copy DATABASE_URL
3. Set it in environment variables

### 3. Deploy
```bash
# Push code to GitHub (connected to Vercel)
git push origin main

# Or manually deploy
vercel --prod
```

## Security Checklist
- [ ] Never commit `.env.local` to git (already in .gitignore)
- [ ] Use strong, unique values for all SECRET keys
- [ ] Rotate NEXTAUTH_SECRET and ADMIN_SECRET_KEY regularly
- [ ] Use live Flutterwave keys in production
- [ ] Allow-list your AWS proxy IP in Amigo API settings
- [ ] Enable webhook signature verification for Flutterwave
- [ ] Use HTTPS everywhere in production URLs
- [ ] Store secrets in Vercel dashboard, not in code

## Troubleshooting

### "No database connection string was provided"
- Check DATABASE_URL is set correctly
- Ensure the database is running
- Verify network connectivity to database host

### "Invalid NEXTAUTH_SECRET"
- Must be at least 32 characters
- Generate a new one with: `openssl rand -base64 32`

### Flutterwave webhook not working
- Verify FLW_WEBHOOK_HASH is correct
- Check webhook URL in Flutterwave dashboard
- Ensure your server is publicly accessible

### Image uploads failing
- Verify BLOB_READ_WRITE_TOKEN is correct
- Check Vercel Blob storage quota
- Ensure token has read-write permissions

## Reference Links
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Vercel Documentation](https://vercel.com/docs)
- [Neon Database](https://neon.tech/docs)
- [NextAuth.js](https://next-auth.js.org/getting-started/example)
- [Flutterwave Docs](https://developer.flutterwave.com/docs)

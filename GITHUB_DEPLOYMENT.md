# GitHub & Vercel Deployment Guide

## Overview
This document provides step-by-step instructions to push SaukiMart to GitHub and deploy on Vercel with automatic CI/CD pipeline.

## Prerequisites
- GitHub account (create at https://github.com)
- Git installed locally (configured with user.email and user.name)
- Vercel account (create at https://vercel.com)
- OpenSSL or equivalent for generating secure keys

## Part 1: Create GitHub Repository

### 1. Create Repository on GitHub
1. Go to https://github.com/new
2. Fill in repository details:
   - **Repository name**: `saukimart-v2` (or your preferred name)
   - **Description**: "Production-grade e-commerce platform for Nigerian data and device sales"
   - **Visibility**: `Private` (for security, or Public if you want open source)
   - **Initialize without README** (we already have one)
3. Click **Create repository**

### 2. Add Remote and Push Code
In your local project directory:

```bash
# Add the remote repository
git remote add origin https://github.com/YOUR_USERNAME/saukimart-v2.git

# Verify remote was added
git remote -v
# Should show:
# origin  https://github.com/YOUR_USERNAME/saukimart-v2.git (fetch)
# origin  https://github.com/YOUR_USERNAME/saukimart-v2.git (push)

# Rename branch to main (GitHub default)
git branch -M main

# Push to GitHub
git push -u origin main
```

**Note**: If you have 2FA enabled, use:
- Personal Access Token instead of password
- Generate at: GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
- Scopes needed: `repo`, `workflow`, `admin:public_key`

### 3. Configure Branch Protection (Optional but Recommended)
In GitHub repository → Settings → Branches:
1. Click **Add rule**
2. Branch name pattern: `main`
3. Enable:
   - ☑ Require pull request reviews before merging (1 review)
   - ☑ Require status checks to pass before merging
   - ☑ Include administrators

## Part 2: Deploy on Vercel

### 1. Connect to Vercel
1. Go to https://vercel.com/dashboard
2. Click **Add New...** → **Project**
3. Select **Import Git Repository**
4. Connect your GitHub account (authorize if prompted)
5. Select your `saukimart-v2` repository
6. Click **Import**

### 2. Configure Environment Variables
On the **Configure Project** page:

1. Click **Environment Variables**
2. Add all production variables:

```
DATABASE_URL = [Neon PostgreSQL URL from Vercel Storage]
NEXTAUTH_URL = https://www.saukimart.online
NEXTAUTH_SECRET = [Generate: openssl rand -base64 32]
FLW_SECRET_KEY = FLWSECK-[your-live-key]
FLW_PUBLIC_KEY = FLWPUBK-[your-live-key]
FLW_WEBHOOK_HASH = [your-webhook-hash]
MY_BVN = [valid-11-digit-BVN]
AMIGO_PROXY_URL = https://your-aws-proxy.com/api/data/
AMIGO_API_KEY = [your-amigo-api-key]
BLOB_READ_WRITE_TOKEN = vercel_blob_rw_[your-token]
ADMIN_SECRET_KEY = [Generate: openssl rand -base64 32]
ADMIN_EMAIL = admin@saukimart.online
ADMIN_PASSWORD = [Strong password]
NEXT_PUBLIC_APP_URL = https://www.saukimart.online
```

3. Select **Production** environment (or unselect Preview/Development if testing)
4. Click **Deploy**

### 3. Add Neon Database (if not already connected)
1. In Vercel Dashboard → Storage → **Create Database**
2. Select **Postgres** → **Neon**
3. Authorize and create new database
4. Name it `saukimart-production`
5. Copy CONNECTION_STRING
6. Add to environment variables as `DATABASE_URL`

### 4. Configure Vercel Blob Storage
1. In Vercel Dashboard → Storage → **Create a Store**
2. Select **Blob**
3. Name it `saukimart-blob`
4. Create
5. Go to **Settings** → **Tokens**
6. Create **Read/Write Token**
7. Copy token as `BLOB_READ_WRITE_TOKEN`

### 5. Domain Configuration
1. In Vercel Project Settings → **Domains**
2. Add your domain: `saukimart.online` and `www.saukimart.online`
3. Update DNS settings:
   - For root domain (@): Add `A` record pointing to Vercel IP
   - For www: Add `CNAME` record: `cname.vercel-dns.com`
4. Verify domain is connected

### 6. Deploy
Your project should automatically deploy after you:
1. Push code to `main` branch:
```bash
git push origin main
```

Vercel will:
- Build the project
- Run Next.js build and linting
- Deploy to CDN
- Generate preview URL immediately

View deployment at: https://vercel.com/YOUR_USERNAME/saukimart-v2

## Part 3: Initial Database Setup

### 1. Initialize Database Schema
After first deployment:

```bash
# Get admin token
curl -X POST https://www.saukimart.online/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@saukimart.online","password":"ChangeMe@2026!"}'

# Copy the token from response

# Initialize database
curl -X POST https://www.saukimart.online/api/admin/init-db \
  -H "Authorization: Bearer YOUR_TOKEN"

# Response should show database tables created
```

### 2. Update Admin Password
1. Access admin dashboard: https://www.saukimart.online/admin
2. Login with: `admin@saukimart.online` / `ChangeMe@2026!`
3. Update password immediately

## Part 4: CI/CD Pipeline (GitHub Actions)

### 1. Create Workflow File
Create `.github/workflows/deploy.yml`:

```yaml
name: Build and Deploy

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [18.x, 20.x]
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Use Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'
      
      - run: npm ci
      
      - run: npm run lint
      
      - run: npm run build
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          NEXT_PUBLIC_API_URL: ${{ secrets.NEXT_PUBLIC_APP_URL }}

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v3
      
      - uses: vercel/action@main
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

### 2. Add GitHub Secrets
In GitHub Repository Settings → Secrets and variables → Actions → New repository secret:

```
VERCEL_TOKEN = [From Vercel Settings → Tokens]
VERCEL_ORG_ID = [From Vercel Team ID]
VERCEL_PROJECT_ID = [From Vercel Project ID]
```

## Part 5: Monitoring & Maintenance

### 1. Enable Vercel Analytics
1. In Vercel Project → Settings → **Analytics**
2. Enable **Web Analytics**
3. Install analytics script:
```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### 2. Setup Error Tracking
1. Install Sentry or Rollbar for error monitoring
2. Add to `.env.production.local`:
```
NEXT_PUBLIC_SENTRY_DSN=https://xxx@sentry.io/xxx
```

### 3. Configure Logging
1. View logs in Vercel Dashboard → **Logs** → **Functions**
2. Export logs to external service if needed

### 4. Regular Backups
1. Set up Neon automated backups (7-day retention in free tier)
2. Monthly full backups to S3 or Google Cloud Storage
3. Document disaster recovery procedure

## Troubleshooting

### Deployment Failed
```bash
# Check build logs in Vercel Dashboard
# Common causes:
# 1. Missing environment variables
# 2. Type errors in TypeScript
# 3. Memory limit exceeded
# 4. Build timeout (increase to 900s in Settings)
```

### Database Connection Issues
```bash
# Verify DATABASE_URL is correct
echo $DATABASE_URL

# Test connection with psql
psql $DATABASE_URL -c "SELECT version();"

# Check Neon dashboard for connection limits
```

### Webhook Not Working
1. Verify FLW_WEBHOOK_HASH in Vercel environment
2. Check Flutterwave webhook URL is correct
3. Test webhook with Postman
4. Check application logs for parse errors

### Performance Issues
1. Check Vercel Analytics for slow routes
2. Review Next.js build analysis: `ANALYZE=true npm run build`
3. Optimize images with next/image
4. Implement caching headers for static assets

## Security Checklist
- [ ] Repository is set to Private
- [ ] All secrets stored in Vercel environment variables
- [ ] HTTPS enabled and enforced
- [ ] Database backups configured
- [ ] Rate limiting enabled on API routes
- [ ] CORS properly configured
- [ ] CSP headers set in next.config.js
- [ ] Regular dependency updates scheduled
- [ ] Vercel or GitHub security advisories reviewed
- [ ] Admin password changed from default

## Next Steps
1. ✅ Push code to GitHub
2. ✅ Deploy to Vercel
3. Call `/api/admin/init-db` to create tables
4. Set up monitoring and logging
5. Configure custom domain
6. Set up team members with GitHub/Vercel access
7. Schedule regular security audits

## Support & Resources
- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [GitHub Actions](https://docs.github.com/en/actions)
- [Neon Documentation](https://neon.tech/docs)

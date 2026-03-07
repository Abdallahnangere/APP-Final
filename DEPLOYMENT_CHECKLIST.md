# ⚡ Quick Reference — Deployment Checklist

**Print this and check off as you go. Estimated time: 2-3 hours**

---

## 🔧 Pre-Deployment Setup (30 mins)

### 1. Build & Dependencies
- [ ] Run: `npm install`
- [ ] Run: `npm audit fix`
- [ ] Run: `npm run lint` (fix any warnings)
- [ ] Run: `npm run build` (verify no build errors)
- [ ] Expected output: `.next/` folder created successfully

### 2. GitHub Repository
- [ ] All code committed: `git status` (should show clean)
- [ ] Remote connected: `git remote -v` (should show origin)
- [ ] Push to main: `git push origin main`

### 3. Vercel Project Setup
- [ ] Create account at https://vercel.com
- [ ] Click "New Project"
- [ ] Import GitHub repository: github.com/YOUR_ORG/saukifinal
- [ ] Framework: Next.js (auto-detected)
- [ ] Root directory: `.` (root)
- [ ] Build command: `npm run build`
- [ ] Click "Deploy" (will fail without env vars — that's OK)

---

## 🔐 Environment Variables (45 mins)

**In Vercel Dashboard → Settings → Environment Variables**

Copy & paste each pair, then click "Save":

```
DATABASE_URL
postgresql://user:password@ep-xxx.neon.tech:5432/saukimart?sslmode=require

NEXTAUTH_SECRET
[Generate: openssl rand -base64 32]

NEXTAUTH_URL
https://www.saukimart.online

ADMIN_SECRET_KEY
[Random 32-char secret for admin requests]

FLW_SECRET_KEY
FLWSECK_LIVE_xxxxxxxxxxxxxxxxxxxxxxxx

FLW_PUBLIC_KEY
FLWPUBK_LIVE_xxxxxxxxxxxxxxxxxxxxxxxx

FLW_WEBHOOK_HASH
[From Flutterwave Dashboard]

MY_BVN
[Your BVN number]

AMIGO_PROXY_URL
https://your-aws-proxy.com/api/data/

AMIGO_API_KEY
[Your API token]

BLOB_READ_WRITE_TOKEN
vercel_blob_rw_xxxxxxxxxxxxxxxx

ADMIN_EMAIL
admin@saukimart.online

ADMIN_PASSWORD
ChangeMe@2026!

NEXT_PUBLIC_APP_URL
https://www.saukimart.online
```

- [ ] All 13 variables added
- [ ] Saved successfully (no errors)

---

## 🗄️ Database Setup (20 mins)

### 1. Neon Cloud Setup
- [ ] Create account at https://neon.tech
- [ ] Create project: "saukimart-prod"
- [ ] Region: Europe (Frankfurt)
- [ ] Copy connection string: `postgresql://...`
- [ ] Paste as `DATABASE_URL` in Vercel

### 2. Initialize Database
- [ ] Deploy to Vercel (should succeed now)
- [ ] Call init endpoint (replace with your actual domain):
```bash
curl -X POST https://www.saukimart.online/api/admin/init-db \
  -H "Content-Type: application/json"
```
- [ ] Expected: "Database initialized successfully" ✅

### 3. Verify Tables Created
```bash
# In Neon console, run:
SELECT tablename FROM pg_tables WHERE schemaname='public';
```
- [ ] Should list 10 tables: users, data_plans, products, transactions, etc.

---

## 💳 Payment Gateway Setup (30 mins)

### 1. Flutterwave Configuration
- [ ] Go to Dashboard: https://dashboard.flutterwave.com
- [ ] Settings → API Keys
- [ ] Copy LIVE Secret Key: `FLWSECK_LIVE_...` ✓
- [ ] Copy LIVE Public Key: `FLWPUBK_LIVE_...` ✓
- [ ] Copy Webhook Hash: (Settings → Webhooks)
- [ ] Add webhook URL: `https://www.saukimart.online/api/webhooks/flutterwave`
- [ ] Test webhook with sample charge.completed event

### 2. Test Flutterwave Integration
```bash
curl -X POST https://www.saukimart.online/api/admin/console \
  -H "x-admin-key: YOUR_ADMIN_SECRET_KEY" \
  -H "Content-Type: application/json" \
  -d '{"action": "test_flutterwave"}'
```
- [ ] Expected: Virtual account should be created successfully

### 3. Amigo API Setup
- [ ] Get API key from Amigo support
- [ ] Verify static IP proxy is running
- [ ] Test with sample data purchase:
```bash
curl -X POST https://www.saukimart.online/api/admin/console \
  -H "x-admin-key: YOUR_ADMIN_SECRET_KEY" \
  -H "Content-Type: application/json" \
  -d '{"action": "test_amigo", "network": 1}'
```
- [ ] Expected: Should return available MTN data plans

---

## 🌐 Domain & SSL Setup (15 mins)

### 1. Domain Configuration
- [ ] Domain: `saukimart.online` (from registrar)
- [ ] Update nameservers to Vercel:
  - `ns1.vercel-dns.com`
  - `ns2.vercel-dns.com`
  - `ns3.vercel-dns.com`
  - `ns4.vercel-dns.com`
- [ ] Wait 24 hours for propagation
- [ ] Verify: `nslookup saukimart.online` (should return Vercel IPs)

### 2. Vercel Domain Setup
- [ ] In Vercel dashboard → Settings → Domains
- [ ] Add domain: `www.saukimart.online`
- [ ] Verify DNS records (Vercel auto-creates CNAME)
- [ ] SSL certificate auto-issued (green checkmark ✅)

### 3. Test Live Access
- [ ] Visit: https://www.saukimart.online
- [ ] Expected: Landing page loads, no SSL warnings
- [ ] Check certificate: Click lock icon → View certificate

---

## ✅ Testing (45 mins)

### 1. User Registration Flow
```
Flow:
1. Visit https://www.saukimart.online/app
2. Click "Register"
3. Enter phone: +2348012345678
4. Set PIN: 123456
5. Click submit
Expected: Success message + JWT token stored
Check: New user in database, Flutterwave virtual account created
```

### 2. Admin Login
```
Flow:
1. Visit https://www.saukimart.online/admin
2. Email: admin@saukimart.online
3. Password: ChangeMe@2026!
4. Click login
Expected: Admin dashboard loads
Check: Can see Users, Products, Analytics sections
*** IMPORTANT: Change password immediately after first login ***
```

### 3. Data Purchase Simulation
```
Flow:
1. User registers and deposits ₦5,000 via virtual account
2. Wait for Flutterwave webhook to credit wallet
3. User clicks "Buy Data" → Select MTN → 500MB → ₦100
4. Enter PIN, confirm
Expected: Transaction successful, data transferred, wallet debited
Check: Transaction record in database, Amigo API log
```

### 4. Product Purchase Simulation
```
Flow:
1. User clicks "Store" 
2. Select product (e.g., SIM card)
3. Add to cart
4. Proceed to checkout
5. Enter PIN, confirm
Expected: Order placed, inventory updated
Check: Product inventory decreases by 1
```

---

## 🚀 Go/No-Go Decision

### Green Light ✅ (Deploy)
- [ ] All 13 environment variables set
- [ ] Database initialized with tables
- [ ] Flutterwave integration tested
- [ ] Amigo API responding correctly
- [ ] Admin dashboard accessible
- [ ] User registration working
- [ ] Data purchase flow operational
- [ ] No critical errors in Vercel logs

### Yellow Light ⚠️ (Fix & Re-test)
- [ ] Minor bugs in non-critical features
- [ ] Cosmetic issues in UI
- [ ] Missing notifications (emails, SMS)
- [ ] Some test cases failing

### Red Light ❌ (Do Not Deploy)
- [ ] Database connection failing
- [ ] Flutterwave integration broken
- [ ] Admin dashboard inaccessible
- [ ] Payment processing not working
- [ ] Critical security issues
- [ ] Data loss or corruption

---

## 📋 Final Deployment Steps

### 1. Vercel Deployment
- [ ] All checks passing
- [ ] Click "Promote to Production" in Vercel
- [ ] Wait for green checkmark (2-3 mins)
- [ ] Check: https://www.saukimart.online (should load)

### 2. Post-Deployment Verification
```
All of the following should work:
✅ https://www.saukimart.online (landing page)
✅ https://www.saukimart.online/app (app)
✅ https://www.saukimart.online/admin (admin)
✅ POST https://www.saukimart.online/api/register (user registration)
✅ POST https://www.saukimart.online/api/login (user login)
✅ GET https://www.saukimart.online/api/data-plans (fetch plans)
```

- [ ] All endpoints returning 200/correct status
- [ ] No 500 errors in logs
- [ ] Webhook logs show clean history

### 3. Monitoring Setup
- [ ] Set up Vercel alerts (email on errors)
- [ ] Set up Sentry or error tracking (optional)
- [ ] Establish on-call rotation
- [ ] Document rollback procedure

---

## 🆘 If Something Goes Wrong

### Issue: Database connection failing
```
Solution:
1. Check DATABASE_URL in Vercel is correct
2. Verify Neon project is running
3. Restart Neon connection pool (Neon dashboard)
4. Redeploy from Vercel
```

### Issue: Flutterwave webhook not firing
```
Solution:
1. Verify webhook URL in Flutterwave: https://www.saukimart.online/api/webhooks/flutterwave
2. Verify FLW_WEBHOOK_HASH is correct
3. Test with manual webhook from Flutterwave dashboard
4. Check webhook logs: GET /api/admin/webhooks
```

### Issue: Admin login not working
```
Solution:
1. Verify ADMIN_EMAIL and ADMIN_PASSWORD in Vercel
2. Check admin user exists in database (query: SELECT * FROM site_settings WHERE key='admin_email')
3. Verify NEXTAUTH_SECRET is set
4. Clear browser cookies and try again
```

### Issue: Need to Rollback
```
Steps:
1. In Vercel dashboard → Deployments
2. Find last working deployment
3. Click "..." → "Promote to Production"
4. Takes ~2-3 minutes
5. Verify: https://www.saukimart.online loads
```

---

## 📞 Support Resources

| Issue | Resource | Time |
|-------|----------|------|
| Vercel errors | Vercel Docs: https://vercel.com/docs | 5 mins |
| Database issues | Neon Support: support@neondatabase.io | 1 hour |
| Flutterwave issues | FLW Docs: https://developer.flutterwave.com | 30 mins |
| Code issues | GitHub Issues or review logs | 15 mins |
| Emergency | CTO hotline: +234 XXX XXX XXXX | Immediate |

---

## ✨ Congratulations! 🎉

Your SaukiMart platform is now live at **https://www.saukimart.online**

**Next steps:**
- [ ] Enable error tracking (Sentry or New Relic)
- [ ] Set up automated backups (Neon + Vercel)
- [ ] Configure email notifications
- [ ] Train support team
- [ ] Set up monitoring dashboard
- [ ] Begin soft-launch with beta users

---

**Last Update:** March 7, 2026 | Status: READY FOR DEPLOYMENT

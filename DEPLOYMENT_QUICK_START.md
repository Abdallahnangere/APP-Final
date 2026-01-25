# 🚀 Quick Deployment Guide - Sauki Mart Final Polish

## Pre-Deployment Checklist

- [ ] All code changes committed
- [ ] Database backup created
- [ ] Test environment ready

---

## Step 1: Deploy Database Changes (Neon SQL)

### Option A: Using psql CLI
```bash
# If you have psql installed:
psql "postgresql://user:password@host/database" < MIGRATION_CASHBACK.sql
```

### Option B: Using Neon Console
1. Go to Neon Console (https://console.neon.tech)
2. Select your database
3. Go to SQL Editor
4. Copy and paste contents from `MIGRATION_CASHBACK.sql`
5. Execute each statement

### Option C: Using Vercel/Railway Integration
```bash
# If you have access via Vercel:
vercel env pull  # Get DATABASE_URL
psql $DATABASE_URL < MIGRATION_CASHBACK.sql
```

---

## Step 2: Verify Database Migration

After running the SQL script, verify these tables exist:

```sql
-- Check tables created
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('CashbackTransaction', 'CashbackRedemption');

-- Check Agent columns added
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'Agent' 
AND column_name LIKE '%cashback%';

-- Check Transaction columns added
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'Transaction' 
AND column_name IN ('agentCashbackAmount', 'cashbackProcessed');
```

Expected output:
- `CashbackTransaction` table exists
- `CashbackRedemption` table exists
- `Agent` has: cashbackBalance, totalCashbackEarned, cashbackRedeemed, lastCashbackUpdate
- `Transaction` has: agentCashbackAmount, cashbackProcessed

---

## Step 3: Deploy Code Changes

### Using Vercel
```bash
# Push to GitHub
git add .
git commit -m "feat: Final polish - Google Play badge, cashback, receipt harmonization"
git push origin main

# Vercel will auto-deploy
# Or manually:
vercel deploy --prod
```

### Using Docker/Railway
```bash
# Build
npm install
npm run build

# Deploy
railway deploy
```

### Local Testing First
```bash
# Test locally before deploying
npm install
npm run dev

# Visit http://localhost:3000
# Test:
# 1. Homepage - Google Play badge
# 2. Agent Login - Digit-only input
# 3. Agent Dashboard - Cashback display
# 4. Support page - Enhanced layout
# 5. Receipts - Consistent design
```

---

## Step 4: Verify Deployment

After deployment, check:

### Homepage
- [ ] Google Play badge visible between name and menu
- [ ] Top border gradient visible
- [ ] Clicking badge opens Google Play store

### Agent Login
- [ ] Phone field only accepts digits
- [ ] PIN field only accepts digits (max 4)
- [ ] No alphabetic characters allowed

### Agent Dashboard
- [ ] Cashback card visible and green
- [ ] Transaction history scrollable
- [ ] Settings show enhanced options
- [ ] Quick actions include Track, Earnings, Redeem

### Support Page
- [ ] Header sticky at top
- [ ] Quick stats visible
- [ ] All contact buttons work
- [ ] FAQ section displays

### Receipts
- [ ] All screens show same receipt design
- [ ] Receipt is 1:1 square
- [ ] SAUKI MART branding visible
- [ ] Status badges show correctly

---

## Step 5: Troubleshooting

### Database Migration Failed

**Error: `relation "CashbackTransaction" already exists`**
```sql
-- This is fine, tables already exist from a previous migration
-- Just skip that CREATE statement
```

**Error: `permission denied`**
- Ensure your DATABASE_URL has proper permissions
- Check Neon dashboard for user roles

### Receipt Not Showing

Check browser console for errors:
```javascript
// BrandedReceipt should be imported
import { BrandedReceipt } from '../BrandedReceipt';
```

### Agent Login Still Accepts Letters

Clear browser cache and rebuild:
```bash
npm run build
npm start
```

---

## Step 6: Post-Deployment Testing

Run these manual tests:

### Test 1: Google Play Badge
1. Go to homepage
2. Look for "GET ON Google Play" badge
3. Click it
4. Should open: `https://play.google.com/store/apps/details?id=online.saukimart.twa`

### Test 2: Agent Login
1. Go to Agent section
2. Try typing "abc" in phone field
3. Only numbers should appear
4. Same for PIN field

### Test 3: Cashback
1. Login as agent
2. Look for green cashback card
3. Click to open redemption form
4. Fill form and submit
5. Should show success message

### Test 4: Receipt
1. Make a test transaction
2. Download receipt
3. Should be square format (1:1 aspect ratio)
4. Should have SAUKI MART logo and branding

### Test 5: Support
1. Go to Help & Support
2. Verify all contact buttons work
3. Check that complaint form opens
4. Verify WhatsApp link works

---

## Rollback Plan (If Needed)

### Database Rollback
```sql
-- Drop new tables (be careful!)
DROP TABLE IF EXISTS "CashbackRedemption" CASCADE;
DROP TABLE IF EXISTS "CashbackTransaction" CASCADE;

-- Remove new columns
ALTER TABLE "Agent" DROP COLUMN IF EXISTS "cashbackBalance";
ALTER TABLE "Agent" DROP COLUMN IF EXISTS "totalCashbackEarned";
ALTER TABLE "Agent" DROP COLUMN IF EXISTS "cashbackRedeemed";
ALTER TABLE "Agent" DROP COLUMN IF EXISTS "lastCashbackUpdate";

ALTER TABLE "Transaction" DROP COLUMN IF EXISTS "agentCashbackAmount";
ALTER TABLE "Transaction" DROP COLUMN IF EXISTS "cashbackProcessed";
```

### Code Rollback
```bash
git revert HEAD~1
vercel deploy --prod
```

---

## Performance Monitoring

After deployment, monitor:

1. **Page Load Time**
   - Homepage should load < 2s
   - Agent dashboard < 3s

2. **Database Queries**
   - Check indexes are being used
   - Monitor slow queries in Neon dashboard

3. **Error Tracking**
   - Check Sentry/LogRocket for errors
   - Monitor console errors in browser

4. **User Feedback**
   - Gather feedback on new UI
   - Check support tickets for issues

---

## Success Indicators

You've successfully deployed when:

✅ Google Play badge is visible and clickable  
✅ Agent login accepts only digits  
✅ Cashback feature is accessible  
✅ All receipts are harmonized  
✅ Transaction history is scrollable  
✅ Database migration completed without errors  
✅ All tests pass  
✅ No console errors  

---

## Support & Issues

If you encounter any issues:

1. Check console errors: `F12` → Console tab
2. Check Neon dashboard for database status
3. Verify DATABASE_URL is correct
4. Check Vercel deployment logs
5. Review FINAL_POLISH_IMPLEMENTATION.md for detailed info

---

## Timeline

| Task | Time | Status |
|------|------|--------|
| Database Migration | 5 min | ⏱️ |
| Code Deployment | 2 min | ⏱️ |
| Testing | 10 min | ⏱️ |
| Monitoring | Ongoing | ⏱️ |
| **Total** | **~20 min** | |

---

**Last Updated:** January 25, 2026  
**Deployed By:** Engineering Team  
**Status:** Ready for Deployment ✅

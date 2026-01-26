# Sauki Mart v2.5.1 - Quick Reference Guide

## 🚀 What Changed?

### Critical Fixes
✅ **PIN Change Now Works** - Agents can update PIN and it takes effect immediately
✅ **Cashback to Wallet** - All cashback now goes directly to agent balance
✅ **Better Sidebar** - Apple-style clean design instead of Android-like
✅ **Better Support** - All phone numbers have WhatsApp buttons

## 📋 For Users

### Agent Users
1. **Update PIN**
   - Go to Settings (gear icon in dashboard)
   - Enter new 4-digit PIN
   - PIN takes effect immediately

2. **View Cashback**
   - Displayed as green card on dashboard
   - Shows real-time balance
   - Click to view earning details

3. **Transaction History**
   - New dedicated page
   - Click "View All →" next to transaction history
   - Filter by type or search by phone
   - Scroll through all transactions

### Customer Users
1. **New Sidebar Design**
   - Cleaner, more iOS-like appearance
   - Toggle settings (Notifications, Dark Mode, Sounds, Haptics)
   - Settings auto-save

2. **Contact Support**
   - Support page now has WhatsApp buttons
   - Two support numbers available
   - Email: saukidatalinks@gmail.com

## 💻 For Developers

### Database Migration
```bash
# Connect to Neon
psql "postgresql://user:password@region.neon.tech/database" < MIGRATION_DATABASE_UPDATES.sql
```

### Environment Variables
No changes required if you're already using:
- `DATABASE_URL` ✅
- `FLUTTERWAVE_PUBLIC_KEY` ✅

### Key API Changes
**PIN Update Route** (`/api/agent/update-pin`)
- Now uses bcrypt verification
- Old PIN must match hash
- New PIN is hashed before saving

### New Components
- `AgentTransactionHistory.tsx` - Dedicated transaction page
- Updated `SideMenu.tsx` - Apple standard design

### Schema Changes
New tables:
- `CashbackTransaction` - tracks cashback earnings
- `AgentWalletTransaction` - tracks wallet credits
- `CashbackRule` - configurable cashback rates
- `AgentCashbackRedemption` - redemption requests

New Agent fields:
- `cashbackBalance` - current cashback
- `totalCashbackEarned` - lifetime earnings
- `cashbackRedeemed` - total redeemed

## 🔧 Deployment

### Step 1: Database
```bash
# Apply migration
npm run migrate
```

### Step 2: Build
```bash
npm run build
npm start
```

### Step 3: Test
- [ ] PIN change works
- [ ] Sidebar toggles respond
- [ ] Transaction history loads
- [ ] WhatsApp links work
- [ ] Email links work

## 📂 File Structure

```
Sauki Mart v2.5.1
├── app/
│   ├── api/
│   │   └── agent/
│   │       └── update-pin/route.ts (UPDATED - PIN hashing)
│   └── privacy/
│       └── page.tsx (UPDATED - email)
├── components/
│   ├── screens/
│   │   ├── Agent.tsx (UPDATED - transaction history)
│   │   ├── AgentTransactionHistory.tsx (NEW - dedicated page)
│   │   ├── Support.tsx (UPDATED - email & WhatsApp)
│   │   └── LegalDocs.tsx (UPDATED - email)
│   ├── SideMenu.tsx (UPDATED - Apple design)
│   └── BrandedReceipt.tsx (UPDATED - email)
├── MIGRATION_DATABASE_UPDATES.sql (NEW - DB schema)
└── README.md (UPDATED - removed Vercel/GEMINI)
```

## 🔐 Security

### PIN Security
- All PINs are bcrypt hashed (10 rounds)
- Old PIN verified before accepting new PIN
- No plaintext PINs in database

### Cashback Safety
- Transactions auto-calculated
- Admin approval for redemptions (future)
- Full audit trail in database

## 📞 Support Contacts

**Email:** saukidatalinks@gmail.com

**Phone & WhatsApp:**
- Customer Care: +234 806 193 4056
- Tech Support: +234 704 464 7081

**Website:** www.saukimart.online
**Play Store:** https://play.google.com/store/apps/details?id=online.saukimart.twa

## 📊 Rollback Plan

If issues occur:

### Full Rollback
```sql
-- Drop new tables
DROP TABLE IF EXISTS "AgentCashbackRedemption";
DROP TABLE IF EXISTS "CashbackRule";
DROP TABLE IF EXISTS "AgentWalletTransaction";
DROP TABLE IF EXISTS "CashbackTransaction";

-- Remove new columns
ALTER TABLE "Agent" DROP COLUMN IF EXISTS "cashbackBalance";
ALTER TABLE "Agent" DROP COLUMN IF EXISTS "totalCashbackEarned";
ALTER TABLE "Agent" DROP COLUMN IF EXISTS "cashbackRedeemed";
ALTER TABLE "Transaction" DROP COLUMN IF EXISTS "agentCashbackAmount";
```

### Code Rollback
```bash
git revert <commit-hash>
npm run build
npm start
```

## ✅ Verification Checklist

After deployment, verify:

### Core Features
- [ ] Agent PIN update works (try changing PIN and logging back in)
- [ ] Cashback shows on dashboard
- [ ] Transaction history page accessible
- [ ] All sidebar toggles functional

### UI/UX
- [ ] Sidebar opens/closes smoothly
- [ ] Dark mode applies correctly
- [ ] Google Play badge visible on homepage
- [ ] WhatsApp links open WhatsApp app
- [ ] Email links open mail client

### Data
- [ ] Agent balance updates correctly
- [ ] Transactions recorded properly
- [ ] Cashback calculated (2% on sales)
- [ ] All agents can see their history

### Integrations
- [ ] Payments still process
- [ ] Push notifications still work
- [ ] SMS/Email alerts still send

## 🎓 Learn More

For detailed information, see:
- `IMPLEMENTATION_COMPLETE_v2.5.1.md` - Full implementation details
- `MIGRATION_DATABASE_UPDATES.sql` - Database changes
- Code comments in modified files

## 📧 Questions?

Contact: saukidatalinks@gmail.com

---

**Version:** 2.5.1  
**Date:** January 26, 2026  
**Status:** ✅ PRODUCTION READY

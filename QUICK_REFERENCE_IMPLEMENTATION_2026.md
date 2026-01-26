# SAUKI MART - Implementation Quick Reference Guide

## 🚀 Quick Start

### Build & Deploy
```bash
# Generate Prisma client
npx prisma generate

# Build for production
npm run build

# Start development
npm run dev

# Deploy to production
npm start
```

---

## 💰 Cashback System

### How It Works:
1. Agent purchases data/product = instant 2% cashback earned
2. Cashback credited to `cashbackBalance` instantly
3. Agent can redeem cashback to main wallet anytime
4. All transactions tracked in `CashbackEntry` table

### Files Updated:
- `prisma/schema.prisma` - New cashback fields
- `app/api/agent/purchase/route.ts` - Cashback logic
- `components/screens/Agent.tsx` - Redemption UI
- `app/admin/page.tsx` - Admin dashboard

### Database Changes:
```sql
ALTER TABLE "Agent" ADD COLUMN "cashbackBalance" DOUBLE PRECISION NOT NULL DEFAULT 0.0;
ALTER TABLE "Agent" ADD COLUMN "totalCashbackEarned" DOUBLE PRECISION NOT NULL DEFAULT 0.0;
ALTER TABLE "Agent" ADD COLUMN "cashbackRedeemed" DOUBLE PRECISION NOT NULL DEFAULT 0.0;
ALTER TABLE "Transaction" ADD COLUMN "agentCashbackAmount" DOUBLE PRECISION;
ALTER TABLE "Transaction" ADD COLUMN "cashbackProcessed" BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE "CashbackEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "agentId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "transactionId" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);
```

---

## 🔐 Agent Session Persistence

### Key Changes:
- Sessions saved to `localStorage` under key: `agentSession`
- Agents auto-login on app reload
- Only manual logout clears session
- Session survives navigation between screens

### Files Updated:
- `components/screens/Agent.tsx` - Session hooks

### Code Location:
```tsx
// Auto-load session
useEffect(() => {
  const savedAgent = localStorage.getItem('agentSession');
  if (savedAgent && !agent) {
    setAgent(JSON.parse(savedAgent));
    setView('dashboard');
  }
}, []);

// Save session on login
useEffect(() => {
  if (agent && view === 'dashboard') {
    localStorage.setItem('agentSession', JSON.stringify(agent));
  }
}, [agent, view]);
```

---

## 🌙 Dark Mode

### Configuration:
- Tailwind: `darkMode: 'class'` in `tailwind.config.ts`
- Toggle in side menu → Settings → Dark Mode
- Persisted to localStorage

### Controlled By:
```tsx
if (darkMode) {
  document.documentElement.classList.add('dark');
  document.documentElement.style.colorScheme = 'dark';
} else {
  document.documentElement.classList.remove('dark');
  document.documentElement.style.colorScheme = 'light';
}
```

---

## 🎨 UI Components Updated

### Button Component (`components/ui/Button.tsx`)
Premium Apple-style with:
- Gradient backgrounds
- Shadow effects
- Smooth animations
- Dark mode variants

### BottomSheet (`components/ui/BottomSheet.tsx`)
- Backdrop blur
- Dark mode support
- Smooth animations

### Network Selection (`components/screens/Data.tsx`)
- Premium gradient cards
- Color-coded networks (MTN=yellow, AIRTEL=red, GLO=green)
- Smooth transitions

---

## 📊 Admin Dashboard

### New Features:
1. View agent cashback balance
2. Track agent earnings
3. Monitor cashback history
4. Manage agent wallets

### Agent Card Display:
```
┌─────────────────────────┐
│ Agent Name              │ Txns: 42
├─────────────────────────┤
│ Main Wallet: ₦150,000   │
│ Cashback: ₦3,000        │
├─────────────────────────┤
│ [Credit] [Debit] [...] │
└─────────────────────────┘
```

---

## 📱 Receipt Display

### Dual Transaction Numbers:
1. **Reference ID** - From payment gateway (Flutterwave/Amigo)
2. **Unique ID** - SAUKI-specific ID based on timestamp

Both displayed for better tracking and customer support.

---

## 🔗 Google Play Integration

### Badge Location:
- Top header of Home screen
- Direct link to store listing
- Image from Google CDN
- Graceful fallback if image fails to load

### Store URL:
```
https://play.google.com/store/apps/details?id=online.saukimart.twa
```

---

## 📋 Quick Access Cards (Agent Dashboard)

### Available Actions:
| Card | Function | Icon |
|------|----------|------|
| Track | View transaction status | Eye |
| Earnings | Show total earnings | TrendingUp |
| Redeem | Open cashback form | CreditCard |
| Support | Show support info | MessageCircle |

All cards are fully interactive and functional.

---

## 🔍 Testing Scenarios

### Agent Cashback Test:
1. Login as agent
2. Purchase data/product (deduct from wallet)
3. Check cashbackBalance increased by 2% of amount
4. Check CashbackEntry logged
5. Redeem cashback to wallet

### Session Persistence Test:
1. Login as agent
2. Refresh page → Should stay logged in
3. Navigate to other screens → Should remain logged in
4. Close and reopen browser → Should remain logged in
5. Click logout → Session should clear

### Dark Mode Test:
1. Open side menu → Settings
2. Toggle Dark Mode on/off
3. Check all UI updates correctly
4. Refresh page → Dark mode persists
5. Check all components have proper contrast

---

## 🐛 Troubleshooting

### Build Errors:
```bash
# If types don't match:
npx prisma generate

# If migrations fail:
npx prisma migrate deploy

# Full reset (development only):
npx prisma migrate reset
```

### Agent Not Staying Logged In:
- Check localStorage is enabled
- Look for `agentSession` key in DevTools
- Check browser console for errors

### Dark Mode Not Working:
- Verify `darkMode: 'class'` in tailwind.config.ts
- Check `dark:` classes in components
- Clear browser cache

---

## 📞 Support

### Key Contact Points:
1. **Support Phone:** 0806 193 4056
2. **Website:** www.saukimart.online
3. **Email:** saukidatalinks@gmail.com

---

## ✅ Pre-Deployment Checklist

- [ ] All builds complete without errors
- [ ] Prisma schema generated
- [ ] Database migrations applied
- [ ] Agent cashback test passed
- [ ] Session persistence verified
- [ ] Dark mode working
- [ ] Receipt displays both transaction IDs
- [ ] Admin page shows cashback
- [ ] Google Play badge displays
- [ ] Network selection UI responsive
- [ ] All buttons have premium styling
- [ ] Bottom sheet dark mode support
- [ ] Quick access cards functional

---

## 📈 Metrics to Monitor

### After Deployment:
1. **Agent Retention** - Track session persistence impact
2. **Cashback Redemption** - Monitor cashback usage
3. **UI Performance** - Check button/animation smoothness
4. **Dark Mode Adoption** - Track usage percentage
5. **Error Rate** - Monitor for any new issues

---

**Last Updated:** January 26, 2026
**Version:** 2.5.3
**Status:** Production Ready ✅

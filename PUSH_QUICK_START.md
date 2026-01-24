# 🚀 Push Notifications - Quick Setup

## What's Implemented ✅

Your backend now has **complete Web Push notification support**! Users will receive notifications in their phone's status bar **even when the app is completely closed**.

## How It Works

```
Admin Dashboard → Send Notification → Service Worker 
→ Web Push Protocol → User's Device → Status Bar 📲
```

**User sees notification regardless of whether app is open or closed.**

---

## Setup (3 Steps)

### 1️⃣ Add Environment Variables to `.env.local`

```env
# Generated VAPID Keys (for Web Push authentication)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BOdoPRbgsp1Vr9qSzaAZ9YHDujQX3M0XA6YseL_zGVcJnUx01nyi976SgeBIrN7uXSf__qXJbSXiHZWcO8dA_Ws
VAPID_PRIVATE_KEY=oGhQ41BD1NaNdaP1KVf7ug38rBZjhBSVnNGPjNayk7k
VAPID_EMAIL=admin@saukimart.com

# Your admin password
ADMIN_PASSWORD=your_password_here
```

### 2️⃣ Database Migration

Add the `PushSubscription` table to your PostgreSQL database:

**Option A: Using Prisma (if DATABASE_URL is set)**
```bash
npx prisma db push
```

**Option B: Manual SQL**
Run this on your PostgreSQL database:

```sql
CREATE TABLE "PushSubscription" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "endpoint" TEXT NOT NULL UNIQUE,
    "p256dh" TEXT NOT NULL,
    "auth" TEXT NOT NULL,
    "phone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE UNIQUE INDEX "PushSubscription_endpoint_key" on "PushSubscription"("endpoint");
```

### 3️⃣ Test It

1. **Visit your app** (production URL on HTTPS)
2. **Click "Allow"** on notification permission prompt
3. **Go to Admin Dashboard** → Notifications section
4. **Enter:**
   - Title: `Test Notification`
   - Body: `Hello from SAUKI MART!`
   - Click **Send**
5. **Check your phone** - notification appears in status bar! 📲

---

## Files Changed

| File | What Changed |
|------|-------------|
| `prisma/schema.prisma` | Added `PushSubscription` model |
| `app/api/push-subscribe/route.ts` | **NEW** - Save user subscriptions |
| `app/api/admin/push/route.ts` | Enhanced to send real Web Push |
| `components/ServiceWorkerRegister.tsx` | Now saves subscriptions to DB |
| `package.json` | Added `web-push` library |

---

## API Endpoints

### Save Push Subscription (Auto-called from frontend)
```http
POST /api/push-subscribe
{
  "subscription": { /* subscription object */ },
  "phone": "user_phone" (optional)
}
```

### Send Notifications (Admin only)
```http
POST /api/admin/push
{
  "password": "ADMIN_PASSWORD",
  "title": "Order Shipped",
  "body": "Your order is on the way!",
  "url": "/track?id=123",  // Optional, defaults to "/"
  "phone": "1234567890"    // Optional, sends to all if omitted
}
```

**Response:**
```json
{
  "success": true,
  "message": "Notifications sent to 5 device(s)",
  "sent": 5,
  "failed": 0,
  "total": 5
}
```

---

## Features ✨

✅ **Background Notifications** - Works even when app is closed  
✅ **Status Bar Display** - Shows in phone notification center  
✅ **Click Handling** - Tap notification → opens app to URL  
✅ **Targeted Delivery** - Send to all users or specific phone  
✅ **Auto Permission** - Requests permission on first visit  
✅ **HTTPS Ready** - Production-grade Web Push Protocol  
✅ **Auto Cleanup** - Removes invalid subscriptions  

---

## Important Notes ⚠️

- **HTTPS Required**: Push notifications only work on HTTPS
- **Localhost**: Won't work on localhost (HTTPS required)
- **First Visit**: User must visit app and allow notifications
- **Subscriptions Saved**: Each device stores 1 subscription
- **No Polling**: Uses real Web Push Protocol (not polling)

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| No notifications sent | Check ADMIN_PASSWORD matches in .env.local |
| Database error | Run migration: `npx prisma db push` or manual SQL |
| VAPID key error | Check both PUBLIC and PRIVATE keys in .env.local |
| 0 devices receiving | No users have subscribed yet - allow notifications first |
| Permission not asking | Visit from HTTPS, clear browser cache, try incognito |

---

## Next Steps

1. ✅ Add VAPID keys to `.env.local`
2. ✅ Run database migration
3. ✅ Test notification delivery
4. ✅ Deploy to production
5. ✅ Users get notifications! 🎉

---

## Generate New VAPID Keys (if needed)

```bash
npx ts-node scripts/generate-vapid-keys.ts
```

For full documentation, see [PUSH_NOTIFICATIONS_SETUP.md](./PUSH_NOTIFICATIONS_SETUP.md)

---

**You're all set! Push notifications are ready to go.** 📱✨

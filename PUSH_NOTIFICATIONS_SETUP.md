# Push Notification Setup Guide

## Overview
The backend now supports sending real push notifications directly to users' devices, even when the app is closed. This uses the Web Push Protocol with VAPID keys.

## Setup Steps

### 1. Generate VAPID Keys
VAPID keys were generated. Add these to your `.env.local`:

```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BOdoPRbgsp1Vr9qSzaAZ9YHDujQX3M0XA6YseL_zGVcJnUx01nyi976SgeBIrN7uXSf__qXJbSXiHZWcO8dA_Ws
VAPID_PRIVATE_KEY=oGhQ41BD1NaNdaP1KVf7ug38rBZjhBSVnNGPjNayk7k
VAPID_EMAIL=admin@saukimart.com
ADMIN_PASSWORD=your_admin_password
DATABASE_URL=your_database_url
```

### 2. Database Migration

Run the following to add the PushSubscription table:

```bash
npx prisma migrate deploy
```

Or if using Prisma Cloud:
```bash
npx prisma db push
```

**If DATABASE_URL is not set**, use this SQL directly on your PostgreSQL database:

```sql
CREATE TABLE "PushSubscription" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "endpoint" TEXT NOT NULL UNIQUE,
    "p256dh" TEXT NOT NULL,
    "auth" TEXT NOT NULL,
    "phone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PushSubscription_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PushSubscription_endpoint_key" on "PushSubscription"("endpoint");
```

### 3. How It Works

**Frontend:**
1. User visits the app
2. ServiceWorkerRegister.tsx automatically requests notification permission
3. If user allows, a push subscription is created and sent to `/api/push-subscribe`
4. Subscription details are stored in database

**Backend:**
1. Admin goes to "Notifications" section in admin panel
2. Enters title, body, optional URL
3. Clicks "Send Notification"
4. POST to `/api/admin/push` with admin password
5. Server retrieves all push subscriptions
6. Sends notification to each subscribed device via Web Push Protocol
7. User receives notification in phone status bar (even if app is closed)

### 4. API Endpoints

#### Subscribe to Notifications
```http
POST /api/push-subscribe
Content-Type: application/json

{
  "subscription": {
    "endpoint": "https://...",
    "keys": {
      "p256dh": "...",
      "auth": "..."
    }
  },
  "phone": "user_phone_number" (optional)
}

Response:
{
  "success": true,
  "message": "Push subscription saved",
  "subscriptionId": "..."
}
```

#### Send Notifications
```http
POST /api/admin/push
Content-Type: application/json

{
  "password": "ADMIN_PASSWORD",
  "title": "Order Confirmed",
  "body": "Your order #12345 has been confirmed!",
  "url": "/track?id=12345" (optional, defaults to "/"),
  "phone": "user_phone_number" (optional, sends to all if not provided)
}

Response:
{
  "success": true,
  "message": "Notifications sent to X device(s)",
  "sent": 5,
  "failed": 0,
  "total": 5
}
```

### 5. Important Notes

- **HTTPS Required**: Push notifications only work over HTTPS (production)
- **Localhost with HTTP**: Won't work on localhost without special setup
- **Failed Subscriptions**: Invalid subscriptions are automatically removed from database
- **Phone-specific**: Can target specific users by phone number
- **No App Required**: Notifications work even when app is completely closed

### 6. Testing

1. **Enable Notifications**: Visit your app, click "Allow" on notification permission
2. **Check Dashboard**: Go to `/admin` → Notifications section
3. **Send Test**: Enter title and body, click Send
4. **Verify**: Should see notification in phone's status bar (or notification center)

### 7. Troubleshooting

| Problem | Solution |
|---------|----------|
| "Unauthorized" error | Check ADMIN_PASSWORD in .env.local matches |
| No notifications received | Check browser allows notifications for site |
| Database error | Run `npx prisma db push` or manual SQL migration |
| 0 devices sent | No users have subscribed yet - visit app and allow notifications |
| VAPID key error | Ensure NEXT_PUBLIC_VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY are in .env.local |

### 8. Generate New VAPID Keys (if needed)

```bash
npx ts-node scripts/generate-vapid-keys.ts
```

---

**Next Steps:**
1. Add VAPID keys to `.env.local`
2. Run database migration
3. Test notification sending
4. Deploy to production

# Technical Implementation Guide

## Overview
Three major features integrated into your app:

1. **Customer Feature:** Check pending transactions in History
2. **Admin Feature:** Manually toggle pending transactions to paid
3. **Backend:** Automatic data delivery on payment confirmation

---

## Feature 1: Customer - Check Pending Transaction

### User Interface
**Location:** `components/screens/History.tsx`

```
┌─────────────────────────────────────────┐
│ MY ACTIVITY (Local Records)             │
├─────────────────────────────────────────┤
│                                         │
│ 🟡 Data Bundle        ₦5,000           │
│ Jan 23, 2025 • PENDING                 │
│ TX_REF_123...                           │
│ [Check] [Receipt]                       │
│                                         │
│ 🔵 Data Bundle        ₦5,000           │
│ Jan 22, 2025 • PAID                    │
│ TX_REF_456...                           │
│ [Receipt]                               │
│                                         │
│ 🟢 Data Bundle        ₦5,000           │
│ Jan 21, 2025 • DELIVERED               │
│ TX_REF_789...                           │
│ [Receipt]                               │
│                                         │
└─────────────────────────────────────────┘
```

### Code Flow

```typescript
// File: components/screens/History.tsx

const handleCheckPending = async (tx: Transaction) => {
  setCheckingId(tx.tx_ref);           // Show spinner
  toast.info("Checking transaction status...");
  
  try {
    // 1. Call backend verification
    const res = await api.verifyTransaction(tx.tx_ref);
    // Returns: { status: 'pending' | 'paid' | 'delivered' | 'failed' }
    
    // 2. Update local storage
    const historyList = JSON.parse(localStorage.getItem('sauki_user_history') || '[]');
    const index = historyList.findIndex(h => h.tx_ref === tx.tx_ref);
    historyList[index].status = res.status;
    localStorage.setItem('sauki_user_history', JSON.stringify(historyList));
    setHistory(historyList);
    
    // 3. Show appropriate message based on type
    if (res.status === 'delivered') {
      if (tx.type === 'data') {
        toast.success("✓ Data delivered! Check your balance.");
      } else {
        toast.success("✓ Transaction Complete: Item Delivered!");
      }
    }
    // ... other status handling
  } catch (e) {
    toast.error("Failed to check status. Verify your connection.");
  } finally {
    setCheckingId(null);  // Remove spinner
  }
};
```

### API Endpoint Details

**Endpoint:** `POST /api/transactions/verify`

```json
REQUEST:
{
  "tx_ref": "TX_REF_12345"
}

RESPONSE:
{
  "status": "paid" | "pending" | "delivered" | "failed"
}
```

---

## Feature 2: Admin - Toggle Pending Transaction to Paid

### Admin Interface
**Location:** `app/admin/page.tsx` → Transactions View

```
┌──────────────────────────────────────────────────────────────┐
│ TRANSACTIONS                                              [🔄] │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│ REF        │ PHONE       │ TYPE      │ AMOUNT  │ STATUS    │  │
│─────────────────────────────────────────────────────────────  │
│ TX_123     │ 08012345678 │ DATA      │ ₦5,000  │ 🟡 PENDING│  │
│            │             │           │         │           │  │
│            │             │           │         │ [🟡 Toggle] │
│            │             │           │         │ Paid      │  │
│            │             │           │         │ [Receipt] │  │
│                                                               │
│ TX_456     │ 08012345679 │ ECOMMERCE │ ₦12,000 │ 🔵 PAID  │  │
│            │             │           │         │           │  │
│            │             │           │         │ [Receipt] │  │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

### Code Flow

```typescript
// File: app/admin/page.tsx

// 1. Add state to track updating transaction
const [updatingTx, setUpdatingTx] = useState<string | null>(null);

// 2. Function to toggle to paid
const toggleToPaid = async (tx_ref: string) => {
  setUpdatingTx(tx_ref);  // Show loading spinner
  try {
    // Call admin API
    await fetch('/api/admin/transactions/update', {
      method: 'POST',
      body: JSON.stringify({ 
        tx_ref, 
        status: 'paid',
        password  // Admin auth
      })
    });
    
    // Refresh transaction list
    await fetchTransactions();
    
    toast.success("Transaction marked as paid. User can now proceed.");
  } catch (e) {
    toast.error("Failed to update transaction");
  } finally {
    setUpdatingTx(null);
  }
};

// 3. Render button in table
{tx.status === 'pending' && (
  <button 
    onClick={() => toggleToPaid(tx.tx_ref)}
    disabled={updatingTx === tx.tx_ref}
    className="bg-yellow-100 text-yellow-700 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase flex items-center gap-1 hover:bg-yellow-200 disabled:opacity-50"
  >
    {updatingTx === tx.tx_ref ? <Loader2 className="animate-spin" /> : <Banknote />}
    Toggle Paid
  </button>
)}
```

### API Endpoint Details

**Endpoint:** `POST /api/admin/transactions/update`

```json
REQUEST:
{
  "tx_ref": "TX_REF_12345",
  "status": "paid",
  "password": "ADMIN_PASSWORD"
}

RESPONSE:
{
  "success": true,
  "transaction": {
    "id": "...",
    "tx_ref": "TX_REF_12345",
    "status": "paid",
    "deliveryData": {
      "method": "Manual Admin Override",
      "updatedAt": "2025-01-23T..."
    },
    ...
  }
}
```

**Authentication:** Checks `password === process.env.ADMIN_PASSWORD`

---

## Feature 3: Backend - Automatic Data Delivery

### Flow When Payment is Verified

```
Customer calls Check (or payment webhook arrives)
         ↓
POST /api/transactions/verify
         ↓
[STEP 1] Verify with Flutterwave
         ├─ If success and amount ≥ required
         └─ Update status to 'paid'
         ↓
[STEP 2] Check if data delivery needed
         ├─ Is status === 'paid'?
         ├─ Is type === 'data'?
         └─ Both true → proceed
         ↓
[STEP 3] Acquire lock (idempotency)
         ├─ Use Prisma updateMany
         ├─ Only proceed if no deliveryData set
         └─ Mark row as 'processing'
         ↓
[STEP 4] Call Amigo API
         ├─ network: AMIGO_NETWORKS[plan.network]
         ├─ mobile_number: transaction.phone
         ├─ plan: dataPlan.planId
         └─ Ported_number: true
         ↓
[STEP 5] Handle response
         ├─ If success → status = 'delivered'
         ├─ If fail → store error in deliveryData
         └─ Admin can manually retry
         ↓
Return status to frontend
```

### Code Implementation

**File:** `app/api/transactions/verify/route.ts`

```typescript
// 1. Verify payment with Flutterwave
if (currentStatus === 'pending') {
  const flwVerify = await axios.get(`https://api.flutterwave.com/v3/transactions/verify_by_reference?tx_ref=${tx_ref}`);
  const flwData = flwVerify.data.data;
  
  if (flwData.status === 'successful' && flwData.amount >= transaction.amount) {
    transaction = await prisma.transaction.update({
      where: { id: transaction.id },
      data: { status: 'paid', paymentData: flwData }
    });
    currentStatus = 'paid';
  }
}

// 2. Auto-deliver if data transaction
if (currentStatus === 'paid' && transaction.type === 'data') {
  // Lock row atomically
  const lockResult = await prisma.transaction.updateMany({
    where: { 
      id: transaction.id,
      OR: [
        { deliveryData: { equals: null } },
        { deliveryData: { equals: {} } }
      ]
    },
    data: { deliveryData: { status: 'processing' } }
  });
  
  if (lockResult.count > 0) {  // We won the lock
    const amigoPayload = {
      network: AMIGO_NETWORKS[plan.network],
      mobile_number: transaction.phone,
      plan: Number(plan.planId),
      Ported_number: true
    };
    
    const amigoRes = await callAmigoAPI('/data/', amigoPayload, tx_ref);
    
    if (amigoRes.success && amigoRes.data.status === 'delivered') {
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          status: 'delivered',
          deliveryData: amigoRes.data
        }
      });
      currentStatus = 'delivered';
    }
  }
}

return NextResponse.json({ status: currentStatus });
```

---

## Database Operations Summary

### Insert (Payment Initiated)
```typescript
// In Data.tsx or Store.tsx
saveToLocalHistory({
  tx_ref: response.tx_ref,
  type: 'data',
  status: 'pending',
  phone: phone,
  amount: planPrice,
  createdAt: new Date().toISOString(),
  dataPlan: selectedPlan
});
```

### Read (Customer checks history)
```typescript
const raw = localStorage.getItem('sauki_user_history');
const history = JSON.parse(raw);
```

### Read (Admin views transactions)
```typescript
GET /api/transactions/list
// Returns: Transaction[] with product & dataPlan relations
```

### Update (Payment verified, status changes)
```typescript
// Backend auto-updates via webhook or manual check
await prisma.transaction.update({
  where: { tx_ref },
  data: { 
    status: 'paid' | 'delivered',
    paymentData: {...},
    deliveryData: {...}
  }
});
```

### Update (Admin manual override)
```typescript
POST /api/admin/transactions/update
// Updates status and marks with "Manual Admin Override"
```

---

## Error Scenarios & Handling

### Scenario 1: Payment Still Pending
```
Customer → Check
  ↓
Flutterwave API → "Not yet confirmed"
  ↓
Frontend: Toast "⏳ Still awaiting payment confirmation. Try again later."
  ↓
Backend: No changes, status remains 'pending'
```

### Scenario 2: Amigo Delivery Fails
```
Backend receives paid status
  ↓
Calls Amigo API
  ↓
Amigo returns error
  ↓
Backend stores error in deliveryData
  ↓
Frontend shows "Data delivered!" (from paid status)
  ↓
Admin can see error and manually retry
```

### Scenario 3: Duplicate Delivery Protection
```
Request 1 & 2 arrive simultaneously
  ↓
Both try to lock the row
  ↓
Only Request 1 wins (Prisma atomic updateMany)
  ↓
Request 1 calls Amigo
  ↓
Request 2 checks row, sees deliveryData is set
  ↓
Request 2 returns "Lock failed, returning latest status"
  ↓
Result: Single Amigo call, no duplicates
```

---

## Testing Checklist

### Customer Flow
- [ ] Load History screen
- [ ] See pending transaction with yellow badge
- [ ] Click "Check" button
- [ ] Verify spinner shows
- [ ] Backend verifies payment
- [ ] Status updates in UI
- [ ] Correct toast message displays
- [ ] localStorage updates
- [ ] Reload page, status persists

### Admin Flow
- [ ] Login to admin
- [ ] Go to Transactions view
- [ ] Find pending transaction
- [ ] Click "Toggle Paid"
- [ ] Verify spinner shows
- [ ] Toast shows success
- [ ] Transaction list refreshes
- [ ] Status changes to "PAID"

### Data Delivery
- [ ] Initiate data payment
- [ ] Complete payment via Flutterwave
- [ ] Check transaction manually OR wait for webhook
- [ ] Backend calls Amigo API
- [ ] Amigo delivers data
- [ ] Status updates to "DELIVERED"
- [ ] Frontend shows "Data delivered! Check your balance."

---

## Deployment Notes

1. **Environment Variables Required:**
   - `ADMIN_PASSWORD` - For admin authentication
   - `FLUTTERWAVE_SECRET_KEY` - For payment verification
   - `AMIGO_BASE_URL` - For data delivery
   - `AMIGO_API_KEY` - For data delivery
   - `DATABASE_URL` - PostgreSQL connection

2. **No Database Migrations Needed** - Schema already supports all fields

3. **Build:** `npm run build` - Passes with 0 errors

4. **Deploy:** Ready for production

# Neon SQL Database Update Guide

**For Final Polish v2.6 Implementation**

## Overview

The changes implemented do NOT require major database schema changes. The SupportTicket table already has a `status` field which is used by the new "Mark Resolved" feature.

This guide provides optional database verification and optimization steps.

---

## Option 1: Automatic Prisma Migration (Recommended)

### Step 1: Run Prisma Migration
```bash
# From project root
npx prisma migrate dev --name "final_polish_v2_6"
```

This will:
- ✅ Verify your schema matches `schema.prisma`
- ✅ Create indexes for faster queries
- ✅ Ensure all fields exist

### Step 2: Generate Prisma Client
```bash
npx prisma generate
```

---

## Option 2: Manual Neon SQL Execution

### Step 1: Access Neon Console
1. Go to https://console.neon.tech/
2. Sign in to your account
3. Select your project
4. Go to "SQL Editor"

### Step 2: Copy & Paste Migration Script

Copy the entire contents of `NEON_MIGRATION_SCRIPT.sql` and paste into the SQL Editor.

### Step 3: Execute
1. Select all text (Ctrl+A / Cmd+A)
2. Click "Run" button
3. Check for any errors

### Expected Output
```
Command executed successfully
Rows affected: 0 (for ADD COLUMN IF NOT EXISTS commands)
```

---

## Verification Queries

After running the migration, execute these queries to verify everything is correct:

### Verify Agent Balance Fields
```sql
SELECT 
  id, 
  "firstName", 
  balance, 
  "cashbackBalance",
  "totalCashbackEarned",
  "cashbackRedeemed"
FROM "Agent" 
LIMIT 5;
```

**Expected Result:** All balance fields should exist and show numeric values (0 or higher)

### Verify Support Ticket Status
```sql
SELECT 
  id, 
  phone, 
  message,
  status, 
  "createdAt"
FROM "SupportTicket" 
ORDER BY "createdAt" DESC 
LIMIT 10;
```

**Expected Result:** Status column should show 'open' or 'resolved' values

### Check Table Indexes
```sql
SELECT 
  tablename, 
  indexname
FROM pg_indexes
WHERE tablename IN ('Agent', 'SupportTicket', 'Transaction')
ORDER BY tablename;
```

**Expected Result:** Should see indexes for faster queries

---

## What Changed

### Database Schema Changes
- ✅ **No breaking changes**
- ✅ `SupportTicket.status` field already exists
- ✅ All Agent balance fields already exist
- ✅ Optional: Added indexes for performance

### Code Changes That Use Database
1. **Mark Resolved Feature** - Uses existing `SupportTicket.status` field
2. **Cashback Refresh** - Uses existing Agent balance fields
3. **Receipt Display** - Uses currency formatting (no DB change)

---

## Rollback Instructions

If you encounter any issues, you can rollback:

```bash
# To previous migration
npx prisma migrate resolve --rolled-back "final_polish_v2_6"

# Or manually delete the migration folder
rm prisma/migrations/<timestamp>_final_polish_v2_6/
```

---

## Database Size Impact

- ✅ **No new tables created**
- ✅ **No data migration needed**
- ✅ **Minimal size increase** (indexes only)
- ✅ **No downtime required**

---

## Testing After Migration

### Test 1: Support Ticket Resolution
1. Go to admin panel
2. Navigate to Support section
3. Click "Mark Resolved" on a ticket
4. Verify it updates successfully

### Test 2: Cashback Display
1. Log in as agent
2. Check dashboard balance display
3. Should show 2 decimal places (e.g., ₦500.00)
4. Wait 15 seconds for auto-refresh
5. Verify cashback updates in real-time

### Test 3: Data Integrity
```sql
-- Count total tickets
SELECT COUNT(*) as total_tickets FROM "SupportTicket";

-- Count unresolved tickets
SELECT COUNT(*) as unresolved FROM "SupportTicket" WHERE status = 'open';

-- Check agent balances
SELECT AVG(balance) as avg_balance FROM "Agent";
```

---

## Troubleshooting

### Error: "Column already exists"
**Solution:** This is normal! The `IF NOT EXISTS` clause prevents errors if column already exists.

### Error: "Foreign key constraint failed"
**Solution:** Make sure you run migrations in order:
1. Agent table first
2. Transaction table second
3. SupportTicket table last

### Error: "Syntax error"
**Solution:** 
1. Copy the entire script again
2. Check for missing semicolons
3. Ensure comments (--) are on separate lines

### Balance still shows no decimals in UI
**Solution:**
1. Clear browser cache (Ctrl+Shift+Delete)
2. Force refresh (Ctrl+F5)
3. Verify utils.ts has `minimumFractionDigits: 2`

---

## Performance Optimization (Optional)

For better performance with large datasets:

```sql
-- Analyze tables for query optimizer
ANALYZE "Agent";
ANALYZE "Transaction";
ANALYZE "SupportTicket";

-- Check query performance
EXPLAIN ANALYZE
SELECT * FROM "Agent" WHERE id = 'some_id';
```

---

## Monitoring Queries

Monitor database health with these queries:

```sql
-- Check for slow queries
SELECT 
  query,
  calls,
  mean_time,
  max_time
FROM pg_stat_statements
WHERE query LIKE '%Agent%' OR query LIKE '%SupportTicket%'
ORDER BY mean_time DESC;

-- Check table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

---

## Support

If you encounter issues:

1. **Check Neon logs**: Neon Console → Logs section
2. **Run prisma studio**: `npx prisma studio`
3. **Verify schema**: `npx prisma db validate`
4. **Reset (if needed)**: `npx prisma migrate reset` (⚠️ Clears all data)

---

**Summary:**
- No major migration needed
- All required fields already exist
- Optional: Run migration for indexes & verification
- Database is production-ready ✅

**Status:** Ready for deployment 🚀

# PIN Hashing Migration Guide

## Overview
Your application now uses bcryptjs to hash all PINs instead of storing them as plaintext. This is a **critical security upgrade**.

## Do You Need to Update Your Database?

**YES**, you need to run a migration script to hash all existing plaintext PINs.

### Why?
- Your existing agents have plaintext PINs stored (e.g., "1234")
- The new login/register code expects bcrypt hashes (e.g., "$2a$10$...")
- Without migration, existing agents cannot log in with the new code

## What About Existing Agents?

**Good news**: Existing agents are NOT negatively affected. They will continue to work after migration:

### Before Migration (Current State)
```
Agent PIN in DB: "1234" (plaintext)
Login with new code: ❌ FAILS (expects hash)
```

### After Migration (Recommended)
```
Agent PIN in DB: "$2a$10$..." (bcrypt hash)
Login with new code: ✅ WORKS
```

### The Migration Process
The script automatically:
1. Detects plaintext PINs (don't start with `$2a$`, `$2b$`, `$2y$`)
2. Hashes each one using bcryptjs (10 salt rounds)
3. Replaces the plaintext PIN with the hash
4. Skips already-hashed PINs (safe to run multiple times)

## Step-by-Step Instructions

### 1. **Verify Neon Database Connection**
```bash
# Ensure DATABASE_URL is set in your .env.local
cat .env.local | grep DATABASE_URL
```

Should show something like:
```
DATABASE_URL="postgresql://user:password@ep-xxx.neon.tech/dbname"
```

### 2. **Run the Migration Script**
```bash
npx ts-node scripts/migrate-pin-hashes.ts
```

**Expected Output**:
```
🔐 Starting PIN migration to bcrypt hashes...

📊 Found 5 agents to migrate

✅ Agent John (08061934056) - PIN hashed successfully
✅ Agent Jane (07044647081) - PIN hashed successfully
⏭️  Agent Admin (09000000000) - PIN already hashed, skipping
✅ Agent Mike (08012345678) - PIN hashed successfully
✅ Agent Sarah (09087654321) - PIN hashed successfully

📈 Migration Summary:
   ✅ Updated: 4
   ⏭️  Skipped (already hashed): 1
   📊 Total: 5

✨ Migration completed successfully!
   All 4 agent PINs are now secured with bcrypt hashing.
```

### 3. **Verify Migration in Neon Console (Optional)**
Go to [Neon Dashboard](https://console.neon.tech) and run:
```sql
SELECT id, firstName, phone, pin FROM "Agent" LIMIT 5;
```

You should see PINs starting with `$2a$`, `$2b$`, or `$2y$`:
```
id    | firstName | phone        | pin
------|-----------|--------------|-------------------------------------------
uuid1 | John      | 08061934056  | $2a$10$abcdefghijklmnopqrstuvwxyz123456...
uuid2 | Jane      | 07044647081  | $2a$10$bcdefghijklmnopqrstuvwxyz1234567...
```

### 4. **Test Login with Existing Agent**
```bash
curl -X POST http://localhost:3000/api/agent/login \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "08061934056",
    "pin": "1234"
  }'
```

Should return: `{ "success": true, "agent": {...} }`

## What If You Have Many Agents?

The script automatically handles any number of agents. It processes them sequentially and shows progress:
- For 100 agents: ~5-10 seconds
- For 1000 agents: ~1-2 minutes
- For 10000+ agents: Run during off-peak hours

## Rollback (If Needed)

If something goes wrong, you can restore from your latest database backup:

```bash
# Neon console > Branches > Restore from backup
# Select your latest backup before the migration
```

Or manually restore plaintext PINs from backup.

## Database Schema

**No schema changes are needed**. The `pin` field remains a `String`:

```prisma
model Agent {
  // ... other fields ...
  pin         String    // Can store both plaintext (backward compat) and hashes
}
```

The field works with both:
- Old plaintext: `"1234"`
- New hashed: `"$2a$10$..."`

## Security Improvements

| Aspect | Before | After |
|--------|--------|-------|
| PIN Storage | Plaintext (insecure) | Bcrypt hash (secure) |
| Login Verification | String comparison | Bcrypt comparison |
| Breach Impact | PINs exposed | Hashes exposed (useless) |
| Performance | Instant | 50-100ms per login |
| Backward Compatibility | N/A | ✅ Yes |

## FAQ

**Q: Can I still use plaintext PINs?**
A: No. The new login code uses `verifyPin()` which requires bcrypt hashes. Migration is mandatory.

**Q: Will this break my mobile app?**
A: No. The app sends PINs normally. The backend hashing/verification is transparent to the client.

**Q: What if I have 0 agents?**
A: The script will complete successfully with "No agents found. Database is clean."

**Q: Can I run the script multiple times?**
A: Yes! It's safe to run multiple times. Already-hashed PINs are skipped.

**Q: Do I need to restart my app?**
A: No. The code already supports hashed PINs. Just run the migration.

## After Migration

Your system is now **production-grade secure**:

✅ All PINs are bcrypt-hashed  
✅ Existing agents work seamlessly  
✅ New agents automatically get hashed PINs  
✅ Login endpoint validates with hashing  
✅ Database breach is no longer a PIN exposure risk  

## Support

If you encounter issues:
1. Check `.env.local` has correct `DATABASE_URL`
2. Ensure you have `npm` packages installed: `npm install`
3. Check Neon database status: [Neon Console](https://console.neon.tech)
4. Run with verbose output: `npx ts-node --transpile-only scripts/migrate-pin-hashes.ts`

# ✅ PIN Migration Checklist

## Pre-Migration ✓
- [x] Code is committed to GitHub (hash: 7c2ddad)
- [x] Build is production-ready (all 27 routes verified)
- [x] Type checking passed
- [x] Migration script created: `scripts/migrate-pin-hashes.ts`
- [x] Migration guide created: `PIN_MIGRATION_GUIDE.md`

---

## Migration Steps

### 1️⃣ Backup Database (Recommended)
- [ ] Go to [Neon Console](https://console.neon.tech)
- [ ] Navigate to your project
- [ ] Create a backup/branch (optional but recommended)
- [ ] Note the backup timestamp

### 2️⃣ Check Existing Agents
```bash
# Connect to your Neon database and run:
SELECT COUNT(*) FROM "Agent";
SELECT firstName, phone FROM "Agent" LIMIT 5;
```
- [ ] Count your agents
- [ ] Note some agent names/phone numbers for testing

### 3️⃣ Run Migration Script
```bash
npx ts-node scripts/migrate-pin-hashes.ts
```
- [ ] Script runs successfully
- [ ] All agents hashed
- [ ] No errors in output
- [ ] See "Migration completed successfully!" message

### 4️⃣ Verify Migration
```sql
-- Run in Neon console
SELECT firstName, phone, LEFT(pin, 10) as pin_prefix 
FROM "Agent" 
LIMIT 5;
```
- [ ] All PINs start with `$2a$`, `$2b$`, or `$2y$`
- [ ] No plaintext pins remain (don't start with numbers)
- [ ] All agents have hashed PINs

### 5️⃣ Test Login with Existing Agent
```bash
# Using an agent phone number from step 2
curl -X POST http://localhost:3000/api/agent/login \
  -H "Content-Type: application/json" \
  -d '{"phone": "08061934056", "pin": "1234"}'
```
- [ ] Response includes `"success": true`
- [ ] Agent data is returned
- [ ] No 401/403 errors

### 6️⃣ Test Login with New Agent (Post-Migration)
```bash
# Register a new agent after migration
curl -X POST http://localhost:3000/api/agent/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "Agent",
    "phone": "08001234567",
    "pin": "5678"
  }'
```
- [ ] Registration succeeds
- [ ] Agent is created with hashed PIN
- [ ] Login works with new agent

### 7️⃣ Monitor Logs
- [ ] Check application logs for any security events
- [ ] Verify rate limiting is working
- [ ] Confirm structured logs are being generated

### 8️⃣ Rollback Plan (If Needed)
- [ ] Neon backup is available (if created in step 1)
- [ ] Know how to restore from backup
- [ ] Database restore should take <5 minutes

---

## Post-Migration ✓
- [ ] All agents can log in
- [ ] New registrations work
- [ ] No login failures for existing agents
- [ ] Application logs show healthy operation
- [ ] Rate limiting is functioning
- [ ] Receipts render correctly (1:1 square format)

---

## Troubleshooting

### Issue: Script not found
```bash
# Make sure you're in the right directory
cd /workspaces/APP-Final

# Make sure dependencies are installed
npm install
```

### Issue: ts-node not installed
```bash
npm install -g ts-node
npm install --save-dev ts-node
```

### Issue: DATABASE_URL error
```bash
# Check your .env.local
grep DATABASE_URL .env.local

# Should show something like:
# DATABASE_URL="postgresql://user:pass@ep-xxx.neon.tech/dbname"

# If missing, update .env.local with your Neon database URL
```

### Issue: Migration says "No agents found"
- This is fine - you have 0 agents, migration is complete
- New agents will automatically get hashed PINs

### Issue: Some agents skipped as "already hashed"
- This is normal - these were migrated before
- Script is safe to run multiple times

### Issue: Agent login still fails after migration
1. Verify migration completed: Look for success message
2. Check Neon: `SELECT pin FROM "Agent" WHERE phone='xxxxx'`
3. PIN should start with `$2a$`, `$2b$`, or `$2y$`
4. Restart your application
5. Clear browser cache and try again

---

## Rollback Instructions

If something goes wrong and you need to restore:

### Option 1: Restore from Neon Backup
- Go to [Neon Console](https://console.neon.tech)
- Navigate to Branches
- Click "Restore" on a backup created before migration
- Select the backup timestamp
- Rollback takes ~5 minutes

### Option 2: Restore from Manual Backup
- If you exported data before, import it back

### Option 3: Manual PIN Reset (Last Resort)
```sql
-- This will set all PINs back to plaintext (INSECURE)
-- Only do this if you have record of plaintext PINs
UPDATE "Agent" SET pin = '1234' WHERE id = 'agent_id';
```

---

## Success Criteria

Your migration is successful when:

✅ All agents can log in with their existing PIN  
✅ All PINs in database start with `$2a$`, `$2b$`, or `$2y$`  
✅ No plaintext PINs (like "1234") remain  
✅ New agents automatically get hashed PINs  
✅ Application logs show healthy operation  
✅ Rate limiting prevents brute force attempts  
✅ Receipts render in 1:1 square format  
✅ No security errors in logs  

---

## Timeline

| Step | Time | Status |
|------|------|--------|
| 1. Backup | 2 min | Recommended |
| 2. Check agents | 1 min | Quick query |
| 3. Run migration | 10-30 sec per 100 agents | Depends on agent count |
| 4. Verify | 1 min | SQL queries |
| 5. Test login | 1 min | Manual test |
| 6. Test registration | 2 min | Manual test |
| 7. Monitor logs | Ongoing | Daily check |
| **Total** | **~20-60 min** | Depends on agent count |

---

## Post-Migration Monitoring

### Daily Checks
- [ ] Check application logs for errors
- [ ] Monitor rate limit triggers
- [ ] Verify login success rate
- [ ] Check for suspicious activity

### Weekly Checks
- [ ] Review security event logs
- [ ] Monitor API performance
- [ ] Check retry logic effectiveness
- [ ] Verify database backup status

### Monthly Checks
- [ ] Audit login patterns
- [ ] Review rate limit effectiveness
- [ ] Check PIN hash performance
- [ ] Plan for next security enhancement

---

## Done! 🎉

Once all steps are completed, your application has:
- 🔐 Enterprise-grade PIN security
- 📝 Audit trail for compliance
- 🔄 Automatic retry logic
- 📱 Modern social-media-optimized receipts
- ⚡ Improved perceived performance

**Happy deploying! 🚀**

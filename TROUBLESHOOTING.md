# 🔧 Troubleshooting Guide — Common Issues & Solutions

**Quick reference for debugging SaukiMart deployment issues**

---

## 🔴 Critical Issues (Blocks Deployment)

### Issue: Build Fails with `npm run build`

**Symptoms:**
- Build fails locally
- Next.js compilation errors
- TypeScript errors

**Solutions:**
```bash
# Step 1: Clean and rebuild
rm -rf node_modules .next
npm install
npm run build

# Step 2: Fix TypeScript errors
npm run lint -- --fix

# Step 3: Check for missing dependencies
npm audit
npm install missing-package

# Step 4: Verify tsconfig.json
# Make sure "strict": true is present
```

**If still failing:**
- Check for circular imports: `grep -r "import.*from.*app/" lib/`
- Verify all external dependencies are in package.json
- Check for syntax errors: `node --check app/**/*.tsx`

---

### Issue: Database Connection Error

**Symptoms:**
```
Error: ECONNREFUSED
Error: Unable to establish a secure connection
Error: SSL certificate problem
```

**Solutions:**

**Step 1: Verify CONNECTION STRING**
```bash
# Check that DATABASE_URL exists in Vercel
vercel env ls

# Format should be:
# postgresql://username:password@host:5432/dbname?sslmode=require
```

**Step 2: Test Local Connection**
```bash
# If you have psql installed:
psql "postgresql://user:pass@host:5432/dbname?sslmode=require"

# Should connect and show: postgres=#
```

**Step 3: Check Neon Status**
- Go to https://neon.tech → Project → Monitoring
- Verify: Compute is "Available" (green)
- Verify: Connection count is normal

**Step 4: Restart Neon Connection Pool**
- Neon Dashboard → Project → Settings → Reset Pool
- Wait 30 seconds
- Try connecting again

**Step 5: Verify SSL Mode**
```bash
# Make sure connection string has: ?sslmode=require
# NOT: ?sslmode=disable (security risk)
```

**If still failing:**
- Create new Neon project and copy new.connection string
- Update DATABASE_URL in Vercel
- Redeploy

---

### Issue: Flutterwave Webhook Not Firing

**Symptoms:**
- User deposits go through Flutterwave but wallet not credited
- Webhook logs show no incoming events
- Vercel logs show 404 or 401 on webhook attempts

**Solutions:**

**Step 1: Verify Webhook URL**
```bash
# Go to Flutterwave Dashboard → Settings → Webhooks
# URL should be: https://www.saukimart.online/api/webhooks/flutterwave
# NOT: http:// (must be https)
# NOT: localhost or IP addresses
```

**Step 2: Verify Webhook Secret Hash**
```bash
# Flutterwave Dashboard → Settings → Webhooks
# Copy the webhook hash
# Add to Vercel env: FLW_WEBHOOK_HASH=<copied-value>
# Clear Vercel cache and redeploy
```

**Step 3: Test Webhook Manually**
```bash
# Flutterwave Dashboard → Webhooks → Test
# Simulate charge.completed event
# Check Vercel logs for success message

# Or manually test:
curl -X POST https://www.saukimart.online/api/webhooks/flutterwave \
  -H "Content-Type: application/json" \
  -H "verif-hash: YOUR_WEBHOOK_HASH" \
  -d '{
    "event":"charge.completed",
    "data":{
      "id":123456,
      "tx_ref":"user_deposit_1",
      "amount":5000,
      "currency":"NGN",
      "status":"successful"
    }
  }'
```

**Step 4: Check Webhook Logs**
```bash
# Visit: https://www.saukimart.online/api/admin/webhooks
# Add admin JWT in Authorization header
# Should show webhook history
```

**Step 5: Use Flutterwave Test Mode (for staging)**
```bash
# If using testmode:
# 1. Update FLW_PUBLIC_KEY and FLW_SECRET_KEY to test keys
# 2. Test charge with test card
# 3. Check webhook fires
# 4. Switch back to live keys for production
```

**If still not firing:**
- Check if Flutterwave account has webhook enabled (Settings → Webhooks page exists)
- Check firewall not blocking Flutterwave IPs
- Review Flutterwave webhook logs in their dashboard

---

### Issue: Admin Login Returns 401 "Unauthorized"

**Symptoms:**
- Admin email/password correct but login fails
- `GET /api/admin/login` returns 401
- Admin cannot access dashboard

**Solutions:**

**Step 1: Verify Admin Credentials**
```bash
# Query database directly:
# In Neon console → SQL Editor
SELECT * FROM users WHERE phone='ADMIN' LIMIT 1;

# Should return a record with admin=true
```

**Step 2: Check ADMIN Environment Variables**
```bash
# Verify in Vercel:
# ADMIN_EMAIL and ADMIN_PASSWORD are set correctly
# (They may not match database if not migrated)
```

**Step 3: Reset Admin User (Manual)**
```bash
# In Neon console → SQL Editor
# Delete old admin:
DELETE FROM users WHERE phone='ADMIN';

# Create new admin:
INSERT INTO users (phone, name, pin_hash, wallet_balance, admin, created_at)
VALUES ('ADMIN', 'Super Admin', 'hashed_pin', 0, true, NOW());
```

**Step 4: Generate New JWT**
```bash
# Use /api/admin/login endpoint:
curl -X POST https://www.saukimart.online/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@saukimart.online",
    "password": "YourPassword"
  }'

# Should return: { token: "eyJhbGc..." }
```

**Step 5: Store JWT for Admin Requests**
```bash
# Use returned token for admin endpoints:
curl -X GET https://www.saukimart.online/api/admin/analytics \
  -H "Authorization: Bearer eyJhbGc..."
```

**If still failing:**
- Check NEXTAUTH_SECRET is same in all environments
- Verify admin password matches database (case-sensitive)
- Initialize admin with `/api/admin/init-db` endpoint

---

## 🟡 Common Issues (Non-Blocking)

### Issue: Data Purchase Returns "Insufficient Balance"

**Symptoms:**
- User receives: `Error: Insufficient wallet balance`
- But balance shows sufficient in dashboard
- Data not purchased

**Solutions:**

**Step 1: Check User Balance**
```bash
# Query: SELECT wallet_balance, cashback_balance FROM users WHERE phone='08012345678';
# Make sure balance >= plan price
```

**Step 2: Check Price Configuration**
```bash
# Verify data plan has correct selling_price:
SELECT * FROM data_plans WHERE network_id=1 LIMIT 1;

# If price is 0 or very high, update it:
UPDATE data_plans SET selling_price=100 WHERE id='MTN_500MB_7D';
```

**Step 3: Test Purchase Flow**
```bash
# Try with larger balance:
curl -X POST https://www.saukimart.online/api/buy-data \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "network": 1,
    "mobile_number": "08012345678",
    "plan_id": "MTN_500MB_7D"
  }'
```

**Step 4: Check Amigo API Response**
```bash
# Review Vercel logs for Amigo API call:
# Look for: "error_code", "error_message"
# Common errors:
# - Invalid plan_id format
# - Network code mismatch (1=MTN, 2=Glo, 4=Airtel)
# - API authentication failed
```

**If still failing:**
- Verify Amigo API keys are correct
- Check proxy server is running and accessible
- Test Amigo API directly via admin console: `/api/admin/console`

---

### Issue: Virtual Account Not Created During Registration

**Symptoms:**
- User registers successfully
- But virtual account not in Flutterwave dashboard
- User cannot see account number

**Solutions:**

**Step 1: Check Flutterwave API Response**
```bash
# Look in Vercel logs during registration:
# Search for: "createVirtualAccount" or "FLW_ERROR"
# Common causes:
# - BVN validation failed
# - Flutterwave rate limit hit
# - Network error during API call
```

**Step 2: Verify Credentials**
```bash
# Check in Flutterwave Dashboard:
# - API key is correct (LIVE, not TEST)
# - Merchant account is active
# - BVN (MY_BVN) is valid and verified
```

**Step 3: Manual Account Creation**
```bash
# Contact Flutterwave support to create account:
# Provide:
# - User phone number
# - User email
# - User name
# - Reference transaction ID
# 
# They can manually create account in dashboard
```

**Step 4: Retry Registration**
```bash
# Query user record:
SELECT * FROM users WHERE phone='08012345678';

# If flw_ref is NULL, account wasn't created
# Retry via: POST /api/register with same details
```

**If account still not created:**
- Check BVN is valid for Flutterwave
- Verify Flutterwave merchant account is in "Live" mode (not "Draft")
- Contact Flutterwave: support@flutterwave.com

---

### Issue: 500 Error on API Endpoints

**Symptoms:**
- Any API call returns: `500 Internal Server Error`
- No error message provided
- Different errors on different endpoints

**Solutions:**

**Step 1: Check Vercel Logs**
```bash
# Vercel Dashboard → Deployments → Latest → Logs → Function logs
# Look for error stack trace
# Identify which function is failing
```

**Step 2: Common Causes**

**Missing Environment Variable**
```bash
# Solution: Add missing env var in Vercel
# Redeploy: vercel --prod
```

**Database Connection Error**
```bash
# Solution: Check DATABASE_URL is correct
# Verify Neon is running
```

**Invalid JSON Response**
```bash
# Solution: Check API response is valid JSON
# Look for: "SyntaxError: Unexpected token"
```

**Authentication Failed**
```bash
# Solution: Verify JWT token is valid
# Check token hasn't expired (30 days for users, 8 hours for admin)
```

**Step 3: Enable Detailed Error Logging**
```bash
# Add to Vercel environment:
NODE_ENV=production
DEBUG=saukimart:*

# Redeploy and check logs again
```

**Step 4: Test Endpoint Locally**
```bash
# Clone repo locally
npm install
npm run dev

# Test endpoint at http://localhost:3000/api/...
# Better error messages appear locally
```

**If error persists:**
- Check request payload is valid JSON
- Verify all required headers are present (Authorization, Content-Type)
- Check request body size limit not exceeded (4MB default)

---

### Issue: Image Upload Fails or Returns 403

**Symptoms:**
- Upload returns: `403 Forbidden`
- Or: `Error: Could not upload file`
- Images not visible in products

**Solutions:**

**Step 1: Verify Blob Token**
```bash
# Check BLOB_READ_WRITE_TOKEN in Vercel
# Should start with: vercel_blob_rw_

# If missing, go to:
# Vercel Dashboard → Storage → Blob
# Create new project if needed
# Copy token to Vercel env
```

**Step 2: Check Upload Header**
```bash
# Uploads must include one of:
# Option A: Authorization header
curl -X POST https://www.saukimart.online/api/upload \
  -H "Authorization: Bearer USER_JWT_TOKEN" \
  -F "file=@image.jpg"

# Option B: Admin key header
curl -X POST https://www.saukimart.online/api/upload \
  -H "x-admin-key: ADMIN_SECRET_KEY" \
  -F "file=@image.jpg"
```

**Step 3: Check File Size**
```bash
# Max file size: 50MB (Vercel Blob limit)
# Recommended: Keep images under 5MB
# Compress if needed: ffmpeg -i large.jpg -q:v 5 small.jpg
```

**Step 4: Verify File Path**
```bash
# Uploaded files stored at:
# https://[PROJECT].blob.vercel-storage.com/uploads/[filename]

# Check domain is whitelisted in next.config.js:
# Should include: "*.public.blob.vercel-storage.com"
```

**If still failing:**
- Check Blob storage quota not exceeded (Usage in Vercel dashboard)
- Verify file format is supported (JPG, PNG, WebP)
- Try with smaller test file first

---

### Issue: User Registration Fails with "Phone Already Exists"

**Symptoms:**
- New user tries to register
- Returns: `Error: Phone number already registered`
- But user has never registered before

**Solutions:**

**Step 1: Check Database**
```bash
# Query: SELECT * FROM users WHERE phone='08012345678';
# If returns a result, it's genuinely registered
# 
# If another user has same number:
# Delete old record: DELETE FROM users WHERE phone='08012345678' AND id='old-id';
# User can now register
```

**Step 2: Check Phone Number Format**
```bash
# Format must be exactly: +2348012345678 or 08012345678
# Common issues:
# - Extra spaces: "0801 234 5678" (remove spaces)
# - Wrong country code: "2348012345678" (should be +2348012345678)
# - Leading zeros: "+234008012345678" (remove extra 0)
```

**Step 3: Case Sensitivity**
```bash
# Phone numbers are case-insensitive in DB
# But comparison might fail due to formatting
# Solution: Normalize phone format in app
```

**If still failing:**
- Manually insert user record in database
- Check Phone column in users table for data types
- Verify unique constraint on phone column

---

### Issue: Push Notifications Not Sending

**Symptoms:**
- User doesn't receive notifications
- No errors in logs
- But Flutterwave/Amigo events fired successfully

**Symptoms:** This feature is not yet implemented!

**Solutions:**
```bash
# Current status: Push notifications not configured
# To enable:
# 1. Choose provider: OneSignal, Firebase, Termii, or Twilio
# 2. Get API keys and configuration
# 3. Add to Vercel environment
# 4. Implement notification logic in API routes
# 5. Test delivery to mobile clients
#
# For now: Notifications optional for launch
# Plan for Phase 2 implementation
```

---

## 🟢 Performance Issues

### Issue: Response Time Slow (>2 seconds)

**Symptoms:**
- API calls take 2-5 seconds to respond
- Database queries timing out
- User complaint about app being slow

**Solutions:**

**Step 1: Identify Slow Query**
```bash
# Check Neon dashboard → Query analytics
# Look for queries taking >500ms
# Usually: Multiple table joins or N+1 queries
```

**Step 2: Optimize Database**
```bash
# Add indexes for frequently filtered columns:
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_transactions_user ON transactions(user_id);
CREATE INDEX idx_transactions_created ON transactions(created_at DESC);

# Run monthly: ANALYZE; VACUUM;
```

**Step 3: Cache Results**
```bash
# Implement caching for static queries:
# - Data plans (rarely changes)
# - Products (changes via admin, cache 1 hour)
# - User settings (cache 15 minutes)
#
# Tool: Redis or Vercel KV (recommended for serverless)
```

**Step 4: Monitor Performance**
```bash
# Add performance tracking:
const start = Date.now();
// ... database call ...
console.log(`Query took: ${Date.now() - start}ms`);
```

**If still slow:**
- Check if database compute is sufficient (scale up on Neon)
- Check if API calls to external services are slow (Flutterwave, Amigo)
- Consider CloudFlare for caching

---

### Issue: High Memory Usage / Out of Memory Errors

**Symptoms:**
- Random 500 errors
- Vercel logs show: "FATAL ERROR: CALL_AND_RETRY_LAST Allocation failed"
- Performance degrades over time

**Solutions:**

**Step 1: Check Memory Leaks**
```bash
# Look for:
# - Variables not garbage collected
# - Event listeners not removed
# - Unclosed database connections
```

**Step 2: Optimize Large Operations**
```bash
# Instead of loading all transactions:
const all = await db.query('SELECT * FROM transactions'); // BAD

# Load in batches:
const batch = await db.query(
  'SELECT * FROM transactions LIMIT 1000 OFFSET $1',
  [offset]
); // GOOD
```

**Step 3: Stream Large Files**
```bash
// Streaming response instead of loading into memory
response.pipe(res);
```

**Step 4: Increase Vercel Function Memory**
```bash
# In vercel.json add:
{
  "functions": {
    "api/**": {
      "memory": 1024
    }
  }
}
```

**If persists after optimization:**
- Upgrade to Vercel Pro (more memory, better scaling)
- Implement Redis caching layer to reduce DB queries

---

## 🔵 Security Issues

### Issue: CORS Error When Accessing API

**Symptoms:**
- Browser shows: `No 'Access-Control-Allow-Origin' header`
- Request blocked by browser
- Works in Postman/curl but not from frontend

**Solutions:**

**Step 1: Verify CORS Headers in vercel.json**
```json
{
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Origin", "value": "*" },
        { "key": "Access-Control-Allow-Methods", "value": "GET,POST,PUT,PATCH,DELETE,OPTIONS" },
        { "key": "Access-Control-Allow-Headers", "value": "Content-Type, Authorization" }
      ]
    }
  ]
}
```

**Step 2: Test CORS Preflight**
```bash
# Preflight request should succeed:
curl -X OPTIONS https://www.saukimart.online/api/register -v

# Should return: 200 OK with CORS headers
```

**Step 3: Specify Allowed Origins**
```json
// For production, restrict to specific origins:
"Access-Control-Allow-Origin": "https://www.saukimart.online"
```

---

### Issue: JWT Token Expired After <30 Days

**Symptoms:**
- Users logged out unexpectedly
- Error: `Token expired`
- After N hours/days of inactivity

**Solutions:**

**Step 1: Check Token Expiration Config**
```bash
# In lib/auth.ts:
# Options for signToken: { expiresIn: '30d' } (users)
#                        { expiresIn: '8h' } (admin)
```

**Step 2: Implement Token Refresh**
```bash
// Add refresh endpoint:
POST /api/auth/refresh
{
  "refresh_token": "..."
}
// Response: { token: "new_jwt" }
```

**Step 3: Handle Token Expiration on Frontend**
```javascript
// Automatically retry with fresh token on 401
```

**For now:**
- Re-login required after 30 days (acceptable for most users)
- Plan for token refresh in Phase 2

---

### Issue: SQL Injection or Data Corruption

**Symptoms:**
- Unexpected data in database
- Queries fail with syntax errors
- Possible unauthorized access

**Solutions:**

**Always Use Parameterized Queries:**
```javascript
// ❌ VULNERABLE:
db.query(`SELECT * FROM users WHERE phone='${phone}'`);

// ✅ SAFE:
db.query('SELECT * FROM users WHERE phone=$1', [phone]);
```

**Verify All Routes Use Parameterized Queries:**
```bash
grep -r "FROM\|INSERT\|UPDATE\|DELETE" app/api/ | grep -v "\$[0-9]"
# Should return 0 results (no vulnerable queries)
```

**Input Validation:**
```javascript
// Always validate before querying:
if (!phone || !phone.match(/^\+?234\d{10}$/)) {
  return res.status(400).json({ error: 'Invalid phone' });
}
```

---

## 📊 Monitoring & Debugging

### How to Check Vercel Logs

```bash
# Via CLI:
vercel logs --prod

# Via Dashboard:
# 1. vercel.com/dashboard
# 2. Select project
# 3. Deployments → Latest → Logs
# 4. Filter by: Function logs, Edge logs, Build logs
```

### How to Check Database

```bash
# Via Neon Console:
# 1. neon.tech → Project → SQL Editor
# 2. Run queries manually
# 3. Check recent queries tab
#
# Common queries:
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM transactions;
SELECT * FROM webhooks_log ORDER BY created_at DESC LIMIT 10;
```

### How to Check External APIs

```bash
# Flutterwave:
# 1. dashboard.flutterwave.com → Wallets/Transactions
# 2. Check for webhook events → Webhooks → Logs
#
# Amigo API:
# 1. Contact support for dashboard access
# 2. Manual testing via /api/admin/console
```

---

## 🚨 Emergency Procedures

### If Database is Down

1. Check Neon status: https://neon.tech/status
2. Restart compute: Neon Dashboard → Project → Settings → Reset
3. Restore from backup: Neon Dashboard → Backups tab
4. If all else fails: Create new Neon project, restore data manually

**Estimated downtime:** 5-15 minutes

---

### If Payments Are Stuck

1. Check webhook logs: `/api/admin/webhooks`
2. Manually retry webhook: Click "Retry" in logs
3. Or manually credit wallet: `/api/admin/wallet` endpoint
4. Contact Flutterwave: support@flutterwave.com

**Estimated resolution:** 30 minutes

---

### If Can't Access Admin Dashboard

1. Try incognito/private browsing (clear cache)
2. Verify admin token is valid: `/api/admin/login`
3. Check if admin user exists in database
4. If token expired, re-login
5. As last resort: Reset admin password in database

**Estimated resolution:** 1-5 minutes

---

### If App is Completely Down

1. Check Vercel status: status.vercel.com
2. Check if domain is resolving: `nslookup www.saukimart.online`
3. Rollback to previous deployment: Vercel Dashboard → Deployments
4. Check GitHub repo is accessible: github.com/YOUR_ORG/saukifinal
5. Contact Vercel support: support@vercel.com

**Estimated resolution:** 5-30 minutes

---

## 📞 Getting Help

| Issue Type | Resource | Response Time |
|------------|----------|-----------------|
| Database | Neon Docs + Support | 1-24 hours |
| Payments | Flutterwave Docs + Support | 1-4 hours |
| Data API | Amigo Support | 1-4 hours |
| Hosting | Vercel Docs + Support (Pro) | 30 mins - 2 hours |
| Code Bugs | GitHub Issues + Team | Immediate |
| Emergencies | CTO Hotline | 5-15 mins |

---

**Last Updated:** March 7, 2026 | **Status:** READY FOR REFERENCE

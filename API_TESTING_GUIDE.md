# 📡 API Testing Reference — All Endpoints

**Comprehensive list of all API endpoints with curl examples. Copy & paste to test.**

---

## 🔑 Getting Started

### Prerequisites
```bash
# 1. Get admin token (use default credentials)
export ADMIN_USER="admin@saukimart.online"
export ADMIN_PASS="ChangeMe@2026!"
export BASE_URL="https://www.saukimart.online"

# 2. Get admin JWT
ADMIN_TOKEN=$(curl -s -X POST $BASE_URL/api/admin/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$ADMIN_USER\",\"password\":\"$ADMIN_PASS\"}" \
  | grep -o '"token":"[^"]*' | cut -d'"' -f4)

echo "Admin Token: $ADMIN_TOKEN"

# 3. Get user token (register or login as user)
USER_PHONE="+2348012345678"
USER_PIN="123456"

# Register user
USER_TOKEN=$(curl -s -X POST $BASE_URL/api/register \
  -H "Content-Type: application/json" \
  -d "{\"phone\":\"$USER_PHONE\",\"pin\":\"$USER_PIN\"}" \
  | grep -o '"token":"[^"]*' | cut -d'"' -f4)

echo "User Token: $USER_TOKEN"
```

---

## 👤 Public Authentication Endpoints

### 1. Register User (Create Account)
```bash
curl -X POST https://www.saukimart.online/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+2348012345678",
    "pin": "123456"
  }'

# Expected Response:
{
  "success": true,
  "message": "Registration successful",
  "token": "eyJhbGc...",
  "user": {
    "id": "uuid",
    "phone": "+2348012345678",
    "name": "User",
    "wallet_balance": 0,
    "flw_ref": "flw_ref_123"
  }
}
```

### 2. Login User
```bash
curl -X POST https://www.saukimart.online/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+2348012345678",
    "pin": "123456"
  }'

# Expected Response:
{
  "success": true,
  "token": "eyJhbGc...",
  "user": { ... }
}
```

### 3. Get User Profile
```bash
curl -X GET https://www.saukimart.online/api/user \
  -H "Authorization: Bearer $USER_TOKEN"

# Expected Response:
{
  "success": true,
  "user": {
    "id": "uuid",
    "phone": "+2348012345678",
    "wallet_balance": 5000,
    "cashback_balance": 0,
    "referral_balance": 0,
    "theme": "light",
    "notifications_enabled": true,
    "haptics_enabled": true
  }
}
```

### 4. Update User Settings
```bash
curl -X PATCH https://www.saukimart.online/api/user \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "pin": "654321",
    "theme": "dark",
    "notifications_enabled": false,
    "haptics_enabled": true
  }'

# Expected Response: { "success": true, "message": "Settings updated" }
```

---

## 📊 Data Plans & Products

### 5. Get All Data Plans
```bash
curl -X GET 'https://www.saukimart.online/api/data-plans' \
  -H "Content-Type: application/json"

# Optional filters:
# ?network=1 (1=MTN, 2=Glo, 4=Airtel, 3=9Mobile)
# ?status=active

# Expected Response:
{
  "success": true,
  "plans": [
    {
      "id": "MTN_500MB_7D",
      "network": "MTN",
      "data_size": "500MB",
      "validity": "7 days",
      "price": 100,
      "network_id": 1,
      "plan_id": "123456"
    }
  ]
}
```

### 6. Get All Products
```bash
curl -X GET 'https://www.saukimart.online/api/products' \
  -H "Content-Type: application/json"

# Expected Response:
{
  "success": true,
  "products": [
    {
      "id": "uuid",
      "name": "Product Name",
      "description": "Description",
      "price": 5000,
      "image_url": "https://...",
      "stock_status": "in_stock",
      "shipping_fee": 500,
      "pickup_only": false
    }
  ]
}
```

---

## 💳 Transactions & Wallet

### 7. Buy Data Bundle
```bash
curl -X POST https://www.saukimart.online/api/buy-data \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "network": 1,
    "mobile_number": "08012345678",
    "plan_id": "MTN_500MB_7D",
    "pin": "123456"
  }'

# Expected Response:
{
  "success": true,
  "message": "Data purchased successfully",
  "transaction_id": "uuid",
  "reference": "SM_123456",
  "amount": 100,
  "status": "successful",
  "new_balance": 4900
}

# Error Response (if insufficient balance):
{
  "success": false,
  "error": "Insufficient wallet balance",
  "current_balance": 50,
  "required": 100
}
```

### 8. Purchase Product
```bash
curl -X POST https://www.saukimart.online/api/purchase-product \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "product_id": "uuid",
    "quantity": 1,
    "pm": "wallet",
    "pin": "123456"
  }'

# Expected Response:
{
  "success": true,
  "message": "Product purchased successfully",
  "order_id": "uuid",
  "reference": "SM_654321",
  "total": 5500,
  "status": "pending",
  "new_balance": 4500
}
```

### 9. Get User Transactions
```bash
curl -X GET 'https://www.saukimart.online/api/transactions?skip=0&limit=20' \
  -H "Authorization: Bearer $USER_TOKEN"

# Expected Response:
{
  "success": true,
  "transactions": [
    {
      "id": "uuid",
      "type": "data_purchase",
      "amount": 100,
      "network": "MTN",
      "status": "successful",
      "reference": "SM_123456",
      "created_at": "2026-03-07T10:00:00Z"
    }
  ],
  "total": 42,
  "skip": 0,
  "limit": 20
}
```

### 10. Get User Deposits
```bash
curl -X GET 'https://www.saukimart.online/api/deposits?skip=0&limit=20' \
  -H "Authorization: Bearer $USER_TOKEN"

# Expected Response:
{
  "success": true,
  "deposits": [
    {
      "id": "uuid",
      "amount": 5000,
      "currency": "NGN",
      "sender_name": "John Doe",
      "sender_email": "john@example.com",
      "status": "successful",
      "created_at": "2026-03-07T09:00:00Z"
    }
  ],
  "total": 3,
  "skip": 0,
  "limit": 20
}
```

---

## 📱 Special Services

### 11. Get SIM Activation Requests
```bash
curl -X GET 'https://www.saukimart.online/api/sim-activation' \
  -H "Authorization: Bearer $USER_TOKEN"

# Expected Response:
{
  "success": true,
  "requests": [
    {
      "id": "uuid",
      "serial_number": "SIM123456789",
      "image_url": "https://...",
      "status": "under_review",
      "created_at": "2026-03-07T10:00:00Z"
    }
  ]
}
```

### 12. Submit SIM Activation Request
```bash
# First upload image:
UPLOAD_RESPONSE=$(curl -s -X POST https://www.saukimart.online/api/upload \
  -H "Authorization: Bearer $USER_TOKEN" \
  -F "file=@sim_photo.jpg")

IMAGE_URL=$(echo $UPLOAD_RESPONSE | grep -o '"url":"[^"]*' | cut -d'"' -f4)

# Then submit request:
curl -X POST https://www.saukimart.online/api/sim-activation \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"serial_number\": \"SIM123456789\",
    \"image_url\": \"$IMAGE_URL\",
    \"pin\": \"123456\"
  }"

# Expected Response:
{
  "success": true,
  "message": "SIM activation request submitted",
  "request_id": "uuid",
  "fee": 5000,
  "new_balance": 0,
  "status": "under_review"
}
```

### 13. Get Broadcasts
```bash
curl -X GET https://www.saukimart.online/api/broadcasts

# Expected Response:
{
  "success": true,
  "broadcasts": [
    {
      "id": "uuid",
      "title": "Announcement",
      "message": "Check out our new products!",
      "active": true,
      "created_at": "2026-03-07T08:00:00Z"
    }
  ]
}
```

### 14. Get Chat History
```bash
curl -X GET 'https://www.saukimart.online/api/chat' \
  -H "Authorization: Bearer $USER_TOKEN"

# Expected Response:
{
  "success": true,
  "messages": [
    {
      "id": "uuid",
      "sender": "admin",
      "message": "Hello! How can we help?",
      "timestamp": "2026-03-07T10:00:00Z"
    }
  ]
}
```

### 15. Send Chat Message
```bash
curl -X POST https://www.saukimart.online/api/chat \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "I need help with my order"
  }'

# Expected Response:
{
  "success": true,
  "message": "Message sent",
  "message_id": "uuid"
}
```

---

## 📤 File Upload

### 16. Upload File
```bash
curl -X POST https://www.saukimart.online/api/upload \
  -H "Authorization: Bearer $USER_TOKEN" \
  -F "file=@image.jpg"

# Or with admin key:
curl -X POST https://www.saukimart.online/api/upload \
  -H "x-admin-key: $ADMIN_SECRET_KEY" \
  -F "file=@image.jpg" \
  -F "path=products/"

# Expected Response:
{
  "success": true,
  "url": "https://xxxxx.blob.vercel-storage.com/uploads/image-xyz.jpg",
  "size": 12345
}
```

---

## 🔗 Webhooks

### 17. Flutterwave Webhook (Tested Manually)
```bash
# Flutterwave CHARGES (incoming transfers to virtual account)
curl -X POST https://www.saukimart.online/api/webhooks/flutterwave \
  -H "verif-hash: $FLW_WEBHOOK_HASH" \
  -H "Content-Type: application/json" \
  -d '{
    "event": "charge.completed",
    "data": {
      "id": 1234567890,
      "tx_ref": "user_deposit_ref_123",
      "amount": 5000,
      "currency": "NGN",
      "status": "successful",
      "customer": {
        "email": "user@example.com",
        "phone": "+2348012345678"
      }
    }
  }'

# Expected Response:
{
  "success": true,
  "message": "Webhook processed",
  "tx_ref": "user_deposit_ref_123"
}
```

---

## 👨‍💼 Admin Endpoints

### 18. Admin Login
```bash
curl -X POST https://www.saukimart.online/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@saukimart.online",
    "password": "ChangeMe@2026!"
  }'

# Expected Response:
{
  "success": true,
  "token": "eyJhbGc...",
  "admin": {
    "id": "uuid",
    "email": "admin@saukimart.online",
    "role": "superadmin"
  }
}
```

### 19. Get All Users (Admin)
```bash
curl -X GET 'https://www.saukimart.online/api/admin/users?skip=0&limit=50' \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# With search:
curl -X GET 'https://www.saukimart.online/api/admin/users?search=08012' \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Expected Response:
{
  "success": true,
  "users": [
    {
      "id": "uuid",
      "phone": "+2348012345678",
      "name": "User Name",
      "wallet_balance": 4900,
      "banned": false,
      "created_at": "2026-03-07T10:00:00Z"
    }
  ],
  "total": 123
}
```

### 20. Ban/Unban User (Admin)
```bash
curl -X PATCH https://www.saukimart.online/api/admin/users \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "uuid",
    "banned": true,
    "reason": "Suspicious activity"
  }'

# Expected Response:
{
  "success": true,
  "message": "User updated",
  "user": { ... }
}
```

### 21. Create Product (Admin)
```bash
curl -X POST https://www.saukimart.online/api/admin/products \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Product",
    "description": "Product description",
    "price": 5000,
    "image_url": "https://...",
    "stock_status": "in_stock",
    "shipping_fee": 500,
    "pickup_only": false
  }'

# Expected Response:
{
  "success": true,
  "message": "Product created",
  "product": { ... }
}
```

### 22. Update Product (Admin)
```bash
curl -X PATCH https://www.saukimart.online/api/admin/products \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "product_id": "uuid",
    "price": 4500,
    "stock_status": "low_stock"
  }'

# Expected Response:
{
  "success": true,
  "message": "Product updated"
}
```

### 23. Delete Product (Admin)
```bash
curl -X DELETE https://www.saukimart.online/api/admin/products \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "product_id": "uuid"
  }'

# Expected Response:
{
  "success": true,
  "message": "Product deleted"
}
```

### 24. Create Data Plan (Admin)
```bash
curl -X POST https://www.saukimart.online/api/admin/plans \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "network_id": 1,
    "network": "MTN",
    "data_size": "1GB",
    "validity": "30 days",
    "cost_price": 500,
    "selling_price": 600,
    "plan_id": "mtn_1gb_30d"
  }'

# Expected Response:
{
  "success": true,
  "message": "Plan created",
  "plan": { ... }
}
```

### 25. Update Data Plan (Admin)
```bash
curl -X PATCH https://www.saukimart.online/api/admin/plans \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "plan_id": "mtn_1gb_30d",
    "selling_price": 580
  }'

# Expected Response:
{
  "success": true,
  "message": "Plan updated"
}
```

### 26. Get All Transactions (Admin)
```bash
curl -X GET 'https://www.saukimart.online/api/admin/transactions?skip=0&limit=100' \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Filter by user:
curl -X GET "https://www.saukimart.online/api/admin/transactions?user_id=uuid" \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Expected Response:
{
  "success": true,
  "transactions": [ ... ],
  "total": 1234
}
```

### 27. Create Broadcast (Admin)
```bash
curl -X POST https://www.saukimart.online/api/admin/broadcasts \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "New Feature",
    "message": "We just added airtel SIM activation!",
    "active": true
  }'

# Expected Response:
{
  "success": true,
  "message": "Broadcast created",
  "broadcast": { ... }
}
```

### 28. Admin Chat with User
```bash
curl -X POST https://www.saukimart.online/api/admin/chat \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "uuid",
    "message": "Your SIM activation has been approved!"
  }'

# Expected Response:
{
  "success": true,
  "message": "Message sent"
}
```

### 29. Credit/Debit User Wallet (Admin)
```bash
curl -X POST https://www.saukimart.online/api/admin/wallet \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "uuid",
    "action": "credit",
    "amount": 1000,
    "reason": "Refund for failed purchase"
  }'

# Expected Response:
{
  "success": true,
  "message": "Wallet updated",
  "new_balance": 5900
}
```

### 30. SIM Activation Management (Admin)
```bash
# Get all SIM requests
curl -X GET https://www.saukimart.online/api/admin/sim-activations \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Approve/Reject SIM request
curl -X PATCH https://www.saukimart.online/api/admin/sim-activations \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "request_id": "uuid",
    "status": "approved",
    "admin_notes": "SIM activated successfully"
  }'

# Expected Response:
{
  "success": true,
  "message": "Request updated"
}
```

### 31. Get Site Settings (Admin)
```bash
curl -X GET https://www.saukimart.online/api/admin/settings \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Expected Response:
{
  "success": true,
  "settings": {
    "maintenance_mode": false,
    "registration_open": true,
    "app_name": "SaukiMart",
    "support_email": "support@saukimart.online",
    "support_phone": "+2348012345678"
  }
}
```

### 32. Update Site Settings (Admin)
```bash
curl -X PATCH https://www.saukimart.online/api/admin/settings \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "maintenance_mode": false,
    "support_phone": "+2349123456789"
  }'

# Expected Response:
{
  "success": true,
  "message": "Settings updated"
}
```

### 33. Get Analytics Dashboard (Admin)
```bash
curl -X GET https://www.saukimart.online/api/admin/analytics \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Expected Response:
{
  "success": true,
  "analytics": {
    "total_users": 542,
    "active_users": 89,
    "total_transactions": 1234,
    "total_revenue": 2500000,
    "daily_revenue": 150000,
    "total_profit": 500000,
    "data_breakdown": { ... },
    "daily_breakdown": [ ... ]
  }
}
```

### 34. Get Webhook Logs (Admin)
```bash
curl -X GET 'https://www.saukimart.online/api/admin/webhooks?skip=0&limit=50' \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Expected Response:
{
  "success": true,
  "webhooks": [
    {
      "id": "uuid",
      "event": "charge.completed",
      "status": "success",
      "created_at": "2026-03-07T10:00:00Z",
      "payload": { ... }
    }
  ],
  "total": 456
}
```

### 35. Initialize Database (One-time Setup)
```bash
curl -X POST https://www.saukimart.online/api/admin/init-db \
  -H "Content-Type: application/json"

# Expected Response:
{
  "success": true,
  "message": "Database initialized and seeded",
  "tables_created": 10,
  "data_plans_added": 28
}
```

### 36. Admin Console / Debug Endpoint
```bash
# Test Flutterwave connection
curl -X POST https://www.saukimart.online/api/admin/console \
  -H "x-admin-key: $ADMIN_SECRET_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "test_flutterwave"
  }'

# Test Amigo API connection
curl -X POST https://www.saukimart.online/api/admin/console \
  -H "x-admin-key: $ADMIN_SECRET_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "test_amigo",
    "network": 1
  }'

# Expected Response:
{
  "success": true,
  "service": "flutterwave|amigo",
  "status": "connected",
  "data": { ... }
}
```

---

## ⚠️ Common Error Codes

| Code | Meaning | Solution |
|------|---------|----------|
| 400 | Bad Request | Check JSON format, required fields |
| 401 | Unauthorized | Invalid token, token expired, or missing authorization |
| 403 | Forbidden | Not permitted, insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 500 | Server Error | Check Vercel logs, database connection |
| 503 | Service Unavailable | Service temporarily down |

---

## ✅ Testing Checklist

- [ ] All 36 endpoints tested
- [ ] All success responses validated
- [ ] Error handling confirmed (invalid input)
- [ ] Authentication verified (JWT tokens)
- [ ] Admin operations verified
- [ ] Webhook tested (manual)
- [ ] Database consistency checked
- [ ] Performance acceptable (<200ms response time)
- [ ] No SQL injection vulnerabilities
- [ ] CORS headers present for cross-origin requests

---

**Last Updated:** March 7, 2026 | **API Version:** 1.0 | **Status:** READY FOR TESTING

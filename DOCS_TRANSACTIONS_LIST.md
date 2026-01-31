Transactions List API (Admin-only)

Endpoint (GET)

GET https://sukimart.online/api/transactions/list

Headers:
- X-ADMIN-PASSWORD: <your_admin_password>
- Accept: application/json

Query Params:
- date=YYYY-MM-DD (optional) — limit to a single day
- status=delivered,paid,pending,failed (optional, comma-separated)

Example curl:

curl -v "https://sukimart.online/api/transactions/list?date=2026-01-31&status=delivered,paid" \
  -H "X-ADMIN-PASSWORD: your_admin_password_here"

Response: Array of transaction objects (JSON)

Notes:
- The endpoint requires the admin password available in the `ADMIN_PASSWORD` environment variable.
- CORS is enabled so you can call this from another browser/session — include the `X-ADMIN-PASSWORD` header.
- Use query params to filter by date or status for faster retrieval.

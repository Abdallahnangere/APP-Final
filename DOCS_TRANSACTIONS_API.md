Transactions Day API (Admin-only)

Endpoint (GET)

GET https://sukimart.online/api/transactions/day?date=YYYY-MM-DD

Headers:
- X-ADMIN-PASSWORD: <your_admin_password>
- Accept: application/json

Example curl (GET):

curl -v "https://sukimart.online/api/transactions/day?date=2026-01-31" \
  -H "X-ADMIN-PASSWORD: your_admin_password_here"

Endpoint (POST)

POST https://sukimart.online/api/transactions/day

Headers:
- Content-Type: application/json
- X-ADMIN-PASSWORD: <your_admin_password>

Body (JSON):
{
  "date": "2026-01-31",
  "agentId": "optional-agent-id"
}

Sample successful response (JSON):

{
  "success": true,
  "date": "2026-01-31",
  "count": 42,
  "transactions": [
    {
      "id": "uuid",
      "tx_ref": "TXN20260131001",
      "type": "data",
      "amount": 500,
      "status": "delivered",
      "phone": "08012345678",
      "createdAt": "2026-01-31T09:12:34.000Z",
      "dataPlan": { /* included plan info */ },
      "product": null,
      "agent": { /* agent data if any */ }
    }
    // ...
  ]
}

Notes:
- The endpoint is admin-only and uses the `ADMIN_PASSWORD` environment variable set in Vercel (or your hosting provider). When calling from another browser or script, include the `X-ADMIN-PASSWORD` header.
- The endpoint supports CORS (Access-Control-Allow-Origin: *).
- You can filter by `agentId` as a query param or in the POST body for a narrower result set.

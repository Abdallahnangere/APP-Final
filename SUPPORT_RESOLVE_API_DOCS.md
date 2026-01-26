# Admin Support Ticket Resolution API

## Endpoint: POST `/api/admin/support/resolve`

### Purpose
Marks a support ticket as resolved in the admin panel.

### Request Body
```json
{
  "password": "YOUR_ADMIN_PASSWORD",
  "ticketId": "clm123456789abcdef"
}
```

### Parameters
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `password` | string | Yes | Admin password (verified against `ADMIN_PASSWORD` env var) |
| `ticketId` | string | Yes | Unique ID of the support ticket to resolve |

### Response - Success (200)
```json
{
  "success": true,
  "ticket": {
    "id": "clm123456789abcdef",
    "phone": "08012345678",
    "message": "Data not delivered",
    "status": "resolved",
    "createdAt": "2026-01-26T10:30:00Z",
    "updatedAt": "2026-01-26T10:45:00Z"
  }
}
```

### Response - Unauthorized (401)
```json
{
  "error": "Unauthorized"
}
```

### Response - Server Error (500)
```json
{
  "error": "Failed to resolve ticket"
}
```

---

## Implementation Details

### File Location
`app/api/admin/support/resolve/route.ts`

### Logic Flow
1. Extract `password` and `ticketId` from request body
2. Verify password matches `ADMIN_PASSWORD` environment variable
3. If unauthorized, return 401 status
4. Query database for ticket by ID
5. Update ticket status to "resolved"
6. Update `updatedAt` timestamp
7. Return updated ticket object
8. Catch any errors and return 500

### Database Update
```prisma
supportTicket.update({
  where: { id: ticketId },
  data: { 
    status: 'resolved',
    updatedAt: new Date()
  }
})
```

---

## Frontend Usage

### From Admin Dashboard
```javascript
const markResolved = async (ticketId) => {
  try {
    const response = await fetch('/api/admin/support/resolve', {
      method: 'POST',
      body: JSON.stringify({ 
        ticketId, 
        password: adminPassword 
      })
    });
    
    if (response.ok) {
      const result = await response.json();
      toast.success("Ticket marked as resolved");
      refreshTickets(); // Reload ticket list
    } else {
      toast.error("Failed to resolve ticket");
    }
  } catch (error) {
    toast.error("Server error");
  }
};
```

---

## Database Schema Requirement

The `SupportTicket` model should have:
```prisma
model SupportTicket {
  id        String   @id @default(cuid())
  phone     String
  message   String
  status    String   @default("open") // "open" or "resolved"
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

---

## Security Notes

- ✅ Password-protected (admin only)
- ✅ Verifies against environment variable
- ✅ Updates timestamp for audit trail
- ✅ Returns 401 for failed authentication
- ✅ Uses POST method (not GET)

---

## Possible Enhancements

1. Add ticket category (bug, feature request, complaint)
2. Add resolution reason/notes
3. Add admin user tracking (who resolved)
4. Add priority levels
5. Add SLA tracking (time to resolve)
6. Add auto-assignment logic
7. Add response template system
8. Add customer notification on resolution

---

## Error Handling

| Scenario | Status | Error Message |
|----------|--------|---------------|
| Wrong password | 401 | Unauthorized |
| Invalid ticket ID | 404 | Not found (or included in try-catch) |
| Database error | 500 | Failed to resolve ticket |
| Missing parameters | 500 | Caught by try-catch |

---

## Testing

### cURL Example
```bash
curl -X POST http://localhost:3000/api/admin/support/resolve \
  -H "Content-Type: application/json" \
  -d '{
    "password": "your_password",
    "ticketId": "ticket_id_here"
  }'
```

### Expected Response
```json
{
  "success": true,
  "ticket": {
    "id": "...",
    "phone": "...",
    "message": "...",
    "status": "resolved",
    "updatedAt": "2026-01-26T..."
  }
}
```

---

**Created:** January 26, 2026
**Status:** Active & Integrated

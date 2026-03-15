# Sauki Mart — Support Chat System

Complete support chat system with Gemini AI, SSE real-time messaging, 
Neon PostgreSQL, and premium dark UI.

---

## Files Delivered

```
migrations/
  001_schema.sql              ← Run this first on your Neon DB

lib/
  db.ts                       ← Neon PostgreSQL client
  gemini.ts                   ← Gemini AI client + full Sauki AI system prompt
  types.ts                    ← TypeScript interfaces

app/api/chat/
  sessions/route.ts           ← Create / fetch sessions
  message/route.ts            ← Send message + trigger AI
  stream/route.ts             ← SSE: customer real-time stream
  typing/route.ts             ← Typing indicator updates

app/api/admin/
  stream/route.ts             ← SSE: admin real-time stream (all sessions)
  sessions/route.ts           ← Fetch sessions + stats (with filters)
  intervene/route.ts          ← Agent takeover, resolve, flag, notes, send message

app/support/
  page.tsx                    ← Customer chat tab component

app/admin/support/
  page.tsx                    ← Admin dashboard component
```

---

## Setup

### 1. Environment Variables
Add to your `.env.local` (Vercel dashboard → Settings → Environment Variables):
```
DATABASE_URL=your_neon_postgresql_connection_string
GEMINI_API_KEY=your_gemini_api_key
```

### 2. Run Database Migration
Go to your Neon dashboard → SQL Editor, paste and run:
`migrations/001_schema.sql`

### 3. Install Dependencies
```bash
npm install @google/generative-ai pg
npm install -D @types/pg
```

### 4. Drop Files Into Your Project
Copy each file from this bundle to the corresponding path in your Next.js project.
The `lib/` files go into your existing `/lib` folder.
The `app/` files go into your existing `/app` folder.

### 5. Protect Admin Route
Add your existing auth middleware or session check to `/app/admin/support/page.tsx`
to ensure only admins can access it.

---

## How It Works

**Customer Flow**
1. Customer opens the support tab → session is created or resumed from sessionStorage
2. SSE connection opens → real-time messages stream in
3. Customer types → debounced typing indicator is sent to DB
4. Customer sends message → Gemini AI responds based on strict rules
5. If escalated → AI stops, admin is notified, agent takes over

**Admin Flow**
1. Admin opens dashboard → SSE stream receives all sessions in real-time
2. New escalations trigger toast notifications
3. Admin clicks a session → full message history loads, customer messages marked read
4. Admin can take over (agent mode), resolve, flag, or add private internal notes
5. Agent messages are sent directly to customer in real-time

---

## Gemini AI Behavior Summary

| Trigger | Response |
|---|---|
| Greeting | Welcome message + introduction |
| Can't buy data | Log out / log in + downtime note |
| Sent data, not received | Dial *323*4# to check |
| *323*4# checked, still missing | Escalate to agent, AI goes silent |
| Money sent, wallet not credited | Check with bank, provide ref |
| Device/order issue | Provide order ID, escalate |
| Account locked/forgot password | Reset password steps |
| Wants human agent | Immediately escalate |
| Out of scope | Politely redirect |
| Abusive language | One calm warning, then escalate |

-- ============================================================
-- Sauki Mart Support Chat System — Database Schema
-- Run this on your Neon PostgreSQL database
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Chat Sessions
CREATE TABLE IF NOT EXISTS chat_sessions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id      TEXT NOT NULL,
  customer_name    TEXT DEFAULT 'Customer',
  status           TEXT NOT NULL DEFAULT 'active',
  -- status: 'active' | 'agent_required' | 'agent_active' | 'resolved' | 'flagged'
  agent_required   BOOLEAN DEFAULT FALSE,
  agent_mode       BOOLEAN DEFAULT FALSE,
  agent_id         TEXT,
  internal_notes   TEXT[] DEFAULT '{}',
  last_message     TEXT,
  last_message_at  TIMESTAMPTZ DEFAULT NOW(),
  started_at       TIMESTAMPTZ DEFAULT NOW(),
  resolved_at      TIMESTAMPTZ,
  message_count    INT DEFAULT 0
);

-- Chat Messages
CREATE TABLE IF NOT EXISTS chat_messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id  UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  sender      TEXT NOT NULL, -- 'customer' | 'ai' | 'agent'
  content     TEXT NOT NULL,
  read        BOOLEAN DEFAULT FALSE,
  delivered   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Typing Indicators
CREATE TABLE IF NOT EXISTS typing_indicators (
  session_id  UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  sender      TEXT NOT NULL, -- 'customer' | 'agent'
  is_typing   BOOLEAN DEFAULT FALSE,
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (session_id, sender)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_messages_session_id  ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at  ON chat_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_status      ON chat_sessions(status);
CREATE INDEX IF NOT EXISTS idx_sessions_customer_id ON chat_sessions(customer_id);
CREATE INDEX IF NOT EXISTS idx_sessions_last_msg    ON chat_sessions(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_typing_session       ON typing_indicators(session_id);

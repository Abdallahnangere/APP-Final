-- ==========================================
-- SAUKIMART PUSH CREDIT ALERT MIGRATION ONLY
-- Run this after your existing init script.
-- Safe to run multiple times.
-- ==========================================

BEGIN;

-- 1) Device token table for user-specific push mapping
CREATE TABLE IF NOT EXISTS user_push_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  platform TEXT DEFAULT 'android',
  app_version TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2) Ensure notification toggle exists (older DBs safety)
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS notifications_enabled BOOLEAN DEFAULT TRUE;

-- 3) Helpful indexes for query speed
CREATE INDEX IF NOT EXISTS idx_user_push_tokens_user_active
  ON user_push_tokens (user_id, is_active);

CREATE INDEX IF NOT EXISTS idx_user_push_tokens_last_seen
  ON user_push_tokens (last_seen_at DESC);

-- 4) Backfill safety: null flags become true
UPDATE users
SET notifications_enabled = TRUE
WHERE notifications_enabled IS NULL;

-- 5) Optional cleanup helper (run manually when needed)
-- UPDATE user_push_tokens
-- SET is_active = FALSE, updated_at = NOW()
-- WHERE is_active = TRUE AND last_seen_at < (NOW() - INTERVAL '90 days');

COMMIT;

-- Quick verification queries
-- SELECT COUNT(*) AS total_tokens FROM user_push_tokens;
-- SELECT user_id, COUNT(*) AS active_tokens FROM user_push_tokens WHERE is_active = TRUE GROUP BY user_id ORDER BY active_tokens DESC LIMIT 20;

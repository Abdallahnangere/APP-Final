-- Developer API System Migration (SaukiMart)
-- Run this once on Neon (PostgreSQL)

CREATE EXTENSION IF NOT EXISTS pgcrypto;

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS is_developer BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS developer_discount_percent NUMERIC(5,2) NOT NULL DEFAULT 8.00,
  ADD COLUMN IF NOT EXISTS developer_terms_accepted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS developer_terms_version TEXT;

CREATE TABLE IF NOT EXISTS developer_api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  key_prefix TEXT NOT NULL,
  key_hash TEXT NOT NULL,
  key_last4 TEXT NOT NULL,
  encrypted_key TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_used_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_developer_api_keys_prefix_active
  ON developer_api_keys (key_prefix, is_active);

CREATE INDEX IF NOT EXISTS idx_developer_api_keys_user_id
  ON developer_api_keys (user_id, created_at DESC);

ALTER TABLE developer_api_keys
  ADD COLUMN IF NOT EXISTS encrypted_key TEXT;

CREATE TABLE IF NOT EXISTS developer_api_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  api_key_id UUID REFERENCES developer_api_keys(id) ON DELETE SET NULL,
  transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
  endpoint TEXT NOT NULL,
  request_payload JSONB,
  response_data JSONB,
  status TEXT NOT NULL,
  network TEXT,
  plan_code TEXT,
  phone_number TEXT,
  app_price NUMERIC(12,2) NOT NULL DEFAULT 0,
  developer_price NUMERIC(12,2) NOT NULL DEFAULT 0,
  idempotency_key TEXT,
  amigo_reference TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dev_api_tx_user_created
  ON developer_api_transactions (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_dev_api_tx_idempotency
  ON developer_api_transactions (idempotency_key);

CREATE INDEX IF NOT EXISTS idx_dev_api_tx_transaction
  ON developer_api_transactions (transaction_id);

-- Optional helper index for quick developer lookup
CREATE INDEX IF NOT EXISTS idx_users_is_developer
  ON users (is_developer);

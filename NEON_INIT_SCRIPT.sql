-- ==========================================
-- SAUKIMART DATABASE INITIALIZATION SCRIPT
-- Run this on Neon SQL Editor
-- ==========================================

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  pin_hash TEXT NOT NULL,
  wallet_balance NUMERIC(12,2) DEFAULT 0,
  cashback_balance NUMERIC(12,2) DEFAULT 0,
  referral_bonus NUMERIC(12,2) DEFAULT 0,
  flw_account_number TEXT,
  flw_bank_name TEXT,
  flw_account_reference TEXT,
  flw_order_ref TEXT,
  is_banned BOOLEAN DEFAULT FALSE,
  notifications_enabled BOOLEAN DEFAULT TRUE,
  haptics_enabled BOOLEAN DEFAULT TRUE,
  theme TEXT DEFAULT 'light',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Data Plans Table
CREATE TABLE IF NOT EXISTS data_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  network TEXT NOT NULL,
  network_id INTEGER NOT NULL,
  plan_id INTEGER NOT NULL,
  data_size TEXT NOT NULL,
  validity TEXT NOT NULL,
  selling_price NUMERIC(10,2) NOT NULL,
  cost_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Products Table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL,
  cost_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  image_url TEXT,
  category TEXT DEFAULT 'General',
  in_stock BOOLEAN DEFAULT TRUE,
  shipping_terms TEXT,
  pickup_terms TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Transactions Table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  description TEXT,
  amount NUMERIC(10,2) NOT NULL,
  status TEXT DEFAULT 'pending',
  network TEXT,
  plan_id INTEGER,
  phone_number TEXT,
  product_id UUID,
  product_name TEXT,
  amigo_reference TEXT,
  idempotency_key TEXT UNIQUE,
  receipt_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Deposits Table
CREATE TABLE IF NOT EXISTS deposits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  flw_transaction_id TEXT UNIQUE,
  flw_ref TEXT,
  amount NUMERIC(10,2) NOT NULL,
  sender_name TEXT,
  sender_account TEXT,
  narration TEXT,
  status TEXT DEFAULT 'success',
  raw_webhook JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Broadcasts Table
CREATE TABLE IF NOT EXISTS broadcasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. SIM Activations Table
CREATE TABLE IF NOT EXISTS sim_activations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  serial_number TEXT,
  front_image_url TEXT,
  back_image_url TEXT,
  status TEXT DEFAULT 'under_review',
  amount NUMERIC(10,2) DEFAULT 5000,
  admin_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Chats Table
CREATE TABLE IF NOT EXISTS chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  sender TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Webhooks Log Table
CREATE TABLE IF NOT EXISTS webhooks_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event TEXT,
  payload JSONB,
  processed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Site Settings Table
CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Admin Sessions Table
CREATE TABLE IF NOT EXISTS admin_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- SEED DEFAULT DATA
-- ==========================================

-- Insert default site settings
INSERT INTO site_settings (key, value) VALUES
  ('maintenance_mode', 'false'),
  ('registration_open', 'true'),
  ('app_name', 'SaukiMart'),
  ('support_phone1', '+2347044647081'),
  ('support_phone2', '+2348061934056'),
  ('support_email', 'support@saukimart.online')
ON CONFLICT (key) DO NOTHING;

-- ==========================================
-- SEED 28 DATA PLANS (MTN, GLO, AIRTEL)
-- ==========================================

-- MTN Plans (7 plans)
INSERT INTO data_plans (network, network_id, plan_id, data_size, validity, selling_price, cost_price) VALUES
  ('MTN', 1, 5000, '500MB', '30 days', 350, 299),
  ('MTN', 1, 1001, '1GB', '30 days', 500, 429),
  ('MTN', 1, 6666, '2GB', '30 days', 950, 849),
  ('MTN', 1, 3333, '3GB', '30 days', 1450, 1329),
  ('MTN', 1, 9999, '5GB', '30 days', 1999, 1799),
  ('MTN', 1, 7777, '7GB', '30 days', 2799, 2499),
  ('MTN', 1, 1110, '10GB', '30 days', 4299, 3899);

-- GLO Plans (6 plans)
INSERT INTO data_plans (network, network_id, plan_id, data_size, validity, selling_price, cost_price) VALUES
  ('GLO', 2, 218, '200MB', '30 days', 150, 99),
  ('GLO', 2, 217, '500MB', '30 days', 250, 199),
  ('GLO', 2, 206, '1GB', '30 days', 499, 399),
  ('GLO', 2, 195, '2GB', '30 days', 999, 799),
  ('GLO', 2, 196, '3GB', '30 days', 1399, 1199),
  ('GLO', 2, 222, '5GB', '30 days', 2299, 1999);

-- AIRTEL Plans (5 plans)
INSERT INTO data_plans (network, network_id, plan_id, data_size, validity, selling_price, cost_price) VALUES
  ('AIRTEL', 4, 539, '500MB', '7 days', 649, 549),
  ('AIRTEL', 4, 400, '1GB', '7 days', 849, 749),
  ('AIRTEL', 4, 532, '3GB', '30 days', 2199, 1950),
  ('AIRTEL', 4, 391, '4GB', '30 days', 2699, 2419),
  ('AIRTEL', 4, 392, '10GB', '30 days', 4299, 3899);

-- ==========================================
-- VERIFICATION QUERIES
-- ==========================================

-- Verify all tables created
SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename;

-- Verify data plans count (should be 18)
SELECT COUNT(*) as total_plans, network, COUNT(*) as per_network 
FROM data_plans 
GROUP BY network 
ORDER BY network;

-- Verify site settings
SELECT * FROM site_settings;

-- ==========================================
-- SUMMARY
-- ==========================================
-- ✅ 11 tables created
-- ✅ 18 data plans seeded (7 MTN + 6 GLO + 5 AIRTEL)
-- ✅ 6 default site settings configured
-- ✅ Ready for production!
-- ==========================================

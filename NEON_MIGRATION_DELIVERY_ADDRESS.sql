-- ==========================================
-- NEON MIGRATION: Add Delivery Address Support
-- Run this on Neon SQL Editor after main init script
-- ==========================================

-- 1. Add delivery_address column to transactions table (if not exists)
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS delivery_address TEXT,
ADD COLUMN IF NOT EXISTS delivery_city TEXT,
ADD COLUMN IF NOT EXISTS delivery_postal_code TEXT;

-- 2. Create dedicated delivery_addresses table for tracking
CREATE TABLE IF NOT EXISTS delivery_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  street_address TEXT NOT NULL,
  city TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  full_address TEXT NOT NULL,
  delivery_status TEXT DEFAULT 'pending', -- pending, in_transit, delivered, cancelled
  tracking_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_delivery_by_user ON delivery_addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_delivery_by_transaction ON delivery_addresses(transaction_id);
CREATE INDEX IF NOT EXISTS idx_delivery_status ON delivery_addresses(delivery_status);

-- 4. Add admin delivery tracking table
CREATE TABLE IF NOT EXISTS delivery_admin_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  delivery_id UUID REFERENCES delivery_addresses(id) ON DELETE CASCADE,
  admin_id UUID,
  note TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Update products table to track delivery defaults (optional)
ALTER TABLE products
ADD COLUMN IF NOT EXISTS requires_delivery BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS shipping_cost NUMERIC(10,2) DEFAULT 0;

-- 6. Verification queries
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'transactions' 
ORDER BY ordinal_position;

SELECT tablename FROM pg_tables 
WHERE schemaname='public' AND tablename LIKE 'delivery%' 
ORDER BY tablename;

-- ==========================================
-- SUMMARY
-- ==========================================
-- ✅ Added delivery_address columns to transactions table
-- ✅ Created delivery_addresses table for detailed tracking
-- ✅ Created delivery_admin_notes table for admin comments
-- ✅ Added indexes for performance
-- ✅ Updated products table with shipping info
-- ==========================================

/**
 * Database Migration Script - Sauki Mart v2.5.1
 * Date: January 26, 2026
 * 
 * This script updates the database schema to support:
 * 1. Cashback wallet balance (agent rewards)
 * 2. Transaction cashback tracking
 * 3. PIN hashing for security
 * 
 * RUN THIS SCRIPT ON YOUR NEON POSTGRES DATABASE
 */

-- Step 1: Add Cashback fields to Agent table if they don't exist
ALTER TABLE "Agent"
ADD COLUMN IF NOT EXISTS "cashbackBalance" DECIMAL(10, 2) DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS "totalCashbackEarned" DECIMAL(10, 2) DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS "cashbackRedeemed" DECIMAL(10, 2) DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS "lastCashbackUpdate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Step 2: Add cashback tracking fields to Transaction table if they don't exist
ALTER TABLE "Transaction"
ADD COLUMN IF NOT EXISTS "agentCashbackAmount" DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS "cashbackProcessed" BOOLEAN DEFAULT false;

-- Step 3: Create CashbackTransaction table for detailed tracking
CREATE TABLE IF NOT EXISTS "CashbackTransaction" (
  "id" VARCHAR(36) NOT NULL PRIMARY KEY,
  "agentId" VARCHAR(36) NOT NULL,
  "type" VARCHAR(50) NOT NULL,
  "amount" DECIMAL(10, 2) NOT NULL,
  "transactionId" VARCHAR(36),
  "description" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL,
  CONSTRAINT "CashbackTransaction_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent" ("id") ON DELETE CASCADE,
  CONSTRAINT "CashbackTransaction_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction" ("id") ON DELETE SET NULL
);

-- Step 4: Create index on CashbackTransaction for faster queries
CREATE INDEX IF NOT EXISTS "CashbackTransaction_agentId_idx" ON "CashbackTransaction"("agentId");
CREATE INDEX IF NOT EXISTS "CashbackTransaction_transactionId_idx" ON "CashbackTransaction"("transactionId");
CREATE INDEX IF NOT EXISTS "CashbackTransaction_createdAt_idx" ON "CashbackTransaction"("createdAt");

-- Step 5: Create AgentWalletTransaction table for wallet credits
CREATE TABLE IF NOT EXISTS "AgentWalletTransaction" (
  "id" VARCHAR(36) NOT NULL PRIMARY KEY,
  "agentId" VARCHAR(36) NOT NULL,
  "type" VARCHAR(50) NOT NULL,
  "amount" DECIMAL(10, 2) NOT NULL,
  "source" VARCHAR(100),
  "description" TEXT,
  "balanceBefore" DECIMAL(10, 2),
  "balanceAfter" DECIMAL(10, 2),
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AgentWalletTransaction_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent" ("id") ON DELETE CASCADE
);

-- Step 6: Create index on AgentWalletTransaction
CREATE INDEX IF NOT EXISTS "AgentWalletTransaction_agentId_idx" ON "AgentWalletTransaction"("agentId");
CREATE INDEX IF NOT EXISTS "AgentWalletTransaction_createdAt_idx" ON "AgentWalletTransaction"("createdAt");

-- Step 7: Update PINs - Already bcrypt hashed if migrated, but ensure format is correct
-- NOTE: PINs should already be hashed from the PIN migration script
-- Verify:
-- SELECT COUNT(*) as "pin_count" FROM "Agent" WHERE "pin" NOT LIKE '$2%';
-- This should return 0 if all PINs are hashed

-- Step 8: Create Cashback Rules table for easy management
CREATE TABLE IF NOT EXISTS "CashbackRule" (
  "id" VARCHAR(36) NOT NULL PRIMARY KEY,
  "name" VARCHAR(100) NOT NULL,
  "type" VARCHAR(50) NOT NULL,
  "percentage" DECIMAL(5, 2) DEFAULT 2.0,
  "isActive" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL
);

-- Step 9: Insert default cashback rule
INSERT INTO "CashbackRule" ("id", "name", "type", "percentage", "isActive", "createdAt", "updatedAt")
VALUES ('cashback-rule-001', 'Standard Agent Cashback', 'purchase', 2.0, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;

-- Step 10: Create AgentCashbackRedemption table for tracking cashback withdrawals
CREATE TABLE IF NOT EXISTS "AgentCashbackRedemption" (
  "id" VARCHAR(36) NOT NULL PRIMARY KEY,
  "agentId" VARCHAR(36) NOT NULL,
  "amount" DECIMAL(10, 2) NOT NULL,
  "status" VARCHAR(50) DEFAULT 'pending',
  "type" VARCHAR(50) NOT NULL,
  "walletReference" VARCHAR(100),
  "notes" TEXT,
  "approvedAt" TIMESTAMP,
  "approvedBy" VARCHAR(36),
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL,
  CONSTRAINT "AgentCashbackRedemption_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent" ("id") ON DELETE CASCADE
);

-- Step 11: Create indexes on AgentCashbackRedemption
CREATE INDEX IF NOT EXISTS "AgentCashbackRedemption_agentId_idx" ON "AgentCashbackRedemption"("agentId");
CREATE INDEX IF NOT EXISTS "AgentCashbackRedemption_status_idx" ON "AgentCashbackRedemption"("status");
CREATE INDEX IF NOT EXISTS "AgentCashbackRedemption_createdAt_idx" ON "AgentCashbackRedemption"("createdAt");

-- Step 12: Backup existing PIN field for reference (optional - uncomment if needed)
-- ALTER TABLE "Agent" ADD COLUMN IF NOT EXISTS "pinBackup" TEXT;
-- UPDATE "Agent" SET "pinBackup" = "pin" WHERE "pinBackup" IS NULL AND "pin" IS NOT NULL;

-- Step 13: Verify data integrity
-- This query should return empty result if all is good
-- SELECT * FROM "Agent" WHERE "pin" IS NULL OR "pin" = '';

-- VERIFICATION QUERIES (run these to verify migration was successful):
/*
-- Check Agent table has new columns
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'Agent' AND column_name IN ('cashbackBalance', 'totalCashbackEarned', 'lastCashbackUpdate');

-- Check Transaction table has cashback columns
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'Transaction' AND column_name IN ('agentCashbackAmount', 'cashbackProcessed');

-- Verify PIN hashing (should all start with $2)
SELECT COUNT(*) as "hashed_pin_count" FROM "Agent" WHERE "pin" LIKE '$2%';

-- Check new tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_name IN ('CashbackTransaction', 'AgentWalletTransaction', 'CashbackRule', 'AgentCashbackRedemption');

-- Count agents
SELECT COUNT(*) as "total_agents" FROM "Agent";
*/

-- ROLLBACK (if needed, uncomment to revert):
/*
ALTER TABLE "Agent" DROP COLUMN IF EXISTS "cashbackBalance";
ALTER TABLE "Agent" DROP COLUMN IF EXISTS "totalCashbackEarned";
ALTER TABLE "Agent" DROP COLUMN IF EXISTS "cashbackRedeemed";
ALTER TABLE "Agent" DROP COLUMN IF EXISTS "lastCashbackUpdate";

ALTER TABLE "Transaction" DROP COLUMN IF EXISTS "agentCashbackAmount";
ALTER TABLE "Transaction" DROP COLUMN IF EXISTS "cashbackProcessed";

DROP TABLE IF EXISTS "AgentCashbackRedemption";
DROP TABLE IF EXISTS "CashbackRule";
DROP TABLE IF EXISTS "AgentWalletTransaction";
DROP TABLE IF EXISTS "CashbackTransaction";
*/

-- SUCCESS MESSAGE
-- Migration completed successfully!
-- All tables and columns have been created.
-- Now proceed with API implementation changes.

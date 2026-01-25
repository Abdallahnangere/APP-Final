-- Migration Script: Add Cashback Feature to Sauki Mart
-- Date: January 25, 2026
-- Description: Adds cashback functionality for agents with 2% rate on all product sales

-- Step 1: Add cashback-related columns to Agent table
ALTER TABLE "Agent" ADD COLUMN IF NOT EXISTS "cashbackBalance" DECIMAL(10,2) DEFAULT 0.0;
ALTER TABLE "Agent" ADD COLUMN IF NOT EXISTS "totalCashbackEarned" DECIMAL(10,2) DEFAULT 0.0;
ALTER TABLE "Agent" ADD COLUMN IF NOT EXISTS "cashbackRedeemed" DECIMAL(10,2) DEFAULT 0.0;
ALTER TABLE "Agent" ADD COLUMN IF NOT EXISTS "lastCashbackUpdate" TIMESTAMP;

-- Step 2: Create CashbackTransaction table for tracking all cashback activities
CREATE TABLE IF NOT EXISTS "CashbackTransaction" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "agentId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "originalTx_ref" TEXT,
  "amount" DECIMAL(10,2) NOT NULL,
  "description" TEXT,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL,
  CONSTRAINT "CashbackTransaction_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent" ("id") ON DELETE CASCADE
);

-- Step 3: Create CashbackRedemption table for tracking redemptions
CREATE TABLE IF NOT EXISTS "CashbackRedemption" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "agentId" TEXT NOT NULL,
  "amount" DECIMAL(10,2) NOT NULL,
  "method" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "bankAccountNumber" TEXT,
  "bankCode" TEXT,
  "bankName" TEXT,
  "accountName" TEXT,
  "reference" TEXT,
  "rejectionReason" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL,
  CONSTRAINT "CashbackRedemption_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent" ("id") ON DELETE CASCADE
);

-- Step 4: Create indexes for performance
CREATE INDEX IF NOT EXISTS "CashbackTransaction_agentId_idx" ON "CashbackTransaction"("agentId");
CREATE INDEX IF NOT EXISTS "CashbackTransaction_createdAt_idx" ON "CashbackTransaction"("createdAt");
CREATE INDEX IF NOT EXISTS "CashbackRedemption_agentId_idx" ON "CashbackRedemption"("agentId");
CREATE INDEX IF NOT EXISTS "CashbackRedemption_status_idx" ON "CashbackRedemption"("status");

-- Step 5: Add agent_transaction_track column to Transaction table for transaction tracking
ALTER TABLE "Transaction" ADD COLUMN IF NOT EXISTS "agentCashbackAmount" DECIMAL(10,2) DEFAULT 0.0;
ALTER TABLE "Transaction" ADD COLUMN IF NOT EXISTS "cashbackProcessed" BOOLEAN DEFAULT false;

-- Step 6: Create index for transaction tracking
CREATE INDEX IF NOT EXISTS "Transaction_agentId_status_idx" ON "Transaction"("agentId", "status");

-- Verification queries (run these to verify migration):
-- SELECT * FROM "Agent" LIMIT 1; -- Should show cashbackBalance, totalCashbackEarned, cashbackRedeemed, lastCashbackUpdate
-- SELECT * FROM "CashbackTransaction" LIMIT 1; -- Should return empty initially
-- SELECT * FROM "CashbackRedemption" LIMIT 1; -- Should return empty initially

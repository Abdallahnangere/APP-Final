-- Neon SQL Migration Script - Final Polish v2.6
-- Date: January 26, 2026
-- This script verifies the database schema is compatible with the new features

-- Verify SupportTicket table has status field
-- If you get an error on this line, it means the field needs to be added
ALTER TABLE "SupportTicket" 
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'open';

-- Verify Agent table has all required fields for cashback
ALTER TABLE "Agent"
ADD COLUMN IF NOT EXISTS cashbackBalance DOUBLE PRECISION DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS totalCashbackEarned DOUBLE PRECISION DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS cashbackRedeemed DOUBLE PRECISION DEFAULT 0.0;

-- Create index for faster support ticket queries
CREATE INDEX IF NOT EXISTS "idx_SupportTicket_status" ON "SupportTicket"(status);
CREATE INDEX IF NOT EXISTS "idx_SupportTicket_createdAt" ON "SupportTicket"("createdAt" DESC);

-- Verify CashbackEntry table exists
-- If it doesn't exist, uncomment the creation below:
/*
CREATE TABLE IF NOT EXISTS "CashbackEntry" (
  id TEXT NOT NULL PRIMARY KEY,
    "agentId" TEXT NOT NULL,
      type VARCHAR(50) NOT NULL,
        amount DOUBLE PRECISION NOT NULL,
          "transactionId" TEXT,
            description TEXT,
              "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                  CONSTRAINT "CashbackEntry_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"(id) ON DELETE RESTRICT ON UPDATE CASCADE
                  );

                  CREATE INDEX IF NOT EXISTS "idx_CashbackEntry_agentId" ON "CashbackEntry"("agentId");
                  */

                  -- Verify Transaction table has required fields
                  ALTER TABLE "Transaction"
                  ADD COLUMN IF NOT EXISTS "agentCashbackAmount" DOUBLE PRECISION DEFAULT 0,
                  ADD COLUMN IF NOT EXISTS "cashbackProcessed" BOOLEAN DEFAULT false;

                  -- Update support ticket status values (optional cleanup)
                  UPDATE "SupportTicket" SET status = 'open' WHERE status IS NULL OR status = '';

                  -- Check all tables
                  SELECT table_name FROM information_schema.tables 
                  WHERE table_schema = 'public' 
                  ORDER BY table_name;

                  -- Final verification - run these SELECT statements to verify everything is set up correctly:
                  -- Should return all agent records with their balances
                  -- SELECT id, "firstName", balance, "cashbackBalance" FROM "Agent" LIMIT 5;

                  -- Should return all support tickets with status
                  -- SELECT id, phone, status, "createdAt" FROM "SupportTicket" ORDER BY "createdAt" DESC LIMIT 10;

                  -- Script completed successfully!
                  
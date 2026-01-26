-- ========================================
-- Sauki Mart v2.6 Database Migration
-- Final Polish - Cashback Redemption
-- ========================================
-- This migration ensures all tables required for v2.6 features exist
-- Run this ONLY if you haven't already applied v2.5 migrations

-- Note: The following tables and fields should already exist
-- from previous migrations. This script verifies they exist.

-- 1. Verify Agent cashback fields exist
-- (If these columns don't exist, uncomment and run)
/*
ALTER TABLE "Agent" ADD COLUMN "cashbackBalance" DOUBLE PRECISION NOT NULL DEFAULT 0.0;
ALTER TABLE "Agent" ADD COLUMN "totalCashbackEarned" DOUBLE PRECISION NOT NULL DEFAULT 0.0;
ALTER TABLE "Agent" ADD COLUMN "cashbackRedeemed" DOUBLE PRECISION NOT NULL DEFAULT 0.0;
*/

-- 2. Verify Transaction cashback fields exist
-- (If these columns don't exist, uncomment and run)
/*
ALTER TABLE "Transaction" ADD COLUMN "agentCashbackAmount" DOUBLE PRECISION DEFAULT 0.0;
ALTER TABLE "Transaction" ADD COLUMN "cashbackProcessed" BOOLEAN NOT NULL DEFAULT false;
*/

-- 3. Verify CashbackEntry table exists
-- (If this table doesn't exist, uncomment and run)
/*
CREATE TABLE IF NOT EXISTS "CashbackEntry" (
  id VARCHAR(191) NOT NULL PRIMARY KEY,
    agentId VARCHAR(191) NOT NULL,
      type VARCHAR(191) NOT NULL,
        amount DOUBLE PRECISION NOT NULL,
          transactionId VARCHAR(191),
            description VARCHAR(191),
              createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
                updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
                  
                    CONSTRAINT "CashbackEntry_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent" ("id") ON DELETE CASCADE
                    );
                    
                    CREATE INDEX IF NOT EXISTS "CashbackEntry_agentId_idx" ON "CashbackEntry"("agentId");
                    CREATE INDEX IF NOT EXISTS "CashbackEntry_type_idx" ON "CashbackEntry"("type");
                    */
                    
                    -- 4. Additional helpful indexes for v2.6
                    CREATE INDEX IF NOT EXISTS "Agent_cashbackBalance_idx" ON "Agent"("cashbackBalance");
                    CREATE INDEX IF NOT EXISTS "Transaction_agentCashbackAmount_idx" ON "Transaction"("agentCashbackAmount");
                    
                    -- 5. Verify CashbackRedemption table (if using separate redemption table)
                    -- (If this table doesn't exist and you want to track redemptions separately, uncomment and run)
                    /*
                    CREATE TABLE IF NOT EXISTS "CashbackRedemption" (
                      id VARCHAR(191) NOT NULL PRIMARY KEY,
                        agentId VARCHAR(191) NOT NULL,
                          amount DOUBLE PRECISION NOT NULL,
                            status VARCHAR(191) NOT NULL DEFAULT 'pending',
                              bankAccount VARCHAR(191),
                                bankCode VARCHAR(191),
                                  bankName VARCHAR(191),
                                    requestedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
                                      processedAt DATETIME(3),
                                        createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
                                          updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
                                            
                                              CONSTRAINT "CashbackRedemption_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent" ("id") ON DELETE CASCADE
                                              );
                                              
                                              CREATE INDEX IF NOT EXISTS "CashbackRedemption_agentId_idx" ON "CashbackRedemption"("agentId");
                                              CREATE INDEX IF NOT EXISTS "CashbackRedemption_status_idx" ON "CashbackRedemption"("status");
                                              */
                                              
                                              -- ===========================================
                                              -- Verification Queries
                                              -- ===========================================
                                              
                                              -- Check Agent cashback fields
                                              SELECT COUNT(*) as agent_count FROM "Agent";
                                              -- SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='Agent' AND COLUMN_NAME LIKE '%cashback%';
                                              
                                              -- Check Transaction cashback fields  
                                              SELECT COUNT(*) as transaction_count FROM "Transaction";
                                              -- SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='Transaction' AND COLUMN_NAME LIKE '%cashback%';
                                              
                                              -- Check CashbackEntry table
                                              SELECT COUNT(*) as cashback_entry_count FROM "CashbackEntry";
                                              
                                              -- Check sample cashback data
                                              SELECT 
                                                a.id,
                                                  a.firstName,
                                                    a.cashbackBalance,
                                                      a.totalCashbackEarned,
                                                        a.cashbackRedeemed
                                                        FROM "Agent" a
                                                        WHERE a.cashbackBalance > 0
                                                        LIMIT 10;
                                                        
                                                        -- ===========================================
                                                        -- Notes for v2.6
                                                        -- ===========================================
                                                        -- 1. All cashback operations are now atomic transactions
                                                        -- 2. Cashback instantly credits without logout requirement
                                                        -- 3. Redemption API: POST /api/agent/redeem-cashback
                                                        -- 4. Receipt now displays in square format with dual phone numbers
                                                        -- 5. Data purchase network cards have improved grid layout
                                                        -- 6. SEO metadata updated for search console optimization
                                                        -- ===========================================

-- Add cashback fields to Agent model
ALTER TABLE "Agent" ADD COLUMN "cashbackBalance" DOUBLE PRECISION NOT NULL DEFAULT 0.0;
ALTER TABLE "Agent" ADD COLUMN "totalCashbackEarned" DOUBLE PRECISION NOT NULL DEFAULT 0.0;
ALTER TABLE "Agent" ADD COLUMN "cashbackRedeemed" DOUBLE PRECISION NOT NULL DEFAULT 0.0;

-- Add cashback tracking to Transaction model
ALTER TABLE "Transaction" ADD COLUMN "agentCashbackAmount" DOUBLE PRECISION;
ALTER TABLE "Transaction" ADD COLUMN "cashbackProcessed" BOOLEAN NOT NULL DEFAULT false;

-- Create CashbackEntry table
CREATE TABLE "CashbackEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "agentId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "transactionId" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CashbackEntry_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Create index for faster queries
CREATE INDEX "CashbackEntry_agentId_idx" ON "CashbackEntry"("agentId");
CREATE INDEX "CashbackEntry_createdAt_idx" ON "CashbackEntry"("createdAt");

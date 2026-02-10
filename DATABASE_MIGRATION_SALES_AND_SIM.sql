-- Sauki Mart - Comprehensive Database Migration Script
-- Date: February 10, 2026
-- Run this in Neon Editor

-- 1. Add TransactionCost table for profit tracking
CREATE TABLE IF NOT EXISTS "TransactionCost" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "transactionId" TEXT NOT NULL UNIQUE,
  "costPrice" FLOAT NOT NULL DEFAULT 0,
  "salePrice" FLOAT NOT NULL,
  "profit" FLOAT NOT NULL DEFAULT 0,
  "profitMargin" FLOAT NOT NULL DEFAULT 0,
  "itemType" TEXT NOT NULL DEFAULT 'product',
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE CASCADE
);

CREATE INDEX "TransactionCost_transactionId_idx" ON "TransactionCost"("transactionId");
CREATE INDEX "TransactionCost_createdAt_idx" ON "TransactionCost"("createdAt");

-- 2. Add AirtSIMProduct table for Airtel remote SIM activation products
CREATE TABLE IF NOT EXISTS "AirtSIMProduct" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "price" FLOAT NOT NULL,
  "dataPackage" TEXT,
  "validity" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "image" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE UNIQUE INDEX "AirtSIMProduct_name_idx" ON "AirtSIMProduct"("name");

-- 3. Add AirtSIMOrder table for SIM orders with image uploads
CREATE TABLE IF NOT EXISTS "AirtSIMOrder" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "orderRef" TEXT NOT NULL UNIQUE,
  "productId" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "customerName" TEXT NOT NULL,
  "email" TEXT,
  "imeiNumber" TEXT,
  "simFrontImageUrl" TEXT NOT NULL,
  "simBackImageUrl" TEXT NOT NULL,
  "price" FLOAT NOT NULL,
  "agentId" TEXT,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "transactionRef" TEXT,
  "admin_notes" TEXT,
  "estimatedActivationTime" TEXT DEFAULT '5 hours',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  FOREIGN KEY ("productId") REFERENCES "AirtSIMProduct"("id") ON DELETE RESTRICT,
  FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE SET NULL
);

CREATE INDEX "AirtSIMOrder_orderRef_idx" ON "AirtSIMOrder"("orderRef");
CREATE INDEX "AirtSIMOrder_status_idx" ON "AirtSIMOrder"("status");
CREATE INDEX "AirtSIMOrder_createdAt_idx" ON "AirtSIMOrder"("createdAt");
CREATE INDEX "AirtSIMOrder_agentId_idx" ON "AirtSIMOrder"("agentId");

-- 4. Create views for analytics

-- Daily Sales Summary View
CREATE OR REPLACE VIEW "DailySalesSummary" AS
SELECT 
  DATE(t."createdAt") as sale_date,
  COUNT(t."id") as total_transactions,
  COALESCE(SUM(t."amount"), 0) as total_sales,
  COALESCE(SUM(tc."profit"), 0) as total_profit,
  COALESCE(AVG(tc."profitMargin"), 0) as avg_profit_margin,
  COUNT(DISTINCT t."agentId") as unique_agents
FROM "Transaction" t
LEFT JOIN "TransactionCost" tc ON t."id" = tc."transactionId"
WHERE t."status" = 'success'
GROUP BY DATE(t."createdAt")
ORDER BY sale_date DESC;

-- Product Profitability View
CREATE OR REPLACE VIEW "ProductProfitability" AS
SELECT 
  p."id",
  p."name",
  COUNT(t."id") as sales_count,
  COALESCE(SUM(t."amount"), 0) as total_revenue,
  COALESCE(SUM(tc."costPrice" * COUNT(*)), 0) as total_cost,
  COALESCE(SUM(tc."profit"), 0) as total_profit,
  COALESCE(AVG(tc."profitMargin"), 0) as avg_margin
FROM "Product" p
LEFT JOIN "Transaction" t ON p."id" = t."productId"
LEFT JOIN "TransactionCost" tc ON t."id" = tc."transactionId"
WHERE t."status" = 'success'
GROUP BY p."id", p."name"
ORDER BY total_profit DESC;

-- 5. Insert default Airtel SIM Products (you can customize these)
INSERT INTO "AirtSIMProduct" (id, name, description, price, "dataPackage", validity, image, "isActive")
VALUES 
  (
    gen_random_uuid(),
    'Airtel Starter SIM',
    'Remote activation enabled. Includes 500MB data starter pack.',
    3000,
    '500MB',
    '7 days',
    '/airtel-sim-starter.png',
    true
  ),
  (
    gen_random_uuid(),
    'Airtel Standard SIM',
    'Remote activation enabled. Perfect for regular users.',
    5000,
    '2GB',
    '30 days',
    '/airtel-sim-standard.png',
    true
  ),
  (
    gen_random_uuid(),
    'Airtel Premium SIM',
    'Remote activation enabled. High-data package for power users.',
    8000,
    '5GB',
    '30 days',
    '/airtel-sim-premium.png',
    true
  )
ON CONFLICT DO NOTHING;

-- 6. Update existing Transaction table to support SIM orders
ALTER TABLE "Transaction" 
ADD COLUMN IF NOT EXISTS "simOrderId" TEXT,
ADD COLUMN IF NOT EXISTS "orderType" TEXT DEFAULT 'regular',
ADD CONSTRAINT "Transaction_simOrderId_fkey" FOREIGN KEY ("simOrderId") REFERENCES "AirtSIMOrder"("id") ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS "Transaction_simOrderId_idx" ON "Transaction"("simOrderId");
CREATE INDEX IF NOT EXISTS "Transaction_orderType_idx" ON "Transaction"("orderType");

-- Success confirmation
SELECT 'Migration completed successfully' as status;

-- Verify new tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('TransactionCost', 'AirtSIMProduct', 'AirtSIMOrder')
ORDER BY table_name;

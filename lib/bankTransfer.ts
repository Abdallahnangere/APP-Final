import sql from '@/lib/db';

export const BANK_TRANSFER_SERVICE_CHARGE = 200;
export const BANK_TRANSFER_MIN_AMOUNT = 100;
export const BANK_TRANSFER_MAX_AMOUNT = 1000000;
export const BANK_TRANSFER_DAILY_LIMIT = 5000000;
export const BANK_TRANSFER_HOURLY_LIMIT_COUNT = 5;

let schemaReady = false;

export async function ensureBankTransferSchema() {
  if (schemaReady) return;

  await sql`
    CREATE TABLE IF NOT EXISTS bank_transfers (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
      bank_code VARCHAR(20) NOT NULL,
      bank_name VARCHAR(120) NOT NULL,
      account_number VARCHAR(20) NOT NULL,
      account_name VARCHAR(180) NOT NULL,
      amount NUMERIC(14,2) NOT NULL,
      service_charge NUMERIC(14,2) NOT NULL DEFAULT 200,
      total_deducted NUMERIC(14,2) NOT NULL,
      narration TEXT,
      status VARCHAR(20) NOT NULL DEFAULT 'pending',
      flw_transfer_id VARCHAR(80),
      flw_reference VARCHAR(180),
      tx_reference VARCHAR(180) UNIQUE NOT NULL,
      flw_fee NUMERIC(14,2) DEFAULT 0,
      flw_response JSONB,
      error_message TEXT,
      refund_status VARCHAR(20) NOT NULL DEFAULT 'none',
      refunded_at TIMESTAMPTZ,
      refunded_by UUID REFERENCES users(id) ON DELETE SET NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      completed_at TIMESTAMPTZ
    )
  `;

  await sql`ALTER TABLE bank_transfers ADD COLUMN IF NOT EXISTS transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL`;
  await sql`ALTER TABLE bank_transfers ADD COLUMN IF NOT EXISTS flw_fee NUMERIC(14,2) DEFAULT 0`;
  await sql`ALTER TABLE bank_transfers ADD COLUMN IF NOT EXISTS refund_status VARCHAR(20) NOT NULL DEFAULT 'none'`;
  await sql`ALTER TABLE bank_transfers ADD COLUMN IF NOT EXISTS refunded_at TIMESTAMPTZ`;
  await sql`ALTER TABLE bank_transfers ADD COLUMN IF NOT EXISTS refunded_by UUID REFERENCES users(id) ON DELETE SET NULL`;

  await sql`CREATE INDEX IF NOT EXISTS idx_bank_transfer_user_created ON bank_transfers(user_id, created_at DESC)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_bank_transfer_status_created ON bank_transfers(status, created_at DESC)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_bank_transfer_refund_status ON bank_transfers(refund_status)`;

  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS bank_transfer_pin_failed_attempts INTEGER NOT NULL DEFAULT 0`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS bank_transfer_pin_locked_until TIMESTAMPTZ`;

  schemaReady = true;
}

export function mapTransferStatus(status: unknown): 'pending' | 'successful' | 'failed' {
  const raw = String(status || '').toUpperCase();
  if (raw === 'SUCCESSFUL') return 'successful';
  if (raw === 'FAILED') return 'failed';
  return 'pending';
}

export function normalizeTransferError(message: unknown) {
  const raw = String(message || '').trim();
  const lower = raw.toLowerCase();

  if (!raw) return 'Transfer failed. Please try again.';
  if (lower.includes('ip whitelisting')) return 'Transfer service is temporarily unavailable. Please try again shortly.';
  if (lower.includes('service unavailable')) return 'Transfer service is temporarily unavailable. Please try again shortly.';
  return raw;
}

import sql from '@/lib/db';
import {
  NIGERIAN_BANKS,
  MIN_TRANSFER_AMOUNT,
  MAX_TRANSFER_AMOUNT,
  DAILY_TRANSFER_LIMIT,
  calculateTransferFee,
} from '@/lib/nigerianBanks';

export type TransferStatus = 'pending' | 'successful' | 'failed';

export {
  NIGERIAN_BANKS,
  MIN_TRANSFER_AMOUNT,
  MAX_TRANSFER_AMOUNT,
  DAILY_TRANSFER_LIMIT,
  calculateTransferFee,
};

export function mapFlutterwaveTransferStatus(status: unknown): TransferStatus {
  const raw = String(status || '').toUpperCase();
  if (raw === 'SUCCESSFUL') return 'successful';
  if (raw === 'FAILED') return 'failed';
  return 'pending';
}

let schemaReady = false;

export async function ensureAdminTransfersSchema() {
  if (schemaReady) return;

  await sql`
    CREATE TABLE IF NOT EXISTS admin_transfers (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      bank_code VARCHAR(20) NOT NULL,
      bank_name VARCHAR(120) NOT NULL,
      account_number VARCHAR(20) NOT NULL,
      account_name VARCHAR(180) NOT NULL,
      amount NUMERIC(14,2) NOT NULL,
      transfer_fee NUMERIC(14,2) NOT NULL,
      total_deducted NUMERIC(14,2) NOT NULL,
      narration TEXT,
      status VARCHAR(20) NOT NULL DEFAULT 'pending',
      flw_transfer_id VARCHAR(80),
      flw_reference VARCHAR(180),
      tx_reference VARCHAR(180) UNIQUE NOT NULL,
      flw_response JSONB,
      error_message TEXT,
      admin_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      completed_at TIMESTAMPTZ
    )
  `;

  await sql`ALTER TABLE admin_transfers ADD COLUMN IF NOT EXISTS bank_code VARCHAR(20)`;
  await sql`ALTER TABLE admin_transfers ADD COLUMN IF NOT EXISTS bank_name VARCHAR(120)`;
  await sql`ALTER TABLE admin_transfers ADD COLUMN IF NOT EXISTS account_number VARCHAR(20)`;
  await sql`ALTER TABLE admin_transfers ADD COLUMN IF NOT EXISTS account_name VARCHAR(180)`;
  await sql`ALTER TABLE admin_transfers ADD COLUMN IF NOT EXISTS amount NUMERIC(14,2)`;
  await sql`ALTER TABLE admin_transfers ADD COLUMN IF NOT EXISTS transfer_fee NUMERIC(14,2)`;
  await sql`ALTER TABLE admin_transfers ADD COLUMN IF NOT EXISTS total_deducted NUMERIC(14,2)`;
  await sql`ALTER TABLE admin_transfers ADD COLUMN IF NOT EXISTS narration TEXT`;
  await sql`ALTER TABLE admin_transfers ADD COLUMN IF NOT EXISTS status VARCHAR(20)`;
  await sql`ALTER TABLE admin_transfers ADD COLUMN IF NOT EXISTS flw_transfer_id VARCHAR(80)`;
  await sql`ALTER TABLE admin_transfers ADD COLUMN IF NOT EXISTS flw_reference VARCHAR(180)`;
  await sql`ALTER TABLE admin_transfers ADD COLUMN IF NOT EXISTS tx_reference VARCHAR(180)`;
  await sql`ALTER TABLE admin_transfers ADD COLUMN IF NOT EXISTS flw_response JSONB`;
  await sql`ALTER TABLE admin_transfers ADD COLUMN IF NOT EXISTS error_message TEXT`;
  await sql`ALTER TABLE admin_transfers ADD COLUMN IF NOT EXISTS admin_user_id UUID REFERENCES users(id) ON DELETE SET NULL`;
  await sql`ALTER TABLE admin_transfers ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ`;

  await sql`CREATE UNIQUE INDEX IF NOT EXISTS idx_admin_transfers_tx_ref ON admin_transfers(tx_reference)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_admin_transfers_created ON admin_transfers(created_at DESC)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_admin_transfers_status ON admin_transfers(status)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_admin_transfers_bank ON admin_transfers(bank_name)`;

  schemaReady = true;
}

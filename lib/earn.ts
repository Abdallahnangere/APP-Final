import sql from '@/lib/db';

export const REFERRAL_TARGET_GB = 50;
export const REFERRAL_REWARD_AMOUNT = 2000;
export const MIN_WITHDRAWAL_AMOUNT = 1000;

const REFERRAL_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export async function ensureEarnSchema(): Promise<void> {
  await sql`
    CREATE TABLE IF NOT EXISTS withdrawals (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
      amount NUMERIC(12,2) NOT NULL,
      bank_code TEXT NOT NULL,
      bank_name TEXT NOT NULL,
      account_number TEXT NOT NULL,
      account_name TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      payout_reference TEXT,
      admin_note TEXT,
      processed_by TEXT,
      paid_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='referral_id') THEN
        ALTER TABLE users ADD COLUMN referral_id TEXT;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='referred_by') THEN
        ALTER TABLE users ADD COLUMN referred_by UUID REFERENCES users(id) ON DELETE SET NULL;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='referral_balance') THEN
        ALTER TABLE users ADD COLUMN referral_balance NUMERIC(12,2) DEFAULT 0;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='total_gb_purchased') THEN
        ALTER TABLE users ADD COLUMN total_gb_purchased NUMERIC(12,2) DEFAULT 0;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='referral_reward_earned') THEN
        ALTER TABLE users ADD COLUMN referral_reward_earned BOOLEAN DEFAULT FALSE;
      END IF;
    END $$;

    CREATE UNIQUE INDEX IF NOT EXISTS idx_users_referral_id_unique ON users(referral_id) WHERE referral_id IS NOT NULL;
    CREATE INDEX IF NOT EXISTS idx_users_referred_by ON users(referred_by);
    CREATE INDEX IF NOT EXISTS idx_withdrawals_user_created_at ON withdrawals(user_id, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_withdrawals_status_created_at ON withdrawals(status, created_at DESC);

    UPDATE users
    SET referral_balance = GREATEST(COALESCE(referral_balance, 0), COALESCE(referral_bonus, 0))
    WHERE COALESCE(referral_balance, 0) <> GREATEST(COALESCE(referral_balance, 0), COALESCE(referral_bonus, 0));
  `;
}

export function normalizeReferralCode(value: string | null | undefined): string {
  return String(value || '')
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase();
}

function randomReferralBody(length = 8): string {
  let out = '';
  for (let index = 0; index < length; index += 1) {
    const randomIndex = Math.floor(Math.random() * REFERRAL_ALPHABET.length);
    out += REFERRAL_ALPHABET[randomIndex];
  }
  return out;
}

export async function createUniqueReferralCode(): Promise<string> {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const code = `SM${randomReferralBody(8)}`;
    const [existing] = await sql`SELECT id FROM users WHERE referral_id = ${code} LIMIT 1`;
    if (!existing) return code;
  }

  throw new Error('Unable to generate referral code');
}

export async function ensureUserReferralCode(userId: string, existingCode?: string | null): Promise<string> {
  const normalized = normalizeReferralCode(existingCode);
  if (normalized) return normalized;

  for (let attempt = 0; attempt < 20; attempt += 1) {
    const code = await createUniqueReferralCode();
    const updated = await sql`
      UPDATE users
      SET referral_id = ${code}, updated_at = NOW()
      WHERE id = ${userId} AND referral_id IS NULL
      RETURNING referral_id
    `;

    if (updated.length > 0) return String(updated[0].referral_id || code);

    const [current] = await sql`SELECT referral_id FROM users WHERE id = ${userId} LIMIT 1`;
    if (current?.referral_id) return String(current.referral_id);
  }

  throw new Error('Unable to assign referral code');
}

export function parseDataSizeToGb(dataSize: string): number {
  const normalized = String(dataSize || '').trim().toUpperCase();
  const match = normalized.match(/(\d+(?:\.\d+)?)\s*(TB|GB|MB|KB)/);
  if (!match) return 0;

  const value = Number(match[1]);
  if (!Number.isFinite(value) || value <= 0) return 0;

  const unit = match[2];
  if (unit === 'TB') return value * 1024;
  if (unit === 'GB') return value;
  if (unit === 'MB') return value / 1024;
  if (unit === 'KB') return value / (1024 * 1024);
  return 0;
}

export function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}
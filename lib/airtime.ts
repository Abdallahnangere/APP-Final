import sql from '@/lib/db';

export type AirtimeNetwork = 'MTN' | 'Airtel' | 'GLO' | '9mobile';

export type AirtimeNetworkConfig = {
  networkCode: string;
  networkName: AirtimeNetwork;
  prefixes: string[];
  minAmount: number;
  maxAmount: number;
};

export const AIRTIME_SERVICE_CHARGE = 0; // No service charge for airtime
export const AIRTIME_MIN_AMOUNT = 50;
export const AIRTIME_MAX_AMOUNT = 50000;

export const AIRTIME_NETWORKS: AirtimeNetworkConfig[] = [
  {
    networkCode: 'AT1',
    networkName: 'MTN',
    prefixes: ['0703', '0706', '0703', '0706', '0810', '0813', '0814', '0816', '0906', '0913', '0914', '0916'],
    minAmount: 50,
    maxAmount: 50000,
  },
  {
    networkCode: 'AT2',
    networkName: 'Airtel',
    prefixes: ['0701', '0708', '0802', '0808', '0812', '0902', '0907', '0911'],
    minAmount: 50,
    maxAmount: 50000,
  },
  {
    networkCode: 'AT3',
    networkName: 'GLO',
    prefixes: ['0705', '0807', '0811', '0815', '0905', '0915'],
    minAmount: 50,
    maxAmount: 50000,
  },
  {
    networkCode: 'AT4',
    networkName: '9mobile',
    prefixes: ['0809', '0817', '0818', '0909', '0917', '0918'],
    minAmount: 50,
    maxAmount: 50000,
  },
];

let schemaEnsured = false;

export async function ensureAirtimeSchema() {
  if (schemaEnsured) return;

  await sql`
    CREATE TABLE IF NOT EXISTS airtime_transactions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
      network_code TEXT NOT NULL,
      network_name TEXT NOT NULL,
      phone_number TEXT NOT NULL,
      amount NUMERIC(12,2) NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      flw_reference TEXT,
      tx_reference TEXT UNIQUE,
      idempotency_key TEXT UNIQUE,
      flw_response JSONB,
      error_message TEXT,
      retry_attempts INTEGER NOT NULL DEFAULT 0,
      refunded BOOLEAN NOT NULL DEFAULT FALSE,
      refunded_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`ALTER TABLE airtime_transactions ADD COLUMN IF NOT EXISTS transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL`;
  await sql`ALTER TABLE airtime_transactions ADD COLUMN IF NOT EXISTS idempotency_key TEXT UNIQUE`;
  await sql`ALTER TABLE airtime_transactions ADD COLUMN IF NOT EXISTS flw_response JSONB`;
  await sql`ALTER TABLE airtime_transactions ADD COLUMN IF NOT EXISTS error_message TEXT`;
  await sql`ALTER TABLE airtime_transactions ADD COLUMN IF NOT EXISTS retry_attempts INTEGER NOT NULL DEFAULT 0`;
  await sql`ALTER TABLE airtime_transactions ADD COLUMN IF NOT EXISTS refunded BOOLEAN NOT NULL DEFAULT FALSE`;
  await sql`ALTER TABLE airtime_transactions ADD COLUMN IF NOT EXISTS refunded_at TIMESTAMPTZ`;

  await sql`CREATE INDEX IF NOT EXISTS idx_airtime_user_created ON airtime_transactions(user_id, created_at DESC)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_airtime_status_created ON airtime_transactions(status, created_at DESC)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_airtime_phone ON airtime_transactions(phone_number)`;

  schemaEnsured = true;
}

export function detectNetwork(phoneNumber: string): AirtimeNetwork | null {
  const cleaned = String(phoneNumber || '').trim();
  if (!/^\d{11}$/.test(cleaned) && !/^234\d{10}$/.test(cleaned)) return null;

  const prefix = cleaned.length === 11 ? cleaned.slice(0, 4) : cleaned.slice(3, 6);

  for (const net of AIRTIME_NETWORKS) {
    if (net.prefixes.includes(prefix)) {
      return net.networkName;
    }
  }

  return null;
}

export function getNetworkByName(name: AirtimeNetwork): AirtimeNetworkConfig | undefined {
  return AIRTIME_NETWORKS.find(n => n.networkName === name);
}

export function buildAirtimeTypeLabel(networkName: AirtimeNetwork, phoneNumber: string) {
  return `${networkName} Airtime for ${phoneNumber}`;
}

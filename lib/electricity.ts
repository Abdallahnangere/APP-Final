import sql from '@/lib/db';

export type ElectricityMeterType = 'prepaid' | 'postpaid';

export type ElectricityDisco = {
  itemCode: string;
  name: string;
  type: ElectricityMeterType;
};

export const ELECTRICITY_SERVICE_CHARGE = 100;
export const ELECTRICITY_MIN_AMOUNT = 1000;
export const ELECTRICITY_MAX_AMOUNT = 100000;

export const NIGERIA_DISCOS: ElectricityDisco[] = [
  { itemCode: 'AT099', name: 'Ikeja Electric (IKEDC)', type: 'prepaid' },
  { itemCode: 'AT100', name: 'Ikeja Electric (IKEDC)', type: 'postpaid' },
  { itemCode: 'AT094', name: 'Eko Electric (EKEDC)', type: 'prepaid' },
  { itemCode: 'AT095', name: 'Eko Electric (EKEDC)', type: 'postpaid' },
  { itemCode: 'AT102', name: 'Kano Electric (KEDCO)', type: 'prepaid' },
  { itemCode: 'AT103', name: 'Kano Electric (KEDCO)', type: 'postpaid' },
  { itemCode: 'AT104', name: 'Port Harcourt Electric (PHED)', type: 'prepaid' },
  { itemCode: 'AT105', name: 'Port Harcourt Electric (PHED)', type: 'postpaid' },
  { itemCode: 'AT106', name: 'Jos Electric (JED)', type: 'prepaid' },
  { itemCode: 'AT107', name: 'Jos Electric (JED)', type: 'postpaid' },
  { itemCode: 'AT108', name: 'Ibadan Electric (IBEDC)', type: 'prepaid' },
  { itemCode: 'AT109', name: 'Ibadan Electric (IBEDC)', type: 'postpaid' },
  { itemCode: 'AT110', name: 'Kaduna Electric (KAEDCO)', type: 'prepaid' },
  { itemCode: 'AT111', name: 'Kaduna Electric (KAEDCO)', type: 'postpaid' },
  { itemCode: 'AT112', name: 'Abuja Electric (AEDC)', type: 'prepaid' },
  { itemCode: 'AT113', name: 'Abuja Electric (AEDC)', type: 'postpaid' },
  { itemCode: 'AT114', name: 'Enugu Electric (EEDC)', type: 'prepaid' },
  { itemCode: 'AT115', name: 'Enugu Electric (EEDC)', type: 'postpaid' },
  { itemCode: 'AT116', name: 'Benin Electric (BEDC)', type: 'prepaid' },
  { itemCode: 'AT117', name: 'Benin Electric (BEDC)', type: 'postpaid' },
];

let schemaEnsured = false;

export async function ensureElectricitySchema() {
  if (schemaEnsured) return;

  await sql`
    CREATE TABLE IF NOT EXISTS electricity_transactions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
      disco_name TEXT NOT NULL,
      disco_code TEXT NOT NULL,
      meter_number TEXT NOT NULL,
      meter_type TEXT NOT NULL,
      customer_name TEXT,
      amount NUMERIC(12,2) NOT NULL,
      service_charge NUMERIC(12,2) NOT NULL DEFAULT 100,
      total_amount NUMERIC(12,2) NOT NULL,
      token TEXT,
      units TEXT,
      phone_number TEXT,
      email TEXT,
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

  await sql`ALTER TABLE electricity_transactions ADD COLUMN IF NOT EXISTS transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL`;
  await sql`ALTER TABLE electricity_transactions ADD COLUMN IF NOT EXISTS service_charge NUMERIC(12,2) NOT NULL DEFAULT 100`;
  await sql`ALTER TABLE electricity_transactions ADD COLUMN IF NOT EXISTS total_amount NUMERIC(12,2) NOT NULL DEFAULT 0`;
  await sql`ALTER TABLE electricity_transactions ADD COLUMN IF NOT EXISTS idempotency_key TEXT UNIQUE`;
  await sql`ALTER TABLE electricity_transactions ADD COLUMN IF NOT EXISTS flw_response JSONB`;
  await sql`ALTER TABLE electricity_transactions ADD COLUMN IF NOT EXISTS error_message TEXT`;
  await sql`ALTER TABLE electricity_transactions ADD COLUMN IF NOT EXISTS retry_attempts INTEGER NOT NULL DEFAULT 0`;
  await sql`ALTER TABLE electricity_transactions ADD COLUMN IF NOT EXISTS refunded BOOLEAN NOT NULL DEFAULT FALSE`;
  await sql`ALTER TABLE electricity_transactions ADD COLUMN IF NOT EXISTS refunded_at TIMESTAMPTZ`;
  await sql`ALTER TABLE electricity_transactions ADD COLUMN IF NOT EXISTS email TEXT`;

  await sql`CREATE INDEX IF NOT EXISTS idx_electricity_user_created ON electricity_transactions(user_id, created_at DESC)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_electricity_status_created ON electricity_transactions(status, created_at DESC)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_electricity_meter ON electricity_transactions(meter_number)`;

  schemaEnsured = true;
}

export function normalizeMeterType(value: unknown): ElectricityMeterType | null {
  const raw = String(value || '').trim().toLowerCase();
  if (raw === 'prepaid' || raw === 'postpaid') return raw;
  return null;
}

export function buildElectricityTypeLabel(discoName: string, meterType: ElectricityMeterType) {
  return `${discoName} ${meterType === 'prepaid' ? 'Prepaid' : 'Postpaid'}`;
}
